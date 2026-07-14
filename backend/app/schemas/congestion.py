from pydantic import BaseModel


class CongestionResponse(BaseModel):
    route_id: int
    predicted_vehicle_count: float
    average_speed: float
    congestion_level: float
    status: str
    risk: str