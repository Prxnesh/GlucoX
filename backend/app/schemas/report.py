from datetime import datetime

from pydantic import BaseModel


class ReportExtractionResponse(BaseModel):
    id: str
    glucose: float | None = None
    hba1c: float | None = None
    cholesterol: float | None = None
    raw_text: str
    insights: list[str]
    created_at: datetime

