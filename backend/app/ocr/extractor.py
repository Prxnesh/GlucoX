import io
import re

import pytesseract
from fastapi import UploadFile
from pdf2image import convert_from_bytes
from PIL import Image
from pypdf import PdfReader

from app.utils.config import get_settings

settings = get_settings()

if settings.tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

METRIC_PATTERNS = {
    "glucose": [
        r"(?:glucose|fasting glucose)\D{0,12}(\d{2,3}(?:\.\d+)?)",
    ],
    "hba1c": [
        r"(?:hba1c|hb\s*a1c|glycated hemoglobin)\D{0,12}(\d{1,2}(?:\.\d+)?)",
    ],
    "cholesterol": [
        r"(?:total cholesterol|cholesterol)\D{0,12}(\d{2,3}(?:\.\d+)?)",
    ],
}


async def extract_text_from_upload(file: UploadFile) -> str:
    filename = file.filename or "upload"
    extension = filename.split(".")[-1].lower()
    content = await file.read()

    if extension in {"png", "jpg", "jpeg"}:
        return _ocr_image(content)

    if extension == "pdf":
        direct_text = _extract_pdf_text(content)
        if direct_text.strip():
            return direct_text
        try:
            return _ocr_pdf(content)
        except Exception as exc:  # pragma: no cover - external dependency handling
            raise RuntimeError(
                "PDF OCR requires Tesseract and Poppler to be installed on the host machine."
            ) from exc

    raise ValueError("Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG file.")


def _ocr_image(content: bytes) -> str:
    image = Image.open(io.BytesIO(content)).convert("L")
    return pytesseract.image_to_string(image)


def _extract_pdf_text(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _ocr_pdf(content: bytes) -> str:
    pages = convert_from_bytes(content)
    return "\n".join(pytesseract.image_to_string(page.convert("L")) for page in pages)


def extract_metrics(raw_text: str) -> tuple[float | None, float | None, float | None]:
    normalized = " ".join(raw_text.lower().split())
    extracted: list[float | None] = []

    for metric in ("glucose", "hba1c", "cholesterol"):
        extracted.append(_search_patterns(normalized, METRIC_PATTERNS[metric]))

    return tuple(extracted)  # type: ignore[return-value]


def _search_patterns(text: str, patterns: list[str]) -> float | None:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None

