import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatDeadline } from '../utils/timeHelpers'
import { filterActiveTasks } from '../utils/taskHelpers'
import { useTaskStore } from '../store/useTaskStore'

export default function TimelineView() {
  const allTasks = useTaskStore((s) => s.tasks)
  const tasks = useMemo(() => filterActiveTasks(allTasks), [allTasks])

  const withDeadline = tasks
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  const noDeadline = tasks.filter((t) => !t.deadline)
  const ordered = [...withDeadline, ...noDeadline]

  if (ordered.length === 0) {
    return (
      <section className="mb-24">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Mission Control
        </h2>
        <div className="glass rounded-xl p-6 text-center text-sm text-slate-500">
          No tasks on the timeline yet
        </div>
      </section>
    )
  }

  return (
    <section className="mb-24">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Mission Control
      </h2>
      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory">
          {ordered.map((task, i) => (
            <motion.div
              key={task.id}
              layoutId={`timeline-${task.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass neon-border-purple w-48 shrink-0 snap-center rounded-2xl p-4"
            >
              <div className="mb-2 h-2 w-2 rounded-full bg-purple-400 neon-purple" />
              <p className="line-clamp-2 font-medium text-white">{task.title}</p>
              <p className="mt-2 text-xs text-purple-300">
                {task.deadline ? formatDeadline(task.deadline) : 'No deadline'}
              </p>
              <div className="mt-2 flex gap-1">
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                  {task.priority}
                </span>
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                  {task.energy}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
