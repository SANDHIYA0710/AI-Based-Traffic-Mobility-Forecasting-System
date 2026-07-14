from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.insight_service import InsightService

router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"]
)


@router.get("/{route_id}")
def insights(route_id: int, db: Session = Depends(get_db)):
    return InsightService.generate(db, route_id)