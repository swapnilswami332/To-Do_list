import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useTimeOfDay } from '../hooks/useTimeOfDay'

export default function AdaptiveHeader() {
  const period = useTimeOfDay()

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="mb-1 flex items-center gap-2">
        <Sparkles
          className={`h-5 w-5 ambient-glow ${
            period.accent === 'purple' ? 'text-purple-400' : 'text-blue-400'
          }`}
        />
        <span className="text-sm font-medium text-slate-400">Pulse List</span>
      </div>
      <h1
        className={`text-3xl font-bold tracking-tight ${
          period.accent === 'purple'
            ? 'bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent'
        }`}
      >
        {period.title}
      </h1>
      <p className="mt-1 text-sm text-slate-400">{period.subtitle}</p>
    </motion.header>
  )
}
