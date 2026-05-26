import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame, TrendingUp } from 'lucide-react'
import { toDateKey } from '../utils/timeHelpers'
import { useTaskStore } from '../store/useTaskStore'

export default function StatsPanel() {
  const showStats = useTaskStore((s) => s.showStats)
  const setShowStats = useTaskStore((s) => s.setShowStats)
  const dailyStats = useTaskStore((s) => s.dailyStats)
  const tasks = useTaskStore((s) => s.tasks)
  const habits = useTaskStore((s) => s.habits)

  if (!showStats) return null

  const today = toDateKey()
  const todayStats = dailyStats[today] || { completed: 0, total: 0 }
  const completionPct =
    todayStats.total > 0 ? Math.round((todayStats.completed / todayStats.total) * 100) : 0

  const streak = computeStreak(dailyStats)
  const productivityScore = computeProductivityScore(tasks, dailyStats)
  const heatmap = getWeeklyHeatmap(dailyStats)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowStats(false)}
      >
        <motion.div
          className="glass-strong max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl neon-border-purple"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Pulse Stats</h2>
            <button type="button" onClick={() => setShowStats(false)} className="text-slate-400">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatCard label="Today" value={`${completionPct}%`} sub="completion" />
            <StatCard label="Streak" value={streak} sub="days" icon={Flame} />
            <StatCard label="Score" value={productivityScore} sub="productivity" icon={TrendingUp} />
          </div>

          <div className="mb-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">Weekly heatmap</p>
            <div className="flex gap-2">
              {heatmap.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="h-10 w-full rounded-lg transition-all"
                    style={{
                      backgroundColor: `rgba(168, 85, 247, ${0.1 + day.intensity * 0.7})`,
                      boxShadow: day.intensity > 0.5 ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                    }}
                    title={`${day.completed} completed`}
                  />
                  <span className="text-[10px] text-slate-500">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {habits.length > 0 && (
            <div>
              <p className="mb-3 text-xs uppercase tracking-wider text-slate-400">Habit streaks</p>
              <div className="flex flex-col gap-2">
                {habits.map((h) => {
                  const consistency = h.occurrences?.length
                    ? Math.round((h.occurrences.length / 7) * 100)
                    : 0
                  return (
                    <div key={h.id} className="glass flex items-center justify-between rounded-xl p-3">
                      <span className="text-sm">{h.title}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-orange-400">
                          <Flame className="h-3 w-3" />
                          {h.streak}
                        </span>
                        <span className="text-slate-400">{consistency}% consistent</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      {Icon && <Icon className="mx-auto mb-1 h-4 w-4 text-purple-400" />}
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500">{sub}</p>
    </div>
  )
}

function computeStreak(dailyStats) {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = toDateKey(d)
    const stat = dailyStats[key]
    if (stat?.completed > 0) {
      streak++
      d.setDate(d.getDate() - 1)
    } else if (i === 0) {
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function computeProductivityScore(tasks, dailyStats) {
  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length || 1
  const onTime = tasks.filter(
    (t) => t.completed && t.deadline && t.completed_at && new Date(t.completed_at) <= new Date(t.deadline)
  ).length
  const today = dailyStats[toDateKey()] || { completed: 0, total: 0 }
  const dailyRate = today.total ? today.completed / today.total : 0
  const score = (completed / total) * 40 + (onTime / total) * 30 + dailyRate * 30
  return Math.round(Math.min(100, score))
}

function getWeeklyHeatmap(dailyStats) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const result = []
  const d = new Date()
  d.setDate(d.getDate() - 6)
  for (let i = 0; i < 7; i++) {
    const key = toDateKey(d)
    const stat = dailyStats[key] || { completed: 0 }
    const max = 5
    result.push({
      date: key,
      label: days[d.getDay()],
      completed: stat.completed,
      intensity: Math.min(1, stat.completed / max),
    })
    d.setDate(d.getDate() + 1)
  }
  return result
}
