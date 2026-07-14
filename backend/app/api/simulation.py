from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.simulation import SimulationRequest
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["Traffic Simulation"])


@router.post("/run/{route_id}")
def run_simulation(
    route_id: int,
    request: SimulationRequest,
    db: Session = Depends(get_db),
):
    return SimulationService.run(
        db,
        route_id,
        request.scenario,
    )


@router.get("/history/{route_id}")
def simulation_history(
    route_id: int,
    db: Session = Depends(get_db),
):
    return SimulationService.history(
        db,
        route_id,
    )