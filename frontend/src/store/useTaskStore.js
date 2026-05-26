import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { toDateKey } from '../utils/timeHelpers'

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      userEnergy: 'medium',
      habits: [],
      dailyStats: {},
      focusSession: null,
      activeView: 'home',
      highlightedTaskId: null,
      showStats: false,
      showInput: false,
      focusDurationMinutes: 25,

      setUserEnergy: (energy) => set({ userEnergy: energy }),
      setFocusDurationMinutes: (minutes) => set({ focusDurationMinutes: minutes }),
      setActiveView: (view) => set({ activeView: view }),
      setHighlightedTaskId: (id) => set({ highlightedTaskId: id }),
      setShowStats: (show) => set({ showStats: show }),
      setShowInput: (show) => set({ showInput: show }),

      addTask: (taskData) => {
        const tasks = get().tasks
        const task = {
          id: uuidv4(),
          title: taskData.title,
          completed: false,
          priority: taskData.priority || 'medium',
          energy: taskData.energy || 'medium',
          deadline: taskData.deadline || null,
          estimated_minutes: taskData.estimated_minutes || 30,
          created_at: new Date().toISOString(),
          completed_at: null,
          snoozed_until: null,
          order: tasks.length,
        }
        set({ tasks: [...tasks, task] })
        get().recordDailyStat('total', 1)
        return task
      },

      updateTask: (id, updates) => {
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })
      },

      completeTask: (id) => {
        const now = new Date().toISOString()
        set({
          tasks: get().tasks.map((t) =>
            t.id === id ? { ...t, completed: true, completed_at: now } : t
          ),
        })
        get().recordDailyStat('completed', 1)
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) })
      },

      snoozeTask: (id, until) => {
        get().updateTask(id, { snoozed_until: until })
      },

      reorderTasks: (orderedIds) => {
        const map = Object.fromEntries(orderedIds.map((id, i) => [id, i]))
        set({
          tasks: get().tasks
            .map((t) => ({ ...t, order: map[t.id] ?? t.order }))
            .sort((a, b) => a.order - b.order),
        })
      },

      addHabit: (habit) => {
        set({
          habits: [
            ...get().habits,
            { id: uuidv4(), ...habit },
          ],
        })
      },

      updateHabit: (id, updates) => {
        set({
          habits: get().habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })
      },

      recordDailyStat: (field, delta = 1) => {
        const key = toDateKey()
        const stats = { ...get().dailyStats }
        if (!stats[key]) stats[key] = { completed: 0, total: 0 }
        stats[key][field] = (stats[key][field] || 0) + delta
        set({ dailyStats: stats })
      },

      startFocus: (taskId) => {
        const totalSeconds = get().focusDurationMinutes * 60
        set({
          focusSession: {
            taskId,
            secondsLeft: totalSeconds,
            totalSeconds,
            isRunning: false,
            ambientOn: false,
          },
        })
      },

      setFocusTimerMinutes: (minutes) => {
        const clamped = Math.min(120, Math.max(1, minutes))
        set({ focusDurationMinutes: clamped })
        const session = get().focusSession
        if (session && !session.isRunning) {
          const totalSeconds = clamped * 60
          set({
            focusSession: {
              ...session,
              secondsLeft: totalSeconds,
              totalSeconds,
            },
          })
        }
      },

      updateFocus: (updates) => {
        const session = get().focusSession
        if (!session) return
        set({ focusSession: { ...session, ...updates } })
      },

      endFocus: () => set({ focusSession: null }),
    }),
    { name: 'pulse-list-storage' }
  )
)
