from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.forecast_service import ForecastService

router = APIRouter(
    prefix="/forecast",
    tags=["Traffic Forecasting"],
)


@router.post("/train/{route_id}")
def train(route_id: int, db: Session = Depends(get_db)):

    total = ForecastService.train_model(
        db,
        route_id,
    )

    if total is None:
        raise HTTPException(
            status_code=400,
            detail="Minimum 30 traffic records required.",
        )

    return {
        "message": "Model trained successfully.",
        "route_id": route_id,
        "total_records": total,
    }


@router.get("/24hours/{route_id}")
def forecast_24(
    route_id: int,
    db: Session = Depends(get_db)
):

    result = ForecastService.predict(
        db=db,
        route_id=route_id,
        periods=24
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Model not trained."
        )

    return result


@router.get("/7days/{route_id}")
def forecast_7_days(
    route_id: int,
    db: Session = Depends(get_db)
):

    result = ForecastService.predict(
        db=db,
        route_id=route_id,
        periods=24 * 7
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Model not trained."
        )

    return result