from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.database import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)

    route_id = Column(
        Integer,
        ForeignKey("routes.id"),
        nullable=False
    )

    forecast_time = Column(DateTime)

    predicted_vehicle_count = Column(Integer)

    predicted_speed = Column(Float)

    predicted_congestion = Column(Float)

    confidence_score = Column(Float)

    route = relationship(
        "Route",
        back_populates="forecasts"
    )