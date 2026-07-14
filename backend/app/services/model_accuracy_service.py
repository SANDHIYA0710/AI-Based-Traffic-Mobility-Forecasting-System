import pandas as pd

from math import sqrt
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
)
from sqlalchemy.orm import Session

from app.ml.model_manager import ModelManager
from app.ml.preprocessing import DataPreprocessor
from app.models.traffic_record import TrafficRecord


class ModelAccuracyService:

    @staticmethod
    def evaluate(db: Session, route_id: int):

        records = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .order_by(TrafficRecord.timestamp)
            .all()
        )

        if len(records) < 30:
            return {
                "message": "Not enough records."
            }

        df = pd.DataFrame([
            {
                "timestamp": r.timestamp,
                "vehicle_count": r.vehicle_count
            }
            for r in records
        ])

        prophet_df = DataPreprocessor.prepare_prophet_data(df)

        model = ModelManager.load(route_id)

        if model is None:
            return {
                "message": "Model not trained."
            }

        forecast = model.predict(prophet_df[["ds"]])

        actual = prophet_df["y"].tolist()
        predicted = forecast["yhat"].clip(lower=0).tolist()

        mae = mean_absolute_error(actual, predicted)

        rmse = sqrt(
            mean_squared_error(actual, predicted)
        )

        mape = (
            mean_absolute_percentage_error(
                actual,
                predicted
            ) * 100
        )

        accuracy = max(0, 100 - mape)

        return {
            "route_id": route_id,
            "total_samples": len(actual),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2),
            "accuracy": round(accuracy, 2)
        }