import pandas as pd

from app.schemas.auth import CurrentUser
from app.schemas.prediction import PredictionInput, PredictionResponse
from app.services.explainability_service import build_prediction_drivers
from app.services.history_service import create_health_record
from app.services.insight_service import build_prediction_insights
from app.services.model_service import load_model_bundle


def categorize_risk(risk_score: float) -> str:
    if risk_score >= 70:
        return "high"
    if risk_score >= 35:
        return "medium"
    return "low"


async def predict_and_store(user: CurrentUser, payload: PredictionInput) -> PredictionResponse:
    bundle = load_model_bundle()
    pipeline = bundle["pipeline"]

    frame = pd.DataFrame(
        [
            {
                "age": payload.age,
                "bmi": payload.bmi,
                "glucose": payload.glucose,
                "blood_pressure": payload.blood_pressure,
                "insulin": payload.insulin,
                "family_history": int(payload.family_history),
            }
        ]
    )
    probability = float(pipeline.predict_proba(frame)[0][1])
    risk_score = round(probability * 100, 1)
    category = categorize_risk(risk_score)
    confidence = round(max(probability, 1 - probability), 3)
    insights = build_prediction_insights(payload, risk_score, category)
    drivers = build_prediction_drivers(
        bundle,
        {
            "age": payload.age,
            "bmi": payload.bmi,
            "glucose": payload.glucose,
            "blood_pressure": payload.blood_pressure,
            "insulin": payload.insulin,
            "family_history": payload.family_history,
        },
        probability,
    )

    record = await create_health_record(
        user_id=user.id,
        source="prediction",
        risk_score=risk_score,
        category=category,
        confidence=confidence,
        age=payload.age,
        bmi=payload.bmi,
        glucose=payload.glucose,
        blood_pressure=payload.blood_pressure,
        insulin=payload.insulin,
        family_history=payload.family_history,
        hba1c=None,
        cholesterol=None,
        insights=insights,
    )

    return PredictionResponse(
        risk_score=risk_score,
        category=category,
        confidence=confidence,
        insights=insights,
        drivers=drivers,
        record_id=record.id,
        created_at=record.recordedAt,
    )
