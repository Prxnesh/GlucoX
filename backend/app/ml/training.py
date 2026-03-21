from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

DATASET_PATH = Path(__file__).resolve().parent / "data" / "pima-indians-diabetes.csv"
COLUMNS = [
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
    "diabetes_pedigree",
    "age",
    "outcome",
]
FEATURE_COLUMNS = ["age", "bmi", "glucose", "blood_pressure", "insulin", "family_history"]


def _build_estimator(model_kind: str = "logreg"):
    if model_kind == "xgboost":
        try:
            from xgboost import XGBClassifier  # type: ignore
        except ImportError as exc:
            raise RuntimeError("Install xgboost to train the upgraded model.") from exc

        return XGBClassifier(
            max_depth=4,
            learning_rate=0.08,
            n_estimators=180,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
        )

    return LogisticRegression(max_iter=2000, class_weight="balanced")


def train_model(output_path: str | Path, model_kind: str = "logreg") -> dict:
    dataframe = pd.read_csv(DATASET_PATH, header=None, names=COLUMNS)
    dataframe[["glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"]] = dataframe[
        ["glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"]
    ].replace(0, np.nan)

    dataframe["family_history"] = (
        dataframe["diabetes_pedigree"] >= dataframe["diabetes_pedigree"].median()
    ).astype(int)

    features = dataframe[FEATURE_COLUMNS]
    target = dataframe["outcome"]

    numeric_features = ["age", "bmi", "glucose", "blood_pressure", "insulin"]
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                numeric_features,
            ),
            ("family_history", "passthrough", ["family_history"]),
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", _build_estimator(model_kind)),
        ]
    )

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=42,
        stratify=target,
    )

    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 3),
        "precision": round(float(precision_score(y_test, predictions)), 3),
        "recall": round(float(recall_score(y_test, predictions)), 3),
        "model_kind": model_kind,
    }

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "metrics": metrics, "features": FEATURE_COLUMNS}, output_path)
    return metrics
