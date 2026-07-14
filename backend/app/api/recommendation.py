from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendation",
    tags=["AI Recommendation"]
)


@router.get("/{route_id}")
def get_recommendation(
    route_id: int,
    db: Session = Depends(get_db)
):
    return RecommendationService.get_recommendation(
        db,
        route_id
    )