from sqlalchemy.orm import Session

from app.models.route import Route
from app.models.traffic_record import TrafficRecord
from app.models.simulation import Simulation


class SimulationService:

    @staticmethod
    def run(db: Session, route_id: int, scenario: str):

        route = db.query(Route).filter(Route.id == route_id).first()

        if not route:
            return {"message": "Route not found"}

        latest = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .order_by(TrafficRecord.timestamp.desc())
            .first()
        )

        if not latest:
            return {"message": "No traffic data found"}

        vehicle_count = latest.vehicle_count
        speed = latest.average_speed
        congestion = latest.congestion_level

        scenario = scenario.lower()

        if scenario == "heavy rain":
            vehicle_count *= 1.20
            speed *= 0.70
            congestion *= 1.20

        elif scenario == "accident":
            vehicle_count *= 1.40
            speed *= 0.55
            congestion *= 1.35

        elif scenario == "road work":
            vehicle_count *= 1.30
            speed *= 0.75
            congestion *= 1.25

        elif scenario == "festival":
            vehicle_count *= 1.50
            speed *= 0.65
            congestion *= 1.30

        elif scenario == "vip movement":
            vehicle_count *= 1.25
            speed *= 0.80
            congestion *= 1.15

        delay = max(0, congestion - 40)

        travel_time = (route.distance_km / max(speed, 5)) * 60

        if congestion >= 90:
            recommendation = "Avoid this route"

        elif congestion >= 70:
            recommendation = "Use alternate route"

        elif congestion >= 50:
            recommendation = "Travel with caution"

        else:
            recommendation = "Traffic is normal"

        simulation = Simulation(
            route_id=route.id,
            scenario_type=scenario.title(),
            predicted_vehicle_count=int(vehicle_count),
            predicted_speed=round(speed, 2),
            predicted_congestion=round(congestion, 2),
            predicted_delay=round(delay, 2),
            travel_time=round(travel_time, 2),
        )

        db.add(simulation)
        db.commit()

        return {
            "route": route.route_name,
            "scenario": scenario.title(),
            "predicted_vehicle_count": int(vehicle_count),
            "predicted_speed": round(speed, 2),
            "predicted_congestion": round(congestion, 2),
            "estimated_delay_minutes": round(delay, 2),
            "travel_time_minutes": round(travel_time, 2),
            "recommendation": recommendation,
        }

    @staticmethod
    def history(db: Session, route_id: int):

        simulations = (
            db.query(Simulation)
            .filter(Simulation.route_id == route_id)
            .order_by(Simulation.created_at.desc())
            .all()
        )

        return simulations