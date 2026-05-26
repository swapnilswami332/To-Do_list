import { useMemo } from 'react'
import { Home, BarChart3, Focus, Calendar } from 'lucide-react'
import { filterActiveTasks } from '../utils/taskHelpers'
import { useTaskStore } from '../store/useTaskStore'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'focus', label: 'Focus', icon: Focus },
]

export default function BottomBar() {
  const activeView = useTaskStore((s) => s.activeView)
  const setActiveView = useTaskStore((s) => s.setActiveView)
  const setShowStats = useTaskStore((s) => s.setShowStats)
  const allTasks = useTaskStore((s) => s.tasks)
  const tasks = useMemo(() => filterActiveTasks(allTasks), [allTasks])
  const startFocus = useTaskStore((s) => s.startFocus)

  const handleTab = (id) => {
    if (id === 'stats') {
      setShowStats(true)
      return
    }
    if (id === 'focus') {
      const first = tasks[0]
      if (first) startFocus(first.id)
      return
    }
    setActiveView(id)
  }

  return (
    <nav className="glass-strong fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 px-4 pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around py-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTab(id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1 transition ${
                active ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'neon-blue rounded-full' : ''}`} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
