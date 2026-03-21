from app.schemas.prediction import PredictionInput


def build_prediction_insights(payload: PredictionInput, risk_score: float, category: str) -> list[str]:
    insights: list[str] = []

    if category == "high":
        insights.append(
            "Your current profile leans high risk. It would be wise to review these readings with a clinician soon, especially if they reflect a fasting test."
        )
    elif category == "medium":
        insights.append(
            "Your risk sits in the watch zone. Small shifts in nutrition, movement, sleep, and follow-up testing could make a meaningful difference."
        )
    else:
        insights.append(
            "Your current profile trends on the lower-risk side. Keeping routines stable and rechecking over time is the best way to stay ahead."
        )

    if payload.glucose >= 140:
        insights.append(
            "Glucose is elevated enough to deserve attention. If this was not a fasting reading, compare it with the timing of your last meal."
        )
    if payload.bmi >= 30:
        insights.append(
            "BMI is currently in a range that can raise insulin resistance. Even moderate weight changes can improve metabolic markers."
        )
    if payload.family_history:
        insights.append(
            "Family history can increase baseline risk, so consistent screening matters more even when symptoms are absent."
        )

    return insights


def build_report_insights(glucose: float | None, hba1c: float | None, cholesterol: float | None) -> list[str]:
    insights: list[str] = []

    if hba1c is not None:
        if hba1c >= 6.5:
            insights.append(
                "HbA1c is in a range commonly associated with diabetes. A medical review can help confirm the result and map out next steps."
            )
        elif hba1c >= 5.7:
            insights.append(
                "HbA1c is edging above the ideal range. This can signal prediabetes and is a strong reason to monitor trends closely."
            )

    if glucose is not None:
        if glucose >= 200:
            insights.append(
                "Glucose is in a critical range. If this aligns with symptoms like thirst, fatigue, or frequent urination, prompt care is important."
            )
        elif glucose >= 140:
            insights.append(
                "Glucose is above the typical target range. Repeating the test under the same conditions can help confirm whether this is persistent."
            )

    if cholesterol is not None and cholesterol >= 200:
        insights.append(
            "Cholesterol is elevated, which can add cardiovascular strain on top of blood sugar concerns. It may be worth discussing a heart-health plan alongside glucose management."
        )

    if not insights:
        insights.append(
            "These extracted lab values look relatively steady. Keep collecting reports over time so subtle shifts are easier to spot early."
        )

    return insights

