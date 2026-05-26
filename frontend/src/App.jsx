import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import AdaptiveHeader from './components/AdaptiveHeader'
import EnergySelector from './components/EnergySelector'
import PulseSuggestions from './components/PulseSuggestions'
import TaskCard from './components/TaskCard'
import TimelineView from './components/TimelineView'
import FocusMode from './components/FocusMode'
import StatsPanel from './components/StatsPanel'
import SmartTaskInput from './components/SmartTaskInput'
import FloatingActionButton from './components/FloatingActionButton'
import BottomBar from './components/BottomBar'
import { useTaskStore } from './store/useTaskStore'
import { filterTodayTasks } from './utils/taskHelpers'
import { useHabitDetection } from './hooks/useHabitDetection'
import { Flame } from 'lucide-react'

function TaskList() {
  const allTasks = useTaskStore((s) => s.tasks)
  const reorderTasks = useTaskStore((s) => s.reorderTasks)
  const tasks = useMemo(() => filterTodayTasks(allTasks), [allTasks])
  const { habits } = useHabitDetection()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = tasks.map((t) => t.id)
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    const reordered = [...ids]
    reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, active.id)
    reorderTasks(reordered)
  }

  return (
    <>
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Today&apos;s tasks
        </h2>
        {tasks.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-sm text-slate-500">
            No tasks yet — tap + to add one with natural language
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {habits.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Habits
          </h2>
          <div className="flex flex-col gap-2">
            {habits.map((h) => (
              <div key={h.id} className="glass flex items-center justify-between rounded-xl p-3">
                <span className="text-sm">{h.title}</span>
                <span className="flex items-center gap-1 text-sm text-orange-400">
                  <Flame className="h-4 w-4" />
                  {h.streak} day streak
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default function App() {
  const activeView = useTaskStore((s) => s.activeView)
  const showInput = useTaskStore((s) => s.showInput)
  const setShowInput = useTaskStore((s) => s.setShowInput)
  const focusSession = useTaskStore((s) => s.focusSession)

  return (
    <div className="min-h-full bg-mesh">
      <main className="mx-auto max-w-lg px-4 pb-32 pt-8">
        {activeView === 'home' && (
          <>
            <AdaptiveHeader />
            <EnergySelector />
            <div className="mt-4">
              <PulseSuggestions />
            </div>
            <TaskList />
            <TimelineView />
          </>
        )}

        {activeView === 'timeline' && (
          <>
            <AdaptiveHeader />
            <TimelineView />
            <TaskList />
          </>
        )}
      </main>

      <FloatingActionButton onClick={() => setShowInput(true)} />
      <SmartTaskInput open={showInput} onClose={() => setShowInput(false)} />
      <BottomBar />
      {focusSession && <FocusMode />}
      <StatsPanel />
    </div>
  )
}
