from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RouteCreate(BaseModel):
    route_code: str
    route_name: str
    start_location: str
    end_location: str
    distance_km: float
    city: str


class RouteUpdate(BaseModel):
    route_name: str
    start_location: str
    end_location: str
    distance_km: float
    city: str
    is_active: bool


class RouteResponse(BaseModel):
    id: int
    route_code: str
    route_name: str
    start_location: str
    end_location: str
    distance_km: float
    city: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)