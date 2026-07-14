from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.traffic_record import TrafficRecord
from app.models.route import Route
from app.models.forecast import Forecast


class AnalyticsService:

    @staticmethod
    def hourly(db: Session, route_id: int):

        data = (
            db.query(
                extract("hour", TrafficRecord.timestamp).label("hour"),
                func.avg(TrafficRecord.vehicle_count).label("vehicle_count"),
            )
            .filter(TrafficRecord.route_id == route_id)
            .group_by(extract("hour", TrafficRecord.timestamp))
            .order_by(extract("hour", TrafficRecord.timestamp))
            .all()
        )

        return [
            {
                "hour": int(row.hour),
                "average_vehicle_count": round(row.vehicle_count, 2),
            }
            for row in data
        ]
    

    @staticmethod
    def daily(db: Session, route_id: int):

        data = (
            db.query(
                func.date(TrafficRecord.timestamp).label("date"),
                func.avg(TrafficRecord.vehicle_count).label("vehicle_count"),
                func.avg(TrafficRecord.average_speed).label("speed"),
                func.avg(TrafficRecord.congestion_level).label("congestion"),
            )
            .filter(TrafficRecord.route_id == route_id)
            .group_by(func.date(TrafficRecord.timestamp))
            .order_by(func.date(TrafficRecord.timestamp))
            .all()
        )

        return [
            {
                "date": str(row.date),
                "average_vehicle_count": round(row.vehicle_count, 2),
                "average_speed": round(row.speed, 2),
                "average_congestion": round(row.congestion, 2),
            }
            for row in data
        ]
    

    @staticmethod
    def congestion_trend(db: Session, route_id: int):

        data = (
            db.query(
                func.date(TrafficRecord.timestamp).label("date"),
                func.avg(TrafficRecord.congestion_level).label("congestion")
            )
            .filter(TrafficRecord.route_id == route_id)
            .group_by(func.date(TrafficRecord.timestamp))
            .order_by(func.date(TrafficRecord.timestamp))
            .all()
        )

        return [
            {
                "date": str(row.date),
                "average_congestion": round(row.congestion, 2)
            }
            for row in data
        ]
    
    @staticmethod
    def weather_impact(db: Session, route_id: int):

        data = (
            db.query(
                TrafficRecord.weather,
                func.avg(TrafficRecord.vehicle_count).label("vehicles"),
                func.avg(TrafficRecord.average_speed).label("speed"),
                func.avg(TrafficRecord.congestion_level).label("congestion")
            )
            .filter(TrafficRecord.route_id == route_id)
            .group_by(TrafficRecord.weather)
            .all()
        )

        return [
            {
                "weather": row.weather,
                "average_vehicle_count": round(row.vehicles, 2),
                "average_speed": round(row.speed, 2),
                "average_congestion": round(row.congestion, 2)
            }
            for row in data
        ]
    

    @staticmethod
    def route_comparison(db: Session):

        data = (
            db.query(
                Route.route_name,
                Route.route_code,
                func.avg(TrafficRecord.vehicle_count).label("vehicles"),
                func.avg(TrafficRecord.average_speed).label("speed"),
                func.avg(TrafficRecord.congestion_level).label("congestion")
            )
            .join(TrafficRecord, Route.id == TrafficRecord.route_id)
            .group_by(Route.id)
            .order_by(func.avg(TrafficRecord.congestion_level).desc())
            .all()
        )

        return [
            {
                "route": row.route_name,
                "route_code": row.route_code,
                "average_vehicle_count": round(row.vehicles, 2),
                "average_speed": round(row.speed, 2),
                "average_congestion": round(row.congestion, 2)
            }
            for row in data
        ]
    

    @staticmethod
    def peak_hours(db: Session, route_id: int):

        data = (
            db.query(
                extract("hour", TrafficRecord.timestamp).label("hour"),
                func.avg(TrafficRecord.vehicle_count).label("vehicles"),
                func.avg(TrafficRecord.average_speed).label("speed"),
                func.avg(TrafficRecord.congestion_level).label("congestion")
            )
            .filter(TrafficRecord.route_id == route_id)
            .group_by(extract("hour", TrafficRecord.timestamp))
            .order_by(func.avg(TrafficRecord.vehicle_count).desc())
            .all()
        )

        return [
            {
                "hour": int(row.hour),
                "average_vehicle_count": round(row.vehicles, 2),
                "average_speed": round(row.speed, 2),
                "average_congestion": round(row.congestion, 2)
            }
            for row in data
        ]
    


    @staticmethod
    def forecast_vs_actual(db: Session, route_id: int):

        forecasts = (
            db.query(Forecast)
            .filter(Forecast.route_id == route_id)
            .order_by(Forecast.forecast_time)
            .all()
        )

        results = []

        for forecast in forecasts:

            actual = (
                db.query(TrafficRecord)
                .filter(
                    TrafficRecord.route_id == route_id,
                    TrafficRecord.timestamp == forecast.forecast_time
                )
                .first()
            )

            results.append({
                "timestamp": forecast.forecast_time,
                "predicted": forecast.predicted_vehicle_count,
                "actual": actual.vehicle_count if actual else None
            })

        return results