export function formatDeadline(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diff = d - now
  const hours = diff / 3600000

  if (hours < 0) return 'Overdue'
  if (hours < 24) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function isToday(iso) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function toDatetimeLocalValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalValue(value) {
  if (!value) return null
  return new Date(value).toISOString()
}
