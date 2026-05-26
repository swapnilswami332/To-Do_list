export function filterActiveTasks(tasks) {
  const now = Date.now()
  return tasks
    .filter(
      (t) =>
        !t.completed &&
        (!t.snoozed_until || new Date(t.snoozed_until).getTime() <= now)
    )
    .sort((a, b) => a.order - b.order)
}

export function filterTodayTasks(tasks) {
  const active = filterActiveTasks(tasks)
  const today = new Date().toDateString()
  const now = new Date()
  return active.filter((t) => {
    if (!t.deadline) return true
    const d = new Date(t.deadline)
    return d.toDateString() === today || d <= now
  })
}
