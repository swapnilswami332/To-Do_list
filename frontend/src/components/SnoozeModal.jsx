import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X } from 'lucide-react'

const OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: 'Tomorrow', hours: 24 },
  { label: '3 days', hours: 72 },
]

export default function SnoozeModal({ task, onSnooze, onClose }) {
  if (!task) return null

  const snooze = (hours) => {
    const until = new Date(Date.now() + hours * 3600000).toISOString()
    onSnooze(task.id, until)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-strong w-full max-w-sm rounded-2xl p-5 neon-border-purple"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold">Snooze task</h3>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-4 text-sm text-slate-400">{task.title}</p>
          <div className="flex flex-col gap-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => snooze(opt.hours)}
                className="rounded-xl bg-white/5 px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
