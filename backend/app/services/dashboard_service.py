from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.route import Route
from app.models.traffic_record import TrafficRecord
from app.models.simulation import Simulation


class DashboardService:

    @staticmethod
    def get_dashboard(db: Session):

        total_routes = db.query(Route).count()

        total_records = db.query(TrafficRecord).count()

        total_simulations = db.query(Simulation).count()

        avg_speed = (
            db.query(func.avg(TrafficRecord.average_speed))
            .scalar() or 0
        )

        avg_congestion = (
            db.query(func.avg(TrafficRecord.congestion_level))
            .scalar() or 0
        )

        total_vehicle_count = (
            db.query(func.sum(TrafficRecord.vehicle_count))
            .scalar() or 0
        )

        latest_record = (
            db.query(TrafficRecord)
            .order_by(TrafficRecord.timestamp.desc())
            .first()
        )

        latest_simulation = (
            db.query(Simulation)
            .order_by(Simulation.created_at.desc())
            .first()
        )

        return {
            "total_routes": total_routes,
            "total_records": total_records,
            "total_simulations": total_simulations,
            "average_speed": round(avg_speed, 2),
            "average_congestion": round(avg_congestion, 2),
            "total_vehicle_count": total_vehicle_count,
            "latest_record": (
                latest_record.timestamp if latest_record else None
            ),
            "last_simulation": (
                latest_simulation.created_at if latest_simulation else None
            ),
        }