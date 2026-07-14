from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)

    route_id = Column(
        Integer,
        ForeignKey("routes.id"),
        nullable=False
    )

    scenario_type = Column(String(100))

    predicted_vehicle_count = Column(Integer)

    predicted_speed = Column(Float)

    predicted_congestion = Column(Float)

    predicted_delay = Column(Float)

    travel_time = Column(Float)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    route = relationship(
        "Route",
        back_populates="simulations"
    )