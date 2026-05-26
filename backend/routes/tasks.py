from fastapi import APIRouter

from models import ParseRequest, PulseRequest, PulseResponse
from services.parser import parse_natural_language
from services.pulse_engine import score_tasks

router = APIRouter(prefix="/api", tags=["tasks"])


@router.post("/parse")
def parse_task(body: ParseRequest):
    return parse_natural_language(body.text)


@router.post("/pulse", response_model=PulseResponse)
def pulse_suggestions(body: PulseRequest):
    return score_tasks(body)
