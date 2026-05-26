import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Zap, Flag, Pencil } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GestureHandler from './GestureHandler'
import ProgressRing from './ProgressRing'
import CompletionBurst from './CompletionBurst'
import RadialMenu from './RadialMenu'
import SnoozeModal from './SnoozeModal'
import TaskEditModal from './TaskEditModal'
import { formatDeadline } from '../utils/timeHelpers'
import { useTaskStore } from '../store/useTaskStore'
import { useHabitDetection } from '../hooks/useHabitDetection'

const PRIORITY_COLORS = {
  high: 'text-red-400 bg-red-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low: 'text-slate-400 bg-slate-400/10',
}

const ENERGY_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-blue-400',
  high: 'text-purple-400',
}

export default function TaskCard({ task, dragHandle = true }) {
  const highlightedTaskId = useTaskStore((s) => s.highlightedTaskId)
  const completeTask = useTaskStore((s) => s.completeTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const snoozeTask = useTaskStore((s) => s.snoozeTask)
  const startFocus = useTaskStore((s) => s.startFocus)
  const { detectFromCompletion } = useHabitDetection()

  const [burst, setBurst] = useState(false)
  const [showRadial, setShowRadial] = useState(false)
  const [snoozeTarget, setSnoozeTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  const highlighted = highlightedTaskId === task.id

  const handleComplete = () => {
    setBurst(true)
  }

  const onBurstDone = () => {
    setBurst(false)
    const completed = { ...task, completed: true, completed_at: new Date().toISOString() }
    completeTask(task.id)
    detectFromCompletion(completed)
  }

  const handleRadial = (action) => {
    if (action === 'delete') deleteTask(task.id)
    if (action === 'focus') startFocus(task.id)
    if (action === 'snooze') setSnoozeTarget(task)
    if (action === 'edit') setEditTarget(task)
  }

  const openEdit = (e) => {
    e?.stopPropagation?.()
    setEditTarget(task)
  }

  return (
    <>
      <motion.div
        id={`task-${task.id}`}
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: 50 }}
        className={`relative mb-3 overflow-hidden rounded-2xl transition-shadow ${
          highlighted ? 'neon-border-purple ring-2 ring-purple-400/30' : 'neon-border-blue'
        } glass`}
      >
        {burst && <CompletionBurst onDone={onBurstDone} />}
        <GestureHandler
          onSwipeRight={handleComplete}
          onSwipeLeft={() => setSnoozeTarget(task)}
          onSwipeUp={openEdit}
          onLongPress={() => setShowRadial(true)}
        >
          <div className="flex items-center gap-3 p-4">
            {dragHandle && (
              <button
                type="button"
                className="cursor-grab touch-none text-slate-600 hover:text-slate-400"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}
            <ProgressRing
              progress={task.completed ? 100 : 0}
              onClick={handleComplete}
              glowing={highlighted}
            />
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={openEdit}
                className="block w-full truncate text-left font-medium text-white hover:text-purple-200"
              >
                {task.title}
              </button>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2 py-0.5 ${PRIORITY_COLORS[task.priority]}`}>
                  <Flag className="mr-0.5 inline h-3 w-3" />
                  {task.priority}
                </span>
                <span className={`flex items-center gap-0.5 ${ENERGY_COLORS[task.energy]}`}>
                  <Zap className="h-3 w-3" />
                  {task.energy}
                </span>
                {task.deadline ? (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={openEdit}
                    className="text-slate-400 hover:text-emerald-300"
                  >
                    {formatDeadline(task.deadline)}
                  </button>
                ) : (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={openEdit}
                    className="text-slate-500 hover:text-emerald-300"
                  >
                    + Set deadline
                  </button>
                )}
                <span className="text-slate-500">{task.estimated_minutes}m</span>
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={openEdit}
              aria-label="Edit task"
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-purple-300"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </GestureHandler>
      </motion.div>

      <AnimatePresence>
        {showRadial && (
          <RadialMenu onAction={handleRadial} onClose={() => setShowRadial(false)} />
        )}
      </AnimatePresence>

      {snoozeTarget?.id === task.id && (
        <SnoozeModal
          task={snoozeTarget}
          onSnooze={snoozeTask}
          onClose={() => setSnoozeTarget(null)}
        />
      )}
      {editTarget?.id === task.id && (
        <TaskEditModal task={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </>
  )
}
