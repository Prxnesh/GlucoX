from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.schemas.prediction import PredictionDriver

#This module implements the logic for generating explanations of the diabetes risk predictions, including identifying key drivers and insights based on the input features and model behavior.

FEATURE_ORDER = ["age", "bmi", "glucose", "blood_pressure", "insulin", "family_history"]

FEATURE_LABELS = {
    "age": "Age",
    "bmi": "BMI",
    "glucose": "Glucose",
    "blood_pressure": "Blood pressure",
    "insulin": "Insulin",
    "family_history": "Family history",
}


def _to_frame(values: dict[str, Any]) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "age": values.get("age"),
                "bmi": values.get("bmi"),
                "glucose": values.get("glucose"),
                "blood_pressure": values.get("blood_pressure"),
                "insulin": values.get("insulin"),
                "family_history": int(bool(values.get("family_history"))),
            }
        ]
    )


def _feature_detail(feature: str, values: dict[str, Any]) -> str:
    value = values.get(feature)
    if feature == "family_history":
        return "Yes" if bool(value) else "No"
    if value is None:
        return "Not available"
    if feature == "glucose":
        return f"{value} mg/dL"
    if feature == "blood_pressure":
        return f"{value} mmHg"
    if feature == "bmi":
        return f"{value}"
    if feature == "insulin":
        return f"{value}"
    return str(value)


def _direction(effect: float) -> str:
    if effect > 0:
        return "up"
    if effect < 0:
        return "down"
    return "neutral"


def _build_logreg_drivers(bundle: dict[str, Any], values: dict[str, Any], probability: float) -> list[PredictionDriver]:
    pipeline = bundle.get("pipeline")
    if pipeline is None:
        return []

    preprocessor = pipeline.named_steps.get("preprocessor")
    classifier = pipeline.named_steps.get("classifier")
    if preprocessor is None or classifier is None:
        return []
    if not hasattr(classifier, "coef_"):
        return []

    transformed = preprocessor.transform(_to_frame(values))
    transformed_array = transformed.toarray() if hasattr(transformed, "toarray") else transformed
    vector = np.asarray(transformed_array, dtype=float)[0]
    coefficients = np.asarray(classifier.coef_, dtype=float)[0]

    if vector.shape[0] != coefficients.shape[0]:
        return []

    transformed_names = preprocessor.get_feature_names_out()
    derivative = max(probability * (1.0 - probability), 0.05)
    effects = vector * coefficients * derivative * 100.0

    feature_effects = {feature: 0.0 for feature in FEATURE_ORDER}
    for name, effect in zip(transformed_names, effects, strict=False):
        lowered = str(name).lower()
        for feature in FEATURE_ORDER:
            if feature in lowered:
                feature_effects[feature] += float(effect)
                break

    sorted_effects = sorted(feature_effects.items(), key=lambda item: abs(item[1]), reverse=True)
    drivers: list[PredictionDriver] = []
    for feature, effect in sorted_effects[:3]:
        drivers.append(
            PredictionDriver(
                feature=feature,
                label=FEATURE_LABELS[feature],
                contribution=round(effect, 2),
                direction=_direction(effect),
                detail=_feature_detail(feature, values),
            )
        )

    return drivers


def _build_fallback_drivers(values: dict[str, Any]) -> list[PredictionDriver]:
    baselines = {
        "glucose": (120.0, 22.0),
        "bmi": (27.0, 15.0),
        "blood_pressure": (80.0, 16.0),
        "insulin": (90.0, 12.0),
        "age": (40.0, 10.0),
    }

    effects: dict[str, float] = {}
    for feature, (baseline, scale) in baselines.items():
        raw = values.get(feature)
        if raw is None:
            effects[feature] = 0.0
            continue
        effects[feature] = ((float(raw) - baseline) / max(scale, 1.0)) * 4.0

    effects["family_history"] = 4.0 if bool(values.get("family_history")) else -1.0
    sorted_effects = sorted(effects.items(), key=lambda item: abs(item[1]), reverse=True)

    drivers: list[PredictionDriver] = []
    for feature, effect in sorted_effects[:3]:
        drivers.append(
            PredictionDriver(
                feature=feature,
                label=FEATURE_LABELS[feature],
                contribution=round(effect, 2),
                direction=_direction(effect),
                detail=_feature_detail(feature, values),
            )
        )

    return drivers


def build_prediction_drivers(
    bundle: dict[str, Any],
    values: dict[str, Any],
    probability: float,
) -> list[PredictionDriver]:
    drivers = _build_logreg_drivers(bundle, values, probability)
    if drivers:
        return drivers
    return _build_fallback_drivers(values)