from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.route import (
    RouteCreate,
    RouteUpdate,
    RouteResponse,
)
from app.services.route_service import RouteService

router = APIRouter(
    prefix="/routes",
    tags=["Route Management"],
)


@router.post("", response_model=RouteResponse)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    existing = RouteService.get_by_code(db, route.route_code)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Route code already exists",
        )

    return RouteService.create(db, route)


@router.get("", response_model=list[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    return RouteService.get_all(db)


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db)):
    route = RouteService.get_by_id(db, route_id)

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    return route


@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int,
    route_data: RouteUpdate,
    db: Session = Depends(get_db),
):
    route = RouteService.update(db, route_id, route_data)

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    return route


@router.delete("/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    deleted = RouteService.delete(db, route_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    return {"message": "Route deleted successfully"}