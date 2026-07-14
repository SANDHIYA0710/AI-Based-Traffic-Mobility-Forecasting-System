from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)

    route_code = Column(String(50), unique=True, nullable=False)

    route_name = Column(String(150), nullable=False)

    start_location = Column(String(150), nullable=False)

    end_location = Column(String(150), nullable=False)

    distance_km = Column(Float, nullable=False)

    city = Column(String(100), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    traffic_records = relationship(
        "TrafficRecord",
        back_populates="route",
        cascade="all, delete-orphan"
    )

    forecasts = relationship(
        "Forecast",
        back_populates="route",
        cascade="all, delete-orphan"
    )

    anomalies = relationship(
        "Anomaly",
        back_populates="route",
        cascade="all, delete-orphan"
    )

    simulations = relationship(
        "Simulation",
        back_populates="route",
        cascade="all, delete-orphan"
    )