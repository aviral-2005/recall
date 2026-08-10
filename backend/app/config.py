"""
Application configuration loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None
    qdrant_collection: str = "meeting_memories"

    # LLM
    llm_api_key: str
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"

    # Embeddings (defaults to LLM credentials if not set)
    embeddings_api_key: Optional[str] = None
    embeddings_base_url: Optional[str] = None
    embeddings_model: str = "text-embedding-3-small"

    # Rime TTS
    rime_api_key: Optional[str] = None
    rime_speaker: str = "aurora"

    # STT
    stt_api_key: Optional[str] = None
    stt_base_url: Optional[str] = None

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def effective_embeddings_api_key(self) -> str:
        return self.embeddings_api_key or self.llm_api_key

    @property
    def effective_embeddings_base_url(self) -> str:
        return self.embeddings_base_url or self.llm_base_url

    @property
    def effective_stt_api_key(self) -> str:
        return self.stt_api_key or self.llm_api_key

    @property
    def effective_stt_base_url(self) -> str:
        return self.stt_base_url or self.llm_base_url


settings = Settings()
