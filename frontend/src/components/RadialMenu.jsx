import { motion } from 'framer-motion'
import { Edit3, Trash2, Clock, Focus } from 'lucide-react'

const ACTIONS = [
  { id: 'focus', label: 'Focus', icon: Focus, angle: -90, color: 'text-purple-400' },
  { id: 'edit', label: 'Edit', icon: Edit3, angle: -30, color: 'text-blue-400' },
  { id: 'snooze', label: 'Snooze', icon: Clock, angle: 30, color: 'text-amber-400' },
  { id: 'delete', label: 'Delete', icon: Trash2, angle: 90, color: 'text-red-400' },
]

export default function RadialMenu({ onAction, onClose }) {
  const radius = 70

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        {ACTIONS.map(({ id, label, icon: Icon, angle, color }, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <motion.button
              key={id}
              type="button"
              className="pointer-events-auto absolute flex flex-col items-center gap-1"
              style={{ transform: `translate(${x}px, ${y}px)` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
              onClick={() => {
                onAction(id)
                onClose()
              }}
            >
              <span className="glass-strong flex h-12 w-12 items-center justify-center rounded-full neon-blue">
                <Icon className={`h-5 w-5 ${color}`} />
              </span>
              <span className="text-xs text-slate-300">{label}</span>
            </motion.button>
          )
        })}
      </div>
    </>
  )
}
