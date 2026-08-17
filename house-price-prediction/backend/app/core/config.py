"""Application settings, loaded from environment variables / .env file."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # General
    app_name: str = "House Price Prediction API"
    environment: str = "development"

    # Model artifact paths (relative to the backend/ directory)
    model_path: str = "models/house_price.pkl"
    locations_path: str = "models/locations.json"

    # CORS: comma-separated list of allowed origins
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def resolved_model_path(self) -> Path:
        # backend/app/core/config.py -> backend/
        backend_root = Path(__file__).resolve().parents[2]
        return backend_root / self.model_path

    def resolved_locations_path(self) -> Path:
        backend_root = Path(__file__).resolve().parents[2]
        return backend_root / self.locations_path


settings = Settings()
