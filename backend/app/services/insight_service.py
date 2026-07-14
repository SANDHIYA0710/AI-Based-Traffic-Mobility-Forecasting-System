from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.traffic_record import TrafficRecord
from app.models.route import Route


class InsightService:

    @staticmethod
    def generate(db: Session, route_id: int):

        route = (
            db.query(Route)
            .filter(Route.id == route_id)
            .first()
        )

        if not route:
            return {"message": "Route not found"}

        stats = (
            db.query(
                func.avg(TrafficRecord.vehicle_count),
                func.avg(TrafficRecord.average_speed),
                func.avg(TrafficRecord.congestion_level),
                func.max(TrafficRecord.vehicle_count),
                func.min(TrafficRecord.vehicle_count)
            )
            .filter(TrafficRecord.route_id == route_id)
            .first()
        )

        avg_vehicle = round(stats[0], 2)
        avg_speed = round(stats[1], 2)
        avg_congestion = round(stats[2], 2)
        max_vehicle = stats[3]
        min_vehicle = stats[4]

        if avg_congestion >= 75:
            insight = (
                "Heavy congestion observed. Consider alternate routes "
                "during peak hours."
            )

        elif avg_congestion >= 50:
            insight = (
                "Moderate congestion. Traffic management is recommended "
                "during rush hours."
            )

        else:
            insight = (
                "Traffic flow is smooth with minimal congestion."
            )

        return {
            "route": route.route_name,
            "route_code": route.route_code,
            "average_vehicle_count": avg_vehicle,
            "average_speed": avg_speed,
            "average_congestion": avg_congestion,
            "maximum_vehicle_count": max_vehicle,
            "minimum_vehicle_count": min_vehicle,
            "ai_insight": insight
        }