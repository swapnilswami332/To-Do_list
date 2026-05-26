import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function FloatingActionButton({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white neon-purple"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label="Add task"
    >
      <Plus className="h-7 w-7" />
    </motion.button>
  )
}
