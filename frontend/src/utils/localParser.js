const PRIORITY_HIGH = /\b(urgent|asap|high\s*priority|important|critical)\b/i
const PRIORITY_LOW = /\b(low\s*priority|whenever|no\s*rush)\b/i
const ENERGY_LOW = /\b(quick|easy|low\s*energy|simple|fast)\b/i
const ENERGY_HIGH = /\b(deep\s*work|heavy|high\s*energy|complex|hard)\b/i

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(17, 0, 0, 0)
  return d.toISOString()
}

function parseTime(text, baseDate) {
  const match = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i)
  if (!match) return null

  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2] || '0', 10)
  const ampm = (match[3] || '').toLowerCase()

  if (ampm === 'pm' && hour < 12) hour += 12
  if (ampm === 'am' && hour === 12) hour = 0

  const d = new Date(baseDate)
  d.setHours(hour, minute, 0, 0)
  if (d < new Date()) d.setDate(d.getDate() + 1)
  return d.toISOString()
}

function extractDeadline(text) {
  const now = new Date()
  let base = now.toISOString()

  if (/\btoday\b/i.test(text)) {
    base = endOfDay(now)
  } else if (/\btomorrow\b/i.test(text)) {
    const t = new Date(now)
    t.setDate(t.getDate() + 1)
    base = endOfDay(t)
  } else if (/\bnext\s*week\b/i.test(text)) {
    const t = new Date(now)
    t.setDate(t.getDate() + 7)
    base = endOfDay(t)
  }

  return parseTime(text, base) || (/\btoday|\btomorrow|\bnext\s*week/i.test(text) ? base : null)
}

function extractTitle(text) {
  let title = text
  const patterns = [PRIORITY_HIGH, PRIORITY_LOW, ENERGY_LOW, ENERGY_HIGH,
    /\btoday\b/i, /\btomorrow\b/i, /\bnext\s*week\b/i, /\btonight\b/i,
    /\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i, /\b(at|by|due|before|on)\b/i]
  patterns.forEach((p) => { title = title.replace(p, '') })
  title = title.replace(/\s+/g, ' ').trim().replace(/^[,.\-\s]+|[,.\-\s]+$/g, '')
  return title || text.trim()
}

export function localParse(text) {
  const trimmed = text.trim()
  let priority = 'medium'
  let energy = 'medium'

  if (PRIORITY_HIGH.test(trimmed)) priority = 'high'
  else if (PRIORITY_LOW.test(trimmed)) priority = 'low'

  if (ENERGY_LOW.test(trimmed)) energy = 'low'
  else if (ENERGY_HIGH.test(trimmed)) energy = 'high'

  const deadline = extractDeadline(trimmed)
  const title = extractTitle(trimmed)

  return {
    title,
    priority,
    energy,
    deadline,
    estimated_minutes: energy === 'low' ? 15 : energy === 'high' ? 60 : 30,
    confidence: deadline || priority !== 'medium' ? 0.8 : 0.5,
  }
}

const ENERGY_LEVEL = { low: 1, medium: 2, high: 3 }
const PRIORITY_WEIGHT = { low: 0.33, medium: 0.66, high: 1.0 }

export function localPulse(tasks, userEnergy) {
  const now = Date.now()
  const scored = tasks
    .filter((t) => !t.completed && (!t.snoozed_until || new Date(t.snoozed_until) <= now))
    .map((task) => {
      let urgency = 0.3
      if (task.deadline) {
        const hours = (new Date(task.deadline) - now) / 3600000
        urgency = hours < 0 ? 1 : Math.min(1, 1 / Math.max(hours, 0.5))
      }
      const energyFit = ENERGY_LEVEL[task.energy] <= ENERGY_LEVEL[userEnergy] ? 1 : 0.5
      const score = 0.4 * urgency + 0.3 * PRIORITY_WEIGHT[task.priority] + 0.2 * energyFit + 0.1 * 0.7
      return {
        task_id: task.id,
        title: task.title,
        score,
        reason: task.deadline ? 'Upcoming deadline' : 'Matches your energy',
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return { suggestions: scored }
}
