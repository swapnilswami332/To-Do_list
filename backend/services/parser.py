import re
from datetime import datetime, timedelta
from typing import Optional

from dateutil import parser as date_parser

from models import Energy, ParseResult, Priority
from services.openai_client import parse_with_openai

PRIORITY_HIGH = re.compile(
    r"\b(urgent|asap|high\s*priority|important|critical)\b", re.I
)
PRIORITY_LOW = re.compile(r"\b(low\s*priority|whenever|no\s*rush)\b", re.I)

ENERGY_LOW = re.compile(r"\b(quick|easy|low\s*energy|simple|fast)\b", re.I)
ENERGY_HIGH = re.compile(
    r"\b(deep\s*work|heavy|high\s*energy|complex|hard)\b", re.I
)

DEADLINE_PATTERNS = [
    (re.compile(r"\btoday\b", re.I), lambda now: _end_of_day(now)),
    (re.compile(r"\btomorrow\b", re.I), lambda now: _end_of_day(now + timedelta(days=1))),
    (re.compile(r"\bnext\s*week\b", re.I), lambda now: _end_of_day(now + timedelta(days=7))),
    (re.compile(r"\btonight\b", re.I), lambda now: now.replace(hour=22, minute=0, second=0, microsecond=0)),
]

TIME_PATTERN = re.compile(
    r"\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b|\b(\d{1,2}):(\d{2})\b",
    re.I,
)

STRIP_PATTERNS = [
    PRIORITY_HIGH,
    PRIORITY_LOW,
    ENERGY_LOW,
    ENERGY_HIGH,
    re.compile(r"\btoday\b", re.I),
    re.compile(r"\btomorrow\b", re.I),
    re.compile(r"\bnext\s*week\b", re.I),
    re.compile(r"\btonight\b", re.I),
    TIME_PATTERN,
    re.compile(r"\b(at|by|due|before|on)\b", re.I),
]


def _end_of_day(dt: datetime) -> datetime:
    return dt.replace(hour=17, minute=0, second=0, microsecond=0)


def _parse_time(text: str, base: datetime) -> Optional[datetime]:
    match = TIME_PATTERN.search(text)
    if not match:
        return None

    if match.group(4):
        hour = int(match.group(4))
        minute = int(match.group(5))
    else:
        hour = int(match.group(1))
        minute = int(match.group(2) or 0)
        ampm = (match.group(3) or "").lower()
        if ampm == "pm" and hour < 12:
            hour += 12
        elif ampm == "am" and hour == 12:
            hour = 0

    result = base.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if result < base:
        result += timedelta(days=1)
    return result


def _extract_deadline(text: str, now: datetime) -> tuple[Optional[datetime], str]:
    remaining = text
    deadline: Optional[datetime] = None
    base = now

    for pattern, resolver in DEADLINE_PATTERNS:
        if pattern.search(text):
            deadline = resolver(now)
            base = deadline.replace(hour=now.hour, minute=now.minute)
            break

    time_dt = _parse_time(text, base if deadline else now)
    if time_dt:
        deadline = time_dt

    fuzzy_dates = re.findall(
        r"\b(?:on\s+)?(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\w+\s+\d{1,2}(?:st|nd|rd|th)?)\b",
        text,
        re.I,
    )
    for date_str in fuzzy_dates:
        try:
            parsed = date_parser.parse(date_str, default=now)
            if parsed > now - timedelta(days=1):
                deadline = parsed
                break
        except (ValueError, OverflowError):
            continue

    return deadline, remaining


def _extract_title(text: str) -> str:
    title = text
    for pattern in STRIP_PATTERNS:
        title = pattern.sub("", title)
    title = re.sub(r"\s+", " ", title).strip(" ,.-")
    return title or text.strip()


def _compute_confidence(
    text: str,
    priority: Priority,
    energy: Energy,
    deadline: Optional[datetime],
) -> float:
    score = 0.4
    if deadline:
        score += 0.3
    if priority != "medium":
        score += 0.15
    if energy != "medium":
        score += 0.15
    if len(text.split()) > 8 and not deadline and priority == "medium":
        score -= 0.3
    return max(0.0, min(1.0, score))


def parse_natural_language(text: str) -> ParseResult:
    text = text.strip()
    if not text:
        return ParseResult(title="", confidence=0.0)

    now = datetime.now()
    priority: Priority = "medium"
    energy: Energy = "medium"

    if PRIORITY_HIGH.search(text):
        priority = "high"
    elif PRIORITY_LOW.search(text):
        priority = "low"

    if ENERGY_LOW.search(text):
        energy = "low"
    elif ENERGY_HIGH.search(text):
        energy = "high"

    deadline, _ = _extract_deadline(text, now)
    title = _extract_title(text)

    estimated = 30
    if energy == "low":
        estimated = 15
    elif energy == "high":
        estimated = 60

    confidence = _compute_confidence(text, priority, energy, deadline)

    result = ParseResult(
        title=title,
        priority=priority,
        energy=energy,
        deadline=deadline,
        estimated_minutes=estimated,
        confidence=confidence,
    )

    if confidence < 0.5:
        ai_result = parse_with_openai(text)
        if ai_result:
            return ai_result

    return result
