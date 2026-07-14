from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.anomaly_service import AnomalyService

router = APIRouter(
    prefix="/anomaly",
    tags=["Traffic Anomaly Detection"],
)


@router.get("/detect/{route_id}")
def detect(route_id: int, db: Session = Depends(get_db)):
    return AnomalyService.detect(db, route_id)


@router.get("/summary/{route_id}")
def summary(route_id: int, db: Session = Depends(get_db)):
    return AnomalyService.summary(db, route_id)