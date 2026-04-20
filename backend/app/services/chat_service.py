import asyncio
import json
from datetime import datetime
from urllib import error, request

from app.schemas.auth import CurrentUser
from app.schemas.chat import ChatMessage, ChatRequest, ChatResponse
from app.utils.config import get_settings
from app.utils.database import db

# This module handles the core logic for generating AI-driven chat responses in the GlucoX app

settings = get_settings()

MAX_CONTEXT_RECORDS = 10
MAX_CONTEXT_REPORTS = 4
MAX_PROFILE_FACTS = 10
MAX_HISTORY_MESSAGES = 10


def _titleize_key(value: str) -> str:
    return value.replace("_", " ").strip().capitalize()


def _compact_whitespace(value: str) -> str:
    return " ".join(value.split())


def _format_timestamp(value: datetime | None) -> str:
    if value is None:
        return "unknown time"
    return value.strftime("%b %d, %Y")


def _format_metric(label: str, value: float | None, unit: str = "") -> str | None:
    if value is None:
        return None
    suffix = f" {unit}" if unit else ""
    return f"{label} {value:.1f}{suffix}"


def _sanitize_messages(messages: list[ChatMessage]) -> list[dict[str, str]]:
    cleaned: list[dict[str, str]] = []

    for message in messages[-MAX_HISTORY_MESSAGES:]:
        content = _compact_whitespace(message.content)
        if not content:
            continue
        cleaned.append({"role": message.role, "content": content[:4000]})

    if not cleaned:
        raise ValueError("Add a question before starting the chat.")

    return cleaned


def _summarize_lifestyle_profile(profile: dict[str, str]) -> list[str]:
    facts: list[str] = []

    for key, value in profile.items():
        normalized = _compact_whitespace(value)
        if not normalized:
            continue
        facts.append(f"{_titleize_key(key)}: {normalized}")

    return facts[:MAX_PROFILE_FACTS]


def _build_context_summary(
    user: CurrentUser,
    records: list[object],
    reports: list[object],
    lifestyle_facts: list[str],
) -> list[str]:
    summary: list[str] = [f"Signed in as {user.name}."]

    latest_prediction = next((record for record in records if record.source == "prediction"), None)
    if latest_prediction:
        summary.append(
            "Latest prediction on "
            f"{_format_timestamp(latest_prediction.recordedAt)}: "
            f"{latest_prediction.riskScore:.1f}% {latest_prediction.category} risk"
            + (
                f" with {latest_prediction.confidence:.2f} confidence."
                if latest_prediction.confidence is not None
                else "."
            )
        )

    latest_record = records[0] if records else None
    if latest_record:
        metrics = [
            _format_metric("glucose", latest_record.glucose, "mg/dL"),
            _format_metric("HbA1c", latest_record.hba1c, "%"),
            _format_metric("cholesterol", latest_record.cholesterol, "mg/dL"),
            _format_metric("BMI", latest_record.bmi),
            _format_metric("blood pressure", latest_record.bloodPressure),
        ]
        metric_text = ", ".join(metric for metric in metrics if metric)
        if metric_text:
            summary.append(
                f"Latest stored health record from {_format_timestamp(latest_record.recordedAt)} includes {metric_text}."
            )

    if records:
        avg_risk = sum(record.riskScore for record in records) / len(records)
        high_risk_count = len([record for record in records if record.category == "high"])
        summary.append(
            f"Recent history includes {len(records)} records with an average risk score of {avg_risk:.1f}%; "
            f"{high_risk_count} were tagged high risk."
        )
    else:
        summary.append("No saved prediction history is available yet.")

    if reports:
        latest_report = reports[0]
        report_bits = [
            _format_metric("glucose", latest_report.glucose, "mg/dL"),
            _format_metric("HbA1c", latest_report.hba1c, "%"),
            _format_metric("cholesterol", latest_report.cholesterol, "mg/dL"),
        ]
        report_text = ", ".join(bit for bit in report_bits if bit)
        summary.append(
            "Latest lab report from "
            f"{_format_timestamp(latest_report.createdAt)}"
            + (f" extracted {report_text}." if report_text else " had no parsable biomarker values.")
        )
    else:
        summary.append("No OCR lab reports are stored yet.")

    if lifestyle_facts:
        summary.append(f"Lifestyle profile adds {len(lifestyle_facts)} self-reported facts for personalization.")

    return summary


def _build_health_context(
    records: list[object],
    reports: list[object],
    lifestyle_facts: list[str],
) -> str:
    lines: list[str] = []

    if records:
        lines.append("Recent health records:")
        for index, record in enumerate(records, start=1):
            metrics = [
                _format_metric("glucose", record.glucose, "mg/dL"),
                _format_metric("HbA1c", record.hba1c, "%"),
                _format_metric("cholesterol", record.cholesterol, "mg/dL"),
                _format_metric("BMI", record.bmi),
                _format_metric("blood pressure", record.bloodPressure),
                _format_metric("insulin", record.insulin),
            ]
            metric_text = ", ".join(metric for metric in metrics if metric) or "no detailed biomarkers saved"
            lines.append(
                f"{index}. {record.source} on {_format_timestamp(record.recordedAt)}: "
                f"risk {record.riskScore:.1f}% ({record.category}); {metric_text}."
            )
            insights = list(record.insights or [])
            if insights:
                lines.append(f"   Saved guidance: {' | '.join(insights[:2])}")
    else:
        lines.append("Recent health records: none available.")

    if reports:
        lines.append("Recent OCR reports:")
        for index, report in enumerate(reports, start=1):
            metrics = [
                _format_metric("glucose", report.glucose, "mg/dL"),
                _format_metric("HbA1c", report.hba1c, "%"),
                _format_metric("cholesterol", report.cholesterol, "mg/dL"),
            ]
            metric_text = ", ".join(metric for metric in metrics if metric) or "no biomarker values parsed"
            lines.append(f"{index}. Report on {_format_timestamp(report.createdAt)}: {metric_text}.")
    else:
        lines.append("Recent OCR reports: none available.")

    if lifestyle_facts:
        lines.append("Lifestyle profile:")
        for fact in lifestyle_facts:
            lines.append(f"- {fact}")
    else:
        lines.append("Lifestyle profile: no client-side profile was shared in this request.")

    return "\n".join(lines)

// this is where imma give personality to the assistant

def _build_system_prompt(user: CurrentUser, health_context: str) -> str:
    return (
        "You are GlucoX Guide, a calm and practical AI health companion inside a diabetes-risk tracking app. "
        "Answer like a thoughtful clinician-adjacent coach, not like a generic chatbot. "
        "Use the user's stored health history and profile details when they are relevant, and clearly say when data is limited or uncertain. "
        "Do not diagnose disease, prescribe medication, or pretend to replace a licensed clinician. "
        "Focus on personalized explanation, trends, likely meaning of readings, and realistic next steps. "
        "If the user mentions emergency symptoms such as chest pain, fainting, severe shortness of breath, confusion, persistent vomiting, or extremely high glucose symptoms, tell them to seek urgent medical care. "
        "Keep replies concise and helpful: usually 2 short paragraphs plus a short flat bullet list when actions help.\n\n"
        f"User: {user.name} ({user.email})\n"
        "Personalized health context:\n"
        f"{health_context}"
    )


def _ollama_endpoint() -> str:
    base_url = settings.ollama_base_url.rstrip("/")
    if base_url.endswith("/api"):
        return f"{base_url}/chat"
    return f"{base_url}/api/chat"


def _post_ollama_chat(payload: dict) -> dict:
    body = json.dumps(payload).encode("utf-8")
    ollama_request = request.Request(
        _ollama_endpoint(),
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(ollama_request, timeout=settings.ollama_timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        if exc.code == 404 or "not found" in detail.lower():
            raise RuntimeError(
                f"Ollama model '{settings.ollama_model}' is unavailable. Start Ollama and run 'ollama pull {settings.ollama_model}'."
            ) from exc
        raise RuntimeError(
            "Ollama returned an error while generating the response."
            + (f" Details: {detail}" if detail else "")
        ) from exc
    except error.URLError as exc:
        raise RuntimeError(
            "Unable to reach Ollama at "
            f"{settings.ollama_base_url}. Start the local Ollama server first."
        ) from exc


async def generate_health_chat_reply(user: CurrentUser, payload: ChatRequest) -> ChatResponse:
    messages = _sanitize_messages(payload.messages)
    lifestyle_facts = _summarize_lifestyle_profile(payload.lifestyle_profile)

    records = await db.healthrecord.find_many(
        where={"userId": user.id},
        order={"recordedAt": "desc"},
        take=MAX_CONTEXT_RECORDS,
    )
    reports = await db.reportextraction.find_many(
        where={"userId": user.id},
        order={"createdAt": "desc"},
        take=MAX_CONTEXT_REPORTS,
    )

    health_context = _build_health_context(records, reports, lifestyle_facts)
    context_summary = _build_context_summary(user, records, reports, lifestyle_facts)
    ollama_payload = {
        "model": settings.ollama_model,
        "stream": False,
        "options": {"temperature": settings.ollama_temperature},
        "messages": [
            {"role": "system", "content": _build_system_prompt(user, health_context)},
            *messages,
        ],
    }

    result = await asyncio.to_thread(_post_ollama_chat, ollama_payload)
    message = result.get("message") or {}
    content = _compact_whitespace(str(message.get("content", "")))

    if not content:
        raise RuntimeError("Ollama returned an empty response. Try asking again.")

    return ChatResponse(
        message=ChatMessage(role="assistant", content=content),
        context_summary=context_summary,
        model=str(result.get("model") or settings.ollama_model),
    )
