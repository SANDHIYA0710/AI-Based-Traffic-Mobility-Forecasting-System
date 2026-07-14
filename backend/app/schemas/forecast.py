from datetime import datetime
from pydantic import BaseModel


class ForecastResponse(BaseModel):
    timestamp: datetime
    predicted_vehicle_count: float


class TrainResponse(BaseModel):
    message: str
    route_id: int
    total_records: int