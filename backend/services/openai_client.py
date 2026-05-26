import json
import os
from datetime import datetime
from typing import Optional

from models import ParseResult

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")


def parse_with_openai(text: str) -> Optional[ParseResult]:
    if not OPENAI_API_KEY:
        return None

    try:
        from openai import OpenAI

        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract task fields from natural language. "
                        "Return JSON with: title (string), priority (low|medium|high), "
                        "energy (low|medium|high), deadline (ISO8601 or null), "
                        "estimated_minutes (int). Only return valid JSON."
                    ),
                },
                {"role": "user", "content": text},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        raw = response.choices[0].message.content
        if not raw:
            return None

        data = json.loads(raw)
        deadline = None
        if data.get("deadline"):
            deadline = datetime.fromisoformat(
                data["deadline"].replace("Z", "+00:00")
            ).replace(tzinfo=None)

        return ParseResult(
            title=data.get("title", text),
            priority=data.get("priority", "medium"),
            energy=data.get("energy", "medium"),
            deadline=deadline,
            estimated_minutes=data.get("estimated_minutes", 30),
            confidence=0.95,
        )
    except Exception:
        return None
