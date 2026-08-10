"""
Transcribe route — converts uploaded audio to text using STT.

If STT is not configured or fails, the endpoint returns a clear error
so the frontend can fall back to direct text input.
"""
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import TranscribeResponse
from app.services import stt as stt_svc

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(audio: UploadFile = File(...)):
    """
    Accept an audio file and return the transcript.
    Supported formats: webm, mp4, wav, mp3 (anything Whisper accepts).
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    filename = audio.filename or "audio.webm"
    logger.info(
        "Received audio for transcription: filename=%s, size=%d bytes",
        filename,
        len(audio_bytes),
    )

    text = await stt_svc.transcribe_audio(audio_bytes, filename=filename)

    if text is None:
        raise HTTPException(
            status_code=503,
            detail="STT transcription failed. Check STT_API_KEY and STT_BASE_URL in .env.",
        )

    return TranscribeResponse(text=text)
