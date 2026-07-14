import pandas as pd


class DataPreprocessor:

    @staticmethod
    def prepare_prophet_data(df: pd.DataFrame):

        data = df.copy()

        data["timestamp"] = pd.to_datetime(data["timestamp"])

        data = data.sort_values("timestamp")

        data = data.rename(
            columns={
                "timestamp": "ds",
                "vehicle_count": "y",
            }
        )

        return data[["ds", "y"]]