import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { parseTask } from '../utils/api'
import { useTaskStore } from '../store/useTaskStore'
import { formatDeadline } from '../utils/timeHelpers'
import TaskFields from './TaskFields'

export default function SmartTaskInput({ open, onClose }) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [fields, setFields] = useState({
    deadline: null,
    priority: 'medium',
    energy: 'medium',
  })
  const [loading, setLoading] = useState(false)
  const addTask = useTaskStore((s) => s.addTask)

  const reset = () => {
    setText('')
    setParsed(null)
    setFields({ deadline: null, priority: 'medium', energy: 'medium' })
  }

  const handleParse = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const result = await parseTask(text)
      setParsed(result)
      setFields({
        deadline: result.deadline || null,
        priority: result.priority || 'medium',
        energy: result.energy || 'medium',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parsed) {
      addTask({ ...parsed, ...fields })
      reset()
      onClose()
    } else {
      handleParse()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="glass-strong max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-5 neon-border-blue"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold">Smart task input</h3>
            </div>
            <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setParsed(null)
              }}
              placeholder='e.g. "Finish assignment tomorrow 5pm high priority"'
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none ring-blue-500/50 focus:ring-2"
            />
            {parsed && (
              <>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
                    {parsed.title}
                  </span>
                  {fields.deadline && (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                      {formatDeadline(fields.deadline)}
                    </span>
                  )}
                </motion.div>
                <TaskFields
                  values={fields}
                  onChange={(updates) => setFields((prev) => ({ ...prev, ...updates }))}
                />
              </>
            )}
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : parsed ? (
                'Add task'
              ) : (
                'Parse with Pulse AI'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
