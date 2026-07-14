from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.optimization_service import OptimizationService

router = APIRouter(
    prefix="/optimization",
    tags=["Mobility Optimization"],
)


@router.get("/alternative-routes/{route_id}")
def alternative_routes(route_id: int, db: Session = Depends(get_db)):

    result = OptimizationService.alternative_routes(db, route_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Route not found.")

    return result


@router.get("/best-travel-time/{route_id}")
def best_travel_time(route_id: int, db: Session = Depends(get_db)):

    result = OptimizationService.best_travel_time(db, route_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found or model not trained.",
        )

    return result


@router.get("/load-balancing")
def load_balancing(db: Session = Depends(get_db)):
    return OptimizationService.load_balancing(db)
