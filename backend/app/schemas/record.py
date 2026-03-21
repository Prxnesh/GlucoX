from datetime import datetime

from pydantic import BaseModel

from app.schemas.prediction import PredictionResponse, RiskCategory
from app.schemas.report import ReportExtractionResponse


class HealthRecordResponse(BaseModel):
    id: str
    recorded_at: datetime
    source: str
    risk_score: float
    category: RiskCategory
    glucose: float | None = None
    hba1c: float | None = None
    cholesterol: float | None = None
    bmi: float | None = None
    blood_pressure: float | None = None
    insulin: float | None = None
    age: int | None = None
    insights: list[str]


class DashboardResponse(BaseModel):
    latest_prediction: PredictionResponse | None
    records: list[HealthRecordResponse]
    reports: list[ReportExtractionResponse]

