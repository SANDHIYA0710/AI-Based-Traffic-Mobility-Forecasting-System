from sklearn.ensemble import IsolationForest
import pandas as pd


class IsolationForestModel:

    @staticmethod
    def detect(df: pd.DataFrame):

        model = IsolationForest(
            contamination=0.05,
            random_state=42
        )

        df["anomaly"] = model.fit_predict(df[["vehicle_count"]])

        return df