from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


RiskCategory = Literal["low", "medium", "high"]


class PredictionInput(BaseModel):
    age: int = Field(ge=10, le=120)
    bmi: float = Field(ge=10, le=70)
    glucose: float = Field(ge=40, le=500)
    blood_pressure: float = Field(ge=40, le=240)
    insulin: float = Field(ge=0, le=900)
    family_history: bool


class PredictionDriver(BaseModel):
    feature: str
    label: str
    contribution: float
    direction: Literal["up", "down", "neutral"]
    detail: str


class PredictionResponse(BaseModel):
    risk_score: float
    category: RiskCategory
    confidence: float
    insights: list[str]
    drivers: list[PredictionDriver] = Field(default_factory=list)
    record_id: str | None = None
    created_at: datetime | None = None

