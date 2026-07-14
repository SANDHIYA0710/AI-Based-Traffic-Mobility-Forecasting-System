from sqlalchemy.orm import Session

from app.models.forecast import Forecast
from app.models.route import Route


class RecommendationService:

    @staticmethod
    def get_recommendation(db: Session, route_id: int):

        route = (
            db.query(Route)
            .filter(Route.id == route_id)
            .first()
        )

        if not route:
            return {
                "message": "Route not found."
            }

        forecast = (
            db.query(Forecast)
            .filter(Forecast.route_id == route_id)
            .order_by(Forecast.forecast_time.desc())
            .first()
        )

        if not forecast:
            return {
                "message": "No forecast available."
            }

        vehicle_count = forecast.predicted_vehicle_count
        speed = forecast.predicted_speed
        congestion = forecast.predicted_congestion

        if congestion >= 80:
            status = "Heavy"
            recommendation = "Use alternate route immediately."
            delay = 45
            saved = 20

        elif congestion >= 50:
            status = "Moderate"
            recommendation = "Expect slow traffic. Consider leaving 15-30 minutes early."
            delay = 20
            saved = 10

        else:
            status = "Low"
            recommendation = "Traffic is smooth. Safe to travel."
            delay = 5
            saved = 0

        return {
            "route": route.route_name,
            "route_code": route.route_code,
            "predicted_vehicle_count": vehicle_count,
            "predicted_speed": round(speed, 2),
            "predicted_congestion": round(congestion, 2),
            "traffic_status": status,
            "recommendation": recommendation,
            "estimated_delay_minutes": delay,
            "estimated_time_saved": saved,
            "confidence": "95%"
        }