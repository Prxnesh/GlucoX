from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expires_minutes: int = Field(default=1440, alias="JWT_EXPIRES_MINUTES")
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    model_path: str = Field(default="app/ml/artifacts/diabetes_model.pkl", alias="MODEL_PATH")
    tesseract_cmd: str | None = Field(default=None, alias="TESSERACT_CMD")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

