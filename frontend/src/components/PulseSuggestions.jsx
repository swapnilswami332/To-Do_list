import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { getPulseSuggestions } from '../utils/api'
import { useTaskStore } from '../store/useTaskStore'

export default function PulseSuggestions() {
  const tasks = useTaskStore((s) => s.tasks)
  const userEnergy = useTaskStore((s) => s.userEnergy)
  const setHighlightedTaskId = useTaskStore((s) => s.setHighlightedTaskId)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchSuggestions() {
      const active = tasks.filter((t) => !t.completed)
      if (active.length === 0) {
        setSuggestions([])
        return
      }
      setLoading(true)
      try {
        const data = await getPulseSuggestions(tasks, userEnergy)
        if (!cancelled) setSuggestions(data.suggestions || [])
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSuggestions()
    const interval = setInterval(fetchSuggestions, 60000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [tasks, userEnergy])

  if (suggestions.length === 0 && !loading) return null

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">👉</span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Suggested for you now
        </h2>
        <Sparkles className="h-4 w-4 text-purple-400 ambient-glow" />
      </div>
      <div className="flex flex-col gap-2">
        {loading && suggestions.length === 0 ? (
          <div className="glass h-16 animate-pulse rounded-xl" />
        ) : (
          suggestions.map((s, i) => (
            <motion.button
              key={s.task_id}
              type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => {
                setHighlightedTaskId(s.task_id)
                document.getElementById(`task-${s.task_id}`)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
              }}
              className="glass neon-border-blue group flex items-center justify-between rounded-xl p-3 text-left transition-all hover:bg-white/10"
            >
              <div>
                <p className="font-medium text-white">{s.title}</p>
                <p className="text-xs text-blue-300/80">{s.reason}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
            </motion.button>
          ))
        )}
      </div>
    </section>
  )
}
