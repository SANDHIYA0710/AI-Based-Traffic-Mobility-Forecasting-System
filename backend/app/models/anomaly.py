from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)

    route_id = Column(
        Integer,
        ForeignKey("routes.id"),
        nullable=False
    )

    timestamp = Column(DateTime)

    vehicle_count = Column(Integer)

    average_speed = Column(Float)

    congestion_level = Column(Float)

    anomaly_score = Column(Float)

    anomaly_type = Column(String(100))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    route = relationship(
        "Route",
        back_populates="anomalies"
    )