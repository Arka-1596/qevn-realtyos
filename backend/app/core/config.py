
from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    app_env: Literal[
        "development", "test", "production"
    ] = "development"

    database_url: str = "sqlite:///./realtyos-local.db"
    frontend_origin: str = "http://localhost:3000"
    cors_allowed_origins: str = "http://localhost:3000"
    cookie_secure: bool = False
    rate_limit_storage_url: str = "memory://"

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    ai_provider: str = "groq_compatible"
    ai_provider_api_key: str = ""
    ai_provider_base_url: str = (
        "https://api.groq.com/openai/v1"
    )
    ai_model: str = "openai/gpt-oss-20b"

    @property
    def allowed_origins(self) -> list[str]:
        return [
            item.strip()
            for item in self.cors_allowed_origins.split(",")
            if item.strip()
        ]

    @model_validator(mode="after")
    def validate_production(self):
        if self.app_env == "production":
            if not self.database_url.startswith(
                ("postgresql+psycopg://", "postgresql://")
            ):
                raise ValueError(
                    "Production requires PostgreSQL"
                )

            if not self.cookie_secure:
                raise ValueError(
                    "COOKIE_SECURE must be true in production"
                )

            if not self.frontend_origin.startswith("https://"):
                raise ValueError(
                    "Production frontend must use HTTPS"
                )

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
