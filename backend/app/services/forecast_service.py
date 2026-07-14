import pandas as pd
from sqlalchemy.orm import Session

from app.ml.model_manager import ModelManager
from app.ml.preprocessing import DataPreprocessor
from app.ml.prophet_model import ProphetModel
from app.models.traffic_record import TrafficRecord
from app.models.forecast import Forecast
from app.core.exceptions import AppException


class ForecastService:

    @staticmethod
    def train_model(db: Session, route_id: int):

        records = (
            db.query(TrafficRecord)
            .filter(TrafficRecord.route_id == route_id)
            .order_by(TrafficRecord.timestamp)
            .all()
        )

        if len(records) < 30:
            raise AppException(
                message="At least 30 traffic records are required for training.",
                status_code=400
            )

        df = pd.DataFrame(
            [
                {
                    "timestamp": r.timestamp,
                    "vehicle_count": r.vehicle_count,
                }
                for r in records
            ]
        )

        df = DataPreprocessor.prepare_prophet_data(df)

        model = ProphetModel.build()

        model.fit(df)

        ModelManager.save(model, route_id)

        return len(df)

    @staticmethod
    def predict(db: Session, route_id: int, periods: int):

        model = ModelManager.load(route_id)

        if model is None:
            raise AppException(
                message="Model not trained. Please train the model first.",
                status_code=404
            )
        
        db.query(Forecast).filter(
            Forecast.route_id == route_id
        ).delete()

        db.commit()

        future = model.make_future_dataframe(
            periods=periods,
            freq="h"
        )

        forecast = model.predict(future)

        forecast["yhat"] = forecast["yhat"].clip(lower=0)

        results = []

        for _, row in forecast.tail(periods).iterrows():

            vehicle_count = round(float(row["yhat"]), 2)

            prediction = Forecast(
                route_id=route_id,
                forecast_time=row["ds"],
                predicted_vehicle_count=vehicle_count,
                predicted_speed=max(20, 60 - vehicle_count / 15),
                predicted_congestion=min(vehicle_count / 7, 100),
                confidence_score=95.0
            )

            db.add(prediction)

            results.append({
                "timestamp": row["ds"],
                "predicted_vehicle_count": vehicle_count
            })

        db.commit()

        return results