from pathlib import Path
import shutil

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.dataset_service import DatasetService
from app.utils.validators import validate_columns

import pandas as pd

router = APIRouter(
    prefix="/datasets",
    tags=["Traffic Data Management"]
    
)


UPLOAD_DIR = "uploads"

Path(UPLOAD_DIR).mkdir(exist_ok=True)


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are allowed.")

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    df = pd.read_csv(file_path)

    missing = validate_columns(df)

    if missing:
        raise HTTPException(
            400,
            detail=f"Missing columns: {missing}",
        )

    return DatasetService.upload_dataset(
        db,
        file_path,
        file.filename,
        current_user.id,
    )