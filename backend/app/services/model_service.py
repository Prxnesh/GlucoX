from functools import lru_cache
from pathlib import Path

import joblib

from app.utils.config import get_settings

settings = get_settings()


@lru_cache(maxsize=1)
def load_model_bundle():
    model_path = Path(settings.model_path)
    if not model_path.is_absolute():
        model_path = Path(__file__).resolve().parents[2] / model_path
    if not model_path.exists():
        raise FileNotFoundError(model_path)
    return joblib.load(model_path)