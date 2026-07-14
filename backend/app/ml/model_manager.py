import joblib
from pathlib import Path

MODEL_DIR = Path("trained_models")
MODEL_DIR.mkdir(exist_ok=True)


class ModelManager:

    @staticmethod
    def save(model, route_id):

        path = MODEL_DIR / f"route_{route_id}.pkl"

        joblib.dump(model, path)

    @staticmethod
    def load(route_id):

        path = MODEL_DIR / f"route_{route_id}.pkl"

        if not path.exists():
            return None

        return joblib.load(path)