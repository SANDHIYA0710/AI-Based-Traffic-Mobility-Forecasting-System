import pandas as pd

from sqlalchemy.orm import Session

from app.models.traffic_record import TrafficRecord
from app.ml.isolation_forest import IsolationForestModel


class AnomalyService:

    @staticmethod
    def detect(db: Session, route_id: int):

        records = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .order_by(TrafficRecord.timestamp)
            .all()
        )

        if len(records) < 20:
            return []

        df = pd.DataFrame(
            [{
                "timestamp": r.timestamp,
                "vehicle_count": r.vehicle_count
            } for r in records]
        )

        df = IsolationForestModel.detect(df)

        anomalies = []

        for _, row in df.iterrows():

            if row["anomaly"] == -1:

                if row["vehicle_count"] > df["vehicle_count"].mean():
                    reason = "Traffic Spike"
                else:
                    reason = "Unexpected Low Traffic"

                anomalies.append({
                    "timestamp": row["timestamp"],
                    "vehicle_count": int(row["vehicle_count"]),
                    "status": "Anomaly",
                    "reason": reason
                })

        return anomalies
    
    @staticmethod
    def summary(db: Session, route_id: int):

        records = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .all()
        )

        if len(records) < 20:
            return None

        df = pd.DataFrame(
            [{
                "vehicle_count": r.vehicle_count
                } for r in records]
        )

        df = IsolationForestModel.detect(df)

        anomalies = len(df[df["anomaly"] == -1])

        normal = len(df[df["anomaly"] == 1])

        return {
            "total_records": len(df),
            "normal_records": normal,
            "anomalies": anomalies,
            "anomaly_percentage": round(anomalies / len(df) * 100, 2)
        }