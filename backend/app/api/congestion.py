from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.congestion_service import CongestionService

router = APIRouter(
    prefix="/congestion",
    tags=["Congestion Intelligence"],
)

@router.get("/alerts")
def alerts(db: Session = Depends(get_db)):

    return CongestionService.traffic_alerts(db)


@router.get("/peak-hours/{route_id}")
def peak_hours(route_id: int, db: Session = Depends(get_db)):

    result = CongestionService.peak_hours(db, route_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Forecast not available."
        )

    return result

@router.get("/{route_id}")
def congestion(route_id: int, db: Session = Depends(get_db)):

    result = CongestionService.predict_congestion(
        db,
        route_id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Forecast not available.",
        )

    return result

