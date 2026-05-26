import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit3 } from 'lucide-react'
import TaskFields from './TaskFields'
import { useTaskStore } from '../store/useTaskStore'

export default function TaskEditModal({ task, onClose }) {
  const updateTask = useTaskStore((s) => s.updateTask)
  const [title, setTitle] = useState('')
  const [fields, setFields] = useState({
    deadline: null,
    priority: 'medium',
    energy: 'medium',
    estimated_minutes: 30,
  })

  useEffect(() => {
    if (!task) return
    setTitle(task.title ?? '')
    setFields({
      deadline: task.deadline ?? null,
      priority: task.priority ?? 'medium',
      energy: task.energy ?? 'medium',
      estimated_minutes: task.estimated_minutes ?? 30,
    })
  }, [task])

  if (!task) return null

  const handleSave = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    updateTask(task.id, { title: title.trim(), ...fields })
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5 neon-border-purple"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold">Edit task</h3>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-400">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-purple-500/50 focus:ring-2"
            />

            <TaskFields
              values={fields}
              onChange={(updates) => setFields((prev) => ({ ...prev, ...updates }))}
              showEstimated
            />

            <button
              type="submit"
              disabled={!title.trim()}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Save changes
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
