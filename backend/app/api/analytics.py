from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics_service import AnalyticsService
from app.services.model_accuracy_service import ModelAccuracyService

router = APIRouter(
    prefix="/analytics",
    tags=["Performance Analytics"],
)


@router.get("/hourly/{route_id}")
def hourly(route_id: int, db: Session = Depends(get_db)):
    return AnalyticsService.hourly(db, route_id)

@router.get("/daily/{route_id}")
def daily(route_id: int, db: Session = Depends(get_db)):
    return AnalyticsService.daily(db, route_id)

@router.get("/congestion-trend/{route_id}")
def congestion_trend(
    route_id: int,
    db: Session = Depends(get_db)
):
    return AnalyticsService.congestion_trend(db, route_id)  

@router.get("/peak-hours/{route_id}")
def peak_hours(
    route_id: int,
    db: Session = Depends(get_db)
):
    return AnalyticsService.peak_hours(db, route_id)  

@router.get("/weather-impact/{route_id}")
def weather_impact(
    route_id: int,
    db: Session = Depends(get_db)
):
    return AnalyticsService.weather_impact(db, route_id) 

@router.get("/route-comparison")
def route_comparison(
    db: Session = Depends(get_db)
):
    return AnalyticsService.route_comparison(db)

@router.get("/forecast-vs-actual/{route_id}")
def forecast_vs_actual(
    route_id: int,
    db: Session = Depends(get_db)
):
    return AnalyticsService.forecast_vs_actual(db, route_id)

@router.get("/model-accuracy/{route_id}")
def model_accuracy(
    route_id: int,
    db: Session = Depends(get_db),
):
    return ModelAccuracyService.evaluate(
        db,
        route_id,
    )