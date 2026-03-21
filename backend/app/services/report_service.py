from fastapi import UploadFile

from app.ocr.extractor import extract_metrics, extract_text_from_upload
from app.schemas.auth import CurrentUser
from app.schemas.report import ReportExtractionResponse
from app.services.history_service import create_health_record
from app.services.insight_service import build_report_insights
from app.utils.database import db


def heuristic_risk(glucose: float | None, hba1c: float | None, cholesterol: float | None) -> tuple[float, str]:
    risk = 12.0
    if glucose is not None:
        risk += 20 if glucose >= 140 else 8 if glucose >= 100 else 0
        risk += 18 if glucose >= 200 else 0
    if hba1c is not None:
        risk += 20 if hba1c >= 5.7 else 0
        risk += 20 if hba1c >= 6.5 else 0
    if cholesterol is not None:
        risk += 8 if cholesterol >= 200 else 0
        risk += 7 if cholesterol >= 240 else 0
    risk = min(risk, 95.0)
    if risk >= 70:
        return risk, "high"
    if risk >= 35:
        return risk, "medium"
    return risk, "low"


async def analyze_and_store_report(user: CurrentUser, file: UploadFile) -> ReportExtractionResponse:
    raw_text = await extract_text_from_upload(file)
    glucose, hba1c, cholesterol = extract_metrics(raw_text)
    insights = build_report_insights(glucose, hba1c, cholesterol)

    report = await db.reportextraction.create(
        data={
            "userId": user.id,
            "rawText": raw_text,
            "glucose": glucose,
            "hba1c": hba1c,
            "cholesterol": cholesterol,
            "insights": insights,
        }
    )

    risk_score, category = heuristic_risk(glucose, hba1c, cholesterol)
    await create_health_record(
        user_id=user.id,
        source="report",
        risk_score=risk_score,
        category=category,
        confidence=None,
        age=None,
        bmi=None,
        glucose=glucose,
        blood_pressure=None,
        insulin=None,
        family_history=None,
        hba1c=hba1c,
        cholesterol=cholesterol,
        insights=insights,
        report_id=report.id,
    )

    return ReportExtractionResponse(
        id=report.id,
        glucose=report.glucose,
        hba1c=report.hba1c,
        cholesterol=report.cholesterol,
        raw_text=report.rawText,
        insights=list(report.insights),
        created_at=report.createdAt,
    )

