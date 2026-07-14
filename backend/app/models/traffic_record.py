from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class TrafficRecord(Base):
    __tablename__ = "traffic_records"

    id = Column(Integer, primary_key=True, index=True)

    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)

    timestamp = Column(DateTime, nullable=False)

    vehicle_count = Column(Integer, nullable=False)

    average_speed = Column(Float, nullable=False)

    congestion_level = Column(Float, nullable=False)

    weather = Column(String(50), nullable=True)

    temperature = Column(Float, nullable=True)

    rainfall = Column(Float, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    route = relationship(
        "Route",
        back_populates="traffic_records"
    )