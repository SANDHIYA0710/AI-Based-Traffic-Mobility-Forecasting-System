from pydantic import BaseModel


class SimulationRequest(BaseModel):
    scenario: str


class SimulationResponse(BaseModel):
    route: str
    scenario: str
    predicted_vehicle_count: int
    predicted_speed: float
    predicted_congestion: float
    estimated_delay_minutes: float
    recommendation: str