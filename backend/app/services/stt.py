"""
STT service — transcribes audio using an OpenAI Whisper-compatible API.
Returns None gracefully if not configured or if the request fails.
"""
import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

def _make_client() -> AsyncOpenAI:
    """Always create a fresh client from current settings."""
    return AsyncOpenAI(
        api_key=settings.effective_stt_api_key,
        base_url=settings.effective_stt_base_url,
    )


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str | None:
    """
    Transcribe audio bytes using Whisper-compatible API.
    Returns the transcript string, or None on failure.
    """
    client = _make_client()
    try:
        # The OpenAI SDK expects a file-like tuple: (filename, bytes, content_type)
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=(filename, audio_bytes, "audio/webm"),
        )
        text = response.text.strip()
        logger.info("STT transcript: %s", text)
        return text
    except Exception as e:
        logger.error("STT transcription failed: %s", e)
        return None
