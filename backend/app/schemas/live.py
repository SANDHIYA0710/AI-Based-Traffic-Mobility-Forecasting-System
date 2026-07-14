from pydantic import BaseModel


class LiveOverviewResponse(BaseModel):
    active_routes: int
    total_records: int
    heavy_traffic_routes: int
    moderate_traffic_routes: int
    low_traffic_routes: int
    latest_update: str