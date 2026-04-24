from pydantic import field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional, Union


class Settings(BaseSettings):
    # Service URLs
    CORE_SERVICE_URL: str

    # API Keys & Auth
    # API Keys & Auth
    INTERNAL_API_KEY: str
    INTERNAL_SIGNING_SECRET: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None

    # LLM Settings
    LLM_PROVIDER: str = "groq"
    MODEL_NAME: str
    OPENAI_API_BASE: str

    # RAG Settings
    EMBEDDING_MODEL: str
    CHROMA_SERVER_HOST: str
    CHROMA_SERVER_HTTP_PORT: int

    # Security
    CORS_ORIGINS: Union[str, List[str]]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("CORS_ORIGINS", mode="before")
    def split_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    def validate_keys(self):
        if not self.INTERNAL_API_KEY or not self.INTERNAL_API_KEY.strip():
            raise ValueError("INTERNAL_API_KEY must be set and non-empty")


settings = Settings()
settings.validate_keys()
