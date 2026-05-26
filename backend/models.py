from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

Priority = Literal["low", "medium", "high"]
Energy = Literal["low", "medium", "high"]


class Task(BaseModel):
    id: str
    title: str
    completed: bool = False
    priority: Priority = "medium"
    energy: Energy = "medium"
    deadline: Optional[datetime] = None
    estimated_minutes: int = 30
    created_at: datetime
    completed_at: Optional[datetime] = None
    snoozed_until: Optional[datetime] = None
    order: int = 0


class ParseRequest(BaseModel):
    text: str


class ParseResult(BaseModel):
    title: str
    priority: Priority = "medium"
    energy: Energy = "medium"
    deadline: Optional[datetime] = None
    estimated_minutes: int = 30
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class PulseRequest(BaseModel):
    tasks: list[Task]
    user_energy: Energy = "medium"


class PulseSuggestion(BaseModel):
    task_id: str
    title: str
    score: float
    reason: str


class PulseResponse(BaseModel):
    suggestions: list[PulseSuggestion]
