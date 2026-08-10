"""
Rime TTS service — converts text to speech and returns base64-encoded audio.
Returns None gracefully if Rime is not configured or fails.
"""
import logging
import base64
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

RIME_TTS_URL = "https://users.rime.ai/v1/rime-tts"


async def synthesize(text: str) -> str | None:
    """
    Call Rime TTS API and return base64-encoded MP3 audio.
    Returns None if Rime is not configured or the request fails.
    """
    if not settings.rime_api_key:
        logger.warning("RIME_API_KEY not set — skipping TTS")
        return None

    headers = {
        "Authorization": f"Bearer {settings.rime_api_key}",
        "Content-Type": "application/json",
        "Accept": "audio/mp3",
    }
    payload = {
        "speaker": settings.rime_speaker,
        "text": text,
        "modelId": "mist",
        "audioFormat": "mp3",
        "samplingRate": 22050,
        "speedAlpha": 1.0,
        "reduceLatency": False,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(RIME_TTS_URL, json=payload, headers=headers)
            response.raise_for_status()
            audio_bytes = response.content
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            logger.info(
                "Rime TTS succeeded — audio size: %d bytes", len(audio_bytes)
            )
            return audio_b64
    except httpx.HTTPStatusError as e:
        logger.error(
            "Rime TTS HTTP error %d: %s", e.response.status_code, e.response.text
        )
        return None
    except Exception as e:
        logger.error("Rime TTS failed: %s", e)
        return None
