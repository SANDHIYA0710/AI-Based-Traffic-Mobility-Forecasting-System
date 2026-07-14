from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.live_service import LiveService

router = APIRouter(
    prefix="/live",
    tags=["Real-Time Monitoring"]
)


@router.get("/overview")
def live_overview(db: Session = Depends(get_db)):
    return LiveService.overview(db)

@router.get("/routes")
def live_routes(db: Session = Depends(get_db)):
    return LiveService.routes(db)

@router.get("/critical-routes")
def critical_routes(db: Session = Depends(get_db)):
    return LiveService.critical_routes(db)

@router.get("/traffic-status")
def traffic_status(db: Session = Depends(get_db)):
    return LiveService.traffic_status(db)