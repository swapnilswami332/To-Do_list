import { useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'

const SWIPE_THRESHOLD = 80

export default function GestureHandler({
  children,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onLongPress,
  disabled = false,
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const longPressRef = useRef(null)
  const longPressFired = useRef(false)

  const bgTint = useTransform(
    x,
    [-120, 0, 120],
    [
      'rgba(245, 158, 11, 0.15)',
      'rgba(255, 255, 255, 0)',
      'rgba(34, 197, 94, 0.15)',
    ]
  )

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }, [])

  const bind = useDrag(
    ({ movement: [mx, my], down, cancel }) => {
      if (disabled) return

      if (down) {
        x.set(mx)
        y.set(my)
        if (!longPressRef.current && !longPressFired.current && onLongPress) {
          longPressRef.current = setTimeout(() => {
            longPressFired.current = true
            onLongPress()
            cancel()
          }, 500)
        }
        if (Math.abs(mx) > 10 || Math.abs(my) > 10) {
          clearLongPress()
        }
      } else {
        clearLongPress()
        if (!longPressFired.current) {
          if (Math.abs(mx) > SWIPE_THRESHOLD && Math.abs(mx) > Math.abs(my)) {
            if (mx > 0) onSwipeRight?.()
            else onSwipeLeft?.()
          } else if (my < -SWIPE_THRESHOLD && Math.abs(my) > Math.abs(mx)) {
            onSwipeUp?.()
          }
        }
        longPressFired.current = false
        x.set(0)
        y.set(0)
      }
    },
    { filterTaps: false, threshold: 5 }
  )

  return (
    <div className="relative touch-pan-y">
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ backgroundColor: bgTint }}
      />
      <motion.div
        {...bind()}
        style={{ x, y }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  )
}
