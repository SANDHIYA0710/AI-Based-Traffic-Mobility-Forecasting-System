from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DatasetResponse(BaseModel):
    id: int
    file_name: str
    total_records: int
    status: str
    uploaded_by: int | None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)