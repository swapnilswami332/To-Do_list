import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Volume2, VolumeX, Timer } from 'lucide-react'
import { formatTimer } from '../utils/timeHelpers'
import { useTaskStore } from '../store/useTaskStore'

const TIMER_PRESETS = [15, 25, 45, 60]

export default function FocusMode() {
  const focusSession = useTaskStore((s) => s.focusSession)
  const focusDurationMinutes = useTaskStore((s) => s.focusDurationMinutes)
  const tasks = useTaskStore((s) => s.tasks)
  const updateFocus = useTaskStore((s) => s.updateFocus)
  const setFocusTimerMinutes = useTaskStore((s) => s.setFocusTimerMinutes)
  const endFocus = useTaskStore((s) => s.endFocus)
  const audioRef = useRef(null)

  const task = tasks.find((t) => t.id === focusSession?.taskId)
  const totalSeconds = focusSession?.totalSeconds ?? focusDurationMinutes * 60

  useEffect(() => {
    if (!focusSession?.isRunning) return
    const id = setInterval(() => {
      const current = useTaskStore.getState().focusSession
      if (!current || current.secondsLeft <= 0) return
      updateFocus({ secondsLeft: current.secondsLeft - 1 })
    }, 1000)
    return () => clearInterval(id)
  }, [focusSession?.isRunning, updateFocus])

  useEffect(() => {
    if (!audioRef.current) return
    if (focusSession?.ambientOn) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [focusSession?.ambientOn])

  if (!focusSession || !task) return null

  const progress = 1 - focusSession.secondsLeft / totalSeconds
  const canChangeTimer = !focusSession.isRunning

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-mesh px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          onClick={endFocus}
          className="absolute right-6 top-6 rounded-full glass p-2 text-slate-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <motion.p
          className="mb-8 max-w-md text-center text-2xl font-light tracking-tight text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {task.title}
        </motion.p>

        <div className="relative mb-6">
          <svg width={220} height={220} className="-rotate-90">
            <circle
              cx={110}
              cy={110}
              r={100}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={6}
            />
            <motion.circle
              cx={110}
              cy={110}
              r={100}
              fill="none"
              stroke="url(#focusGradient)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 100}
              animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - progress) }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-5xl text-white">
            {formatTimer(focusSession.secondsLeft)}
          </span>
        </div>

        <div className="mb-8 w-full max-w-xs">
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
            <Timer className="h-3.5 w-3.5" />
            Timer duration
            {!canChangeTimer && (
              <span className="normal-case text-slate-500">(pause to change)</span>
            )}
          </div>
          <div className="flex justify-center gap-2">
            {TIMER_PRESETS.map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={!canChangeTimer}
                onClick={() => setFocusTimerMinutes(mins)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  focusDurationMinutes === mins
                    ? 'glass-strong neon-border-purple text-white'
                    : 'glass text-slate-400 hover:text-white'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {mins}m
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <input
              type="number"
              min={1}
              max={120}
              disabled={!canChangeTimer}
              value={focusDurationMinutes}
              onChange={(e) => setFocusTimerMinutes(Number(e.target.value) || 25)}
              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white outline-none ring-purple-500/50 focus:ring-2 disabled:opacity-40 [color-scheme:dark]"
            />
            <span className="text-sm text-slate-400">minutes</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => updateFocus({ isRunning: !focusSession.isRunning })}
            className="glass-strong flex h-14 w-14 items-center justify-center rounded-full neon-blue text-white"
          >
            {focusSession.isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          <button
            type="button"
            onClick={() => updateFocus({ ambientOn: !focusSession.ambientOn })}
            className="glass flex h-14 w-14 items-center justify-center rounded-full text-slate-300"
          >
            {focusSession.ambientOn ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </button>
        </div>

        <audio
          ref={audioRef}
          loop
          src="https://cdn.pixabay.com/download/audio/2022/10/25/audio_946f71c582.mp3?filename=ambient-relaxing-music-123752.mp3"
        />
      </motion.div>
    </AnimatePresence>
  )
}
