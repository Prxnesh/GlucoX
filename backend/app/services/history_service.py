from app.schemas.prediction import PredictionResponse
from app.schemas.record import DashboardResponse, HealthRecordResponse
from app.schemas.report import ReportExtractionResponse
from app.prisma_client.fields import Json
from app.utils.database import db


async def create_health_record(
    *,
    user_id: str,
    source: str,
    risk_score: float,
    category: str,
    confidence: float | None,
    age: int | None,
    bmi: float | None,
    glucose: float | None,
    blood_pressure: float | None,
    insulin: float | None,
    family_history: bool | None,
    hba1c: float | None,
    cholesterol: float | None,
    insights: list[str],
    report_id: str | None = None,
):
    record_data = {
        "user": {"connect": {"id": user_id}},
        "source": source,
        "riskScore": risk_score,
        "category": category,
        "confidence": confidence,
        "age": age,
        "bmi": bmi,
        "glucose": glucose,
        "bloodPressure": blood_pressure,
        "insulin": insulin,
        "familyHistory": family_history,
        "hba1c": hba1c,
        "cholesterol": cholesterol,
        "insights": Json(insights),
    }

    if report_id:
        record_data["report"] = {"connect": {"id": report_id}}

    return await db.healthrecord.create(
        data=record_data
    )


async def build_dashboard_snapshot(user_id: str) -> DashboardResponse:
    records = await db.healthrecord.find_many(
        where={"userId": user_id},
        order={"recordedAt": "desc"},
    )
    reports = await db.reportextraction.find_many(
        where={"userId": user_id},
        order={"createdAt": "desc"},
        take=6,
    )

    latest_prediction_record = next((record for record in records if record.source == "prediction"), None)

    return DashboardResponse(
        latest_prediction=(
            PredictionResponse(
                risk_score=latest_prediction_record.riskScore,
                category=latest_prediction_record.category,
                confidence=latest_prediction_record.confidence or 0.0,
                insights=list(latest_prediction_record.insights),
                record_id=latest_prediction_record.id,
                created_at=latest_prediction_record.recordedAt,
            )
            if latest_prediction_record
            else None
        ),
        records=[
            HealthRecordResponse(
                id=record.id,
                recorded_at=record.recordedAt,
                source=record.source,
                risk_score=record.riskScore,
                category=record.category,
                glucose=record.glucose,
                hba1c=record.hba1c,
                cholesterol=record.cholesterol,
                bmi=record.bmi,
                blood_pressure=record.bloodPressure,
                insulin=record.insulin,
                age=record.age,
                insights=list(record.insights),
            )
            for record in records
        ],
        reports=[
            ReportExtractionResponse(
                id=report.id,
                glucose=report.glucose,
                hba1c=report.hba1c,
                cholesterol=report.cholesterol,
                raw_text=report.rawText,
                insights=list(report.insights),
                created_at=report.createdAt,
            )
            for report in reports
        ],
    )

