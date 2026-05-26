import { Calendar, Flag, Zap, Clock } from 'lucide-react'
import { toDatetimeLocalValue, fromDatetimeLocalValue } from '../utils/timeHelpers'

const PRIORITIES = ['low', 'medium', 'high']
const ENERGIES = ['low', 'medium', 'high']

export default function TaskFields({ values, onChange, showEstimated = false }) {
  const deadlineLocal = toDatetimeLocalValue(values.deadline)

  return (
    <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          Deadline
        </label>
        <input
          type="datetime-local"
          value={deadlineLocal}
          onChange={(e) => onChange({ deadline: fromDatetimeLocalValue(e.target.value) })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-blue-500/50 focus:ring-2 [color-scheme:dark]"
        />
        {values.deadline && (
          <button
            type="button"
            onClick={() => onChange({ deadline: null })}
            className="mt-1 text-xs text-slate-500 hover:text-slate-300"
          >
            Clear deadline
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
            <Flag className="h-3.5 w-3.5" />
            Priority
          </label>
          <select
            value={values.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-blue-500/50 focus:ring-2"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="bg-slate-900">
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
            <Zap className="h-3.5 w-3.5" />
            Energy
          </label>
          <select
            value={values.energy}
            onChange={(e) => onChange({ energy: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-blue-500/50 focus:ring-2"
          >
            {ENERGIES.map((e) => (
              <option key={e} value={e} className="bg-slate-900">
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showEstimated && (
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Estimated time (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={480}
            value={values.estimated_minutes ?? 30}
            onChange={(e) =>
              onChange({ estimated_minutes: Math.max(1, Number(e.target.value) || 30) })
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-blue-500/50 focus:ring-2 [color-scheme:dark]"
          />
        </div>
      )}
    </div>
  )
}
