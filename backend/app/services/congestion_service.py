import pandas as pd

from sqlalchemy.orm import Session

from app.services.forecast_service import ForecastService
from app.models.route import Route
from app.models.traffic_record import TrafficRecord
from app.core.exceptions import AppException


class CongestionService:

    @staticmethod
    def predict_congestion(db: Session, route_id: int):

        try:
            forecast = ForecastService.predict(db, route_id, 24)
        except AppException:
            return None

        if not forecast:
            return None

        latest = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .order_by(TrafficRecord.timestamp.desc())
            .first()
        )

        if latest is None:
            return None

        predicted = forecast[0]["predicted_vehicle_count"]

        speed = latest.average_speed

        congestion = latest.congestion_level

        if predicted >= 600:
            status = "High Congestion"
            risk = "High"

        elif predicted >= 350:
            status = "Moderate Congestion"
            risk = "Medium"

        else:
            status = "Low Congestion"
            risk = "Low"

        return {
            "route_id": route_id,
            "predicted_vehicle_count": round(predicted, 2),
            "average_speed": round(speed, 2),
            "congestion_level": round(congestion, 2),
            "status": status,
            "risk": risk,
        }
    

    @staticmethod
    def peak_hours(db: Session, route_id: int):

        try:
            forecast = ForecastService.predict(db, route_id, 24)
        except AppException:
            return None

        if not forecast:
            return None

        forecast = sorted(
            forecast,
            key=lambda x: x["predicted_vehicle_count"],
            reverse=True,
        )

        return forecast[:5]
    
    @staticmethod
    def traffic_alerts(db: Session):

        routes = db.query(Route).all()

        alerts = []

        for route in routes:

            try:
                forecast = ForecastService.predict(db, route.id, 24)
            except AppException:
                continue

            if not forecast:
                continue

            for item in forecast:

                count = item["predicted_vehicle_count"]

                if count >= 600:

                    alerts.append({
                        "route": route.route_name,
                        "route_code": route.route_code,
                        "timestamp": item["timestamp"],
                        "message": f"High congestion expected on {route.route_name}",
                        "severity": "High",
                        "predicted_vehicle_count": round(count, 2)
                    })

        return alerts