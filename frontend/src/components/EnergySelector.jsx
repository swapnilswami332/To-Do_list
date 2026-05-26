import { motion } from 'framer-motion'
import { Zap, Battery, BatteryLow } from 'lucide-react'
import { useTaskStore } from '../store/useTaskStore'

const OPTIONS = [
  { value: 'low', label: 'Low', icon: BatteryLow, color: 'text-emerald-400' },
  { value: 'medium', label: 'Med', icon: Battery, color: 'text-blue-400' },
  { value: 'high', label: 'High', icon: Zap, color: 'text-purple-400' },
]

export default function EnergySelector() {
  const userEnergy = useTaskStore((s) => s.userEnergy)
  const setUserEnergy = useTaskStore((s) => s.setUserEnergy)

  return (
    <div className="glass rounded-2xl p-3">
      <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Your energy</p>
      <div className="flex gap-2">
        {OPTIONS.map(({ value, label, icon: Icon, color }) => {
          const active = userEnergy === value
          return (
            <motion.button
              key={value}
              type="button"
              onClick={() => setUserEnergy(value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-all ${
                active
                  ? 'glass-strong neon-border-purple text-white'
                  : 'text-slate-400 hover:bg-white/5'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`h-4 w-4 ${active ? color : ''}`} />
              {label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
