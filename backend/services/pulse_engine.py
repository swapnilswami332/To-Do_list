from datetime import datetime

from models import Energy, PulseRequest, PulseResponse, PulseSuggestion, Task

ENERGY_LEVEL = {"low": 1, "medium": 2, "high": 3}
PRIORITY_WEIGHT = {"low": 0.33, "medium": 0.66, "high": 1.0}


def _is_active(task: Task, now: datetime) -> bool:
    if task.completed:
        return False
    if task.snoozed_until and task.snoozed_until > now:
        return False
    return True


def _urgency_score(task: Task, now: datetime) -> float:
    if not task.deadline:
        return 0.3
    hours = (task.deadline - now).total_seconds() / 3600
    if hours < 0:
        return 1.0
    return min(1.0, max(0.0, 1.0 / max(hours, 0.5)))


def _energy_fit(task_energy: Energy, user_energy: Energy) -> float:
    if ENERGY_LEVEL[task_energy] <= ENERGY_LEVEL[user_energy]:
        return 1.0
    return 0.5


def _effort_fit(task: Task, user_energy: Energy) -> float:
    if user_energy == "low" and task.estimated_minutes <= 20:
        return 1.0
    if user_energy == "high" and task.estimated_minutes >= 45:
        return 1.0
    if user_energy == "medium":
        return 0.8
    return 0.5


def _reason(task: Task, now: datetime, user_energy: Energy) -> str:
    if task.deadline:
        hours = (task.deadline - now).total_seconds() / 3600
        if hours < 0:
            return "Overdue — tackle now"
        if hours < 2:
            return f"Due in {max(1, int(hours * 60))} min"
        if hours < 24:
            return f"Due in {int(hours)} hours"
        return f"Due {task.deadline.strftime('%b %d')}"

    if ENERGY_LEVEL[task.energy] <= ENERGY_LEVEL[user_energy]:
        return "Matches your current energy"

    if task.priority == "high":
        return "High priority task"

    return "Good momentum builder"


def score_tasks(request: PulseRequest) -> PulseResponse:
    now = datetime.now()
    user_energy = request.user_energy
    scored: list[PulseSuggestion] = []

    for task in request.tasks:
        if not _is_active(task, now):
            continue

        urgency = _urgency_score(task, now)
        priority = PRIORITY_WEIGHT[task.priority]
        energy_fit = _energy_fit(task.energy, user_energy)
        effort_fit = _effort_fit(task, user_energy)

        score = (
            0.4 * urgency
            + 0.3 * priority
            + 0.2 * energy_fit
            + 0.1 * effort_fit
        )

        scored.append(
            PulseSuggestion(
                task_id=task.id,
                title=task.title,
                score=round(score, 3),
                reason=_reason(task, now, user_energy),
            )
        )

    scored.sort(key=lambda s: s.score, reverse=True)
    return PulseResponse(suggestions=scored[:3])
