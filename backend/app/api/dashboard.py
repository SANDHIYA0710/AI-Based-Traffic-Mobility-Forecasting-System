from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Executive Dashboard"],
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
):
    return DashboardService.get_dashboard(db)