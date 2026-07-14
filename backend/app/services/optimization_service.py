from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.forecast import Forecast
from app.models.route import Route
from app.models.traffic_record import TrafficRecord
from app.services.forecast_service import ForecastService


class OptimizationService:

    @staticmethod
    def _average_congestion(db: Session, route_id: int):
        return (
            db.query(func.avg(TrafficRecord.congestion_level))
            .filter(TrafficRecord.route_id == route_id)
            .scalar()
        )

    @staticmethod
    def alternative_routes(db: Session, route_id: int):

        route = db.query(Route).filter(Route.id == route_id).first()

        if not route:
            return None

        current_avg = OptimizationService._average_congestion(db, route_id)

        if current_avg is None:
            return {
                "route": route.route_name,
                "message": "No traffic data available for this route.",
            }

        candidates = (
            db.query(Route)
            .filter(
                Route.city == route.city,
                Route.id != route_id,
                Route.is_active.is_(True),
            )
            .all()
        )

        alternatives = []

        for candidate in candidates:

            avg_cong = OptimizationService._average_congestion(db, candidate.id)

            if avg_cong is None or avg_cong >= current_avg:
                continue

            time_saved_pct = round(
                (current_avg - avg_cong) / current_avg * 100, 2
            )

            alternatives.append({
                "route_id": candidate.id,
                "route": candidate.route_name,
                "route_code": candidate.route_code,
                "distance_km": candidate.distance_km,
                "average_congestion": round(avg_cong, 2),
                "estimated_time_saved_percentage": time_saved_pct,
            })

        alternatives.sort(key=lambda x: x["average_congestion"])

        return {
            "route": route.route_name,
            "route_code": route.route_code,
            "current_average_congestion": round(current_avg, 2),
            "alternatives": alternatives[:3],
            "message": (
                "No better alternative route found in the same city."
                if not alternatives
                else f"Found {len(alternatives)} better alternative route(s)."
            ),
        }

    @staticmethod
    def best_travel_time(db: Session, route_id: int):

        route = db.query(Route).filter(Route.id == route_id).first()

        if not route:
            return None

        try:
            ForecastService.predict(db, route_id, 24)
        except AppException:
            return None

        forecasts = (
            db.query(Forecast)
            .filter(Forecast.route_id == route_id)
            .order_by(Forecast.forecast_time)
            .all()
        )

        if not forecasts:
            return None

        best = min(forecasts, key=lambda f: f.predicted_congestion)
        worst = max(forecasts, key=lambda f: f.predicted_congestion)

        time_saved_pct = 0.0

        if worst.predicted_congestion:
            time_saved_pct = round(
                (worst.predicted_congestion - best.predicted_congestion)
                / worst.predicted_congestion
                * 100,
                2,
            )

        return {
            "route": route.route_name,
            "route_code": route.route_code,
            "best_travel_time": best.forecast_time,
            "predicted_congestion_at_best_time": round(
                best.predicted_congestion, 2
            ),
            "worst_travel_time": worst.forecast_time,
            "predicted_congestion_at_worst_time": round(
                worst.predicted_congestion, 2
            ),
            "estimated_time_saved_percentage": time_saved_pct,
            "recommendation": (
                f"Travel around {best.forecast_time.strftime('%I:%M %p')} "
                f"to reduce congestion by approximately {time_saved_pct}%."
            ),
        }

    @staticmethod
    def load_balancing(db: Session):

        routes = db.query(Route).filter(Route.is_active.is_(True)).all()

        stats = []

        for route in routes:

            avg_cong = OptimizationService._average_congestion(db, route.id)

            if avg_cong is None:
                continue

            stats.append((route, avg_cong))

        if not stats:
            return {"message": "No traffic data available."}

        overloaded = [(r, c) for r, c in stats if c >= 70]
        underutilized = [(r, c) for r, c in stats if c < 40]
        balanced = [(r, c) for r, c in stats if 40 <= c < 70]

        suggestions = []

        for route, congestion in overloaded:

            same_city = [
                (r, c) for r, c in underutilized if r.city == route.city
            ]

            target_pool = same_city or underutilized

            if not target_pool:
                continue

            target_route, target_congestion = min(
                target_pool, key=lambda x: x[1]
            )

            suggestions.append({
                "from_route": route.route_name,
                "from_route_code": route.route_code,
                "from_average_congestion": round(congestion, 2),
                "suggested_route": target_route.route_name,
                "suggested_route_code": target_route.route_code,
                "suggested_average_congestion": round(target_congestion, 2),
                "message": (
                    f"Redirect a portion of traffic from {route.route_name} "
                    f"to {target_route.route_name} to balance network load."
                ),
            })

        def _serialize(pairs):
            return [
                {
                    "route_id": r.id,
                    "route": r.route_name,
                    "route_code": r.route_code,
                    "average_congestion": round(c, 2),
                }
                for r, c in pairs
            ]

        return {
            "overloaded_routes": _serialize(overloaded),
            "balanced_routes": _serialize(balanced),
            "underutilized_routes": _serialize(underutilized),
            "load_balancing_suggestions": suggestions,
        }
