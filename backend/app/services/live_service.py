from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.route import Route
from app.models.traffic_record import TrafficRecord
from sqlalchemy import desc


class LiveService:

    @staticmethod
    def overview(db: Session):

        total_routes = db.query(Route).count()

        total_records = db.query(TrafficRecord).count()

        latest = (
            db.query(TrafficRecord)
            .order_by(TrafficRecord.timestamp.desc())
            .first()
        )

        heavy = (
            db.query(TrafficRecord.route_id)
            .filter(TrafficRecord.congestion_level >= 70)
            .distinct()
            .count()
        )

        moderate = (
            db.query(TrafficRecord.route_id)
            .filter(
                TrafficRecord.congestion_level >= 40,
                TrafficRecord.congestion_level < 70
            )
            .distinct()
            .count()
        )

        low = (
            db.query(TrafficRecord.route_id)
            .filter(TrafficRecord.congestion_level < 40)
            .distinct()
            .count()
        )

        return {
            "active_routes": total_routes,
            "total_records": total_records,
            "heavy_traffic_routes": heavy,
            "moderate_traffic_routes": moderate,
            "low_traffic_routes": low,
            "latest_update": latest.timestamp if latest else None
        }
    


    @staticmethod
    def routes(db: Session):

        routes = db.query(Route).all()

        results = []

        for route in routes:

            latest = (
                db.query(TrafficRecord)
                .filter(TrafficRecord.route_id == route.id)
                .order_by(desc(TrafficRecord.timestamp))
                .first()
            )

            if latest is None:
                continue

            if latest.congestion_level >= 70:
                status = "Heavy"

            elif latest.congestion_level >= 40:
                status = "Moderate"

            else:
                status = "Low"

            results.append({
                "route_id": route.id,
                "route": route.route_name,
                "route_code": route.route_code,
                "vehicle_count": latest.vehicle_count,
                "average_speed": latest.average_speed,
                "congestion_level": latest.congestion_level,
                "traffic_status": status,
                "last_updated": latest.timestamp
            })

        return results
    
    @staticmethod
    def critical_routes(db: Session):

        routes = db.query(Route).all()

        results = []

        for route in routes:

            latest = (
                db.query(TrafficRecord)
                .filter(TrafficRecord.route_id == route.id)
                .order_by(desc(TrafficRecord.timestamp))
                .first()
            )

            if latest is None:
                continue

            if latest.congestion_level >= 70:

                results.append({
                    "route_id": route.id,
                    "route": route.route_name,
                    "route_code": route.route_code,
                    "vehicle_count": latest.vehicle_count,
                    "average_speed": latest.average_speed,
                    "congestion_level": latest.congestion_level,
                    "severity": "Critical",
                    "recommendation": "Use alternate route immediately",
                    "last_updated": latest.timestamp
                })

        return results
    
    @staticmethod
    def traffic_status(db: Session):

        routes = db.query(Route).all()

        heavy = 0
        moderate = 0
        low = 0

        latest_time = None

        for route in routes:

            latest = (
                db.query(TrafficRecord)
                .filter(TrafficRecord.route_id == route.id)
                .order_by(TrafficRecord.timestamp.desc())
                .first()
            )

            if latest is None:
                continue

            latest_time = latest.timestamp

            if latest.congestion_level >= 70:
                heavy += 1

            elif latest.congestion_level >= 40:
                moderate += 1

            else:
                low += 1

        if heavy >= 2:
            status = "Critical"
            recommendation = "Avoid major routes. Use alternate roads."

        elif heavy == 1 or moderate >= 2:
            status = "Moderate"
            recommendation = "Expect delays during peak hours."

        else:
            status = "Normal"
            recommendation = "Traffic conditions are smooth."

        return {
            "overall_status": status,
            "heavy_routes": heavy,
            "moderate_routes": moderate,
            "low_routes": low,
            "recommendation": recommendation,
            "last_updated": latest_time
        }