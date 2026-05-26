import { motion } from 'framer-motion'

const COLORS = ['#3b82f6', '#a855f7', '#22d3ee', '#818cf8', '#c084fc']

export default function CompletionBurst({ onDone }) {
  const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    angle: (i / 10) * 360,
    color: COLORS[i % COLORS.length],
    distance: 40 + Math.random() * 40,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-2 w-2 rounded-full"
          style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.2, 0],
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onAnimationComplete={p.id === 0 ? onDone : undefined}
        />
      ))}
      <motion.div
        className="absolute h-16 w-16 rounded-full border-2 border-blue-400/60"
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}
