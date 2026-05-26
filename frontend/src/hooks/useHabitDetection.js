import { useCallback } from 'react'
import { normalizeTitle, toDateKey } from '../utils/timeHelpers'
import { useTaskStore } from '../store/useTaskStore'

export function useHabitDetection() {
  const tasks = useTaskStore((s) => s.tasks)
  const habits = useTaskStore((s) => s.habits)
  const addHabit = useTaskStore((s) => s.addHabit)
  const updateHabit = useTaskStore((s) => s.updateHabit)

  const detectFromCompletion = useCallback(
    (completedTask) => {
      const normalized = normalizeTitle(completedTask.title)
      if (!normalized) return

      const thirtyDaysAgo = Date.now() - 30 * 86400000
      const similarCompletions = tasks.filter(
        (t) =>
          t.completed &&
          normalizeTitle(t.title) === normalized &&
          t.completed_at &&
          new Date(t.completed_at).getTime() > thirtyDaysAgo
      )

      const existing = habits.find((h) => h.normalizedTitle === normalized)
      const today = toDateKey()

      if (existing) {
        const lastDay = existing.lastCompleted ? toDateKey(new Date(existing.lastCompleted)) : null
        let streak = existing.streak
        if (lastDay !== today) {
          const yesterday = toDateKey(new Date(Date.now() - 86400000))
          streak = lastDay === yesterday ? streak + 1 : 1
        }
        updateHabit(existing.id, {
          streak,
          lastCompleted: new Date().toISOString(),
          occurrences: [...(existing.occurrences || []), today],
        })
      } else if (similarCompletions.length >= 2) {
        addHabit({
          title: completedTask.title,
          normalizedTitle: normalized,
          streak: 1,
          lastCompleted: new Date().toISOString(),
          occurrences: [today],
        })
      }
    },
    [tasks, habits, addHabit, updateHabit]
  )

  return { detectFromCompletion, habits }
}
