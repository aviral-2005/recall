"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class MemoryType(str, Enum):
    decision = "decision"
    commitment = "commitment"
    discussion = "discussion"
    question = "question"
    action_item = "action_item"


class MeetingMemory(BaseModel):
    """A single retrieved meeting memory."""
    meeting_id: str
    meeting_name: str
    date: str
    timestamp: str
    speaker: str
    text: str
    topic: str
    memory_type: MemoryType
    score: Optional[float] = None


class AskRequest(BaseModel):
    query: str


class AskResponse(BaseModel):
    query: str
    answer: str
    audio: Optional[str] = None  # base64-encoded MP3 or None if TTS failed
    memories: List[MeetingMemory] = []


class TranscribeResponse(BaseModel):
    text: str


class SeedResponse(BaseModel):
    status: str
    inserted: int


class HealthResponse(BaseModel):
    status: str
