import { useState } from 'react'
import { Moon, ChevronDown, ChevronUp, Pencil, Plus, Minus } from 'lucide-react'
import { useSleepStore } from '@/store/sleepStore'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { sleepQuality } from '@/types'

interface SleepCardProps {
  date: string
}

const QUALITY_CONFIG = {
  excellent: { label: 'Excelente', color: 'text-violet-400', bg: 'bg-violet-500/20', ring: 'ring-violet-500/50', bar: 'bg-violet-500' },
  good:      { label: 'Bueno',     color: 'text-emerald-400', bg: 'bg-emerald-500/20', ring: 'ring-emerald-500/50', bar: 'bg-emerald-500' },
  fair:      { label: 'Regular',   color: 'text-amber-400',   bg: 'bg-amber-500/20',   ring: 'ring-amber-500/50',   bar: 'bg-amber-500' },
  poor:      { label: 'Bajo',      color: 'text-rose-400',    bg: 'bg-rose-500/20',    ring: 'ring-rose-500/50',    bar: 'bg-rose-500' },
}

function formatHours(h: number): string {
  const hrs  = Math.floor(h)
  const mins = Math.round((h % 1) * 60)
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}min`
}

function decimalToHM(h: number): [number, number] {
  const hrs  = Math.floor(h)
  const mins = Math.round((h % 1) * 60)
  return [hrs, mins]
}

function Spinner({
  label, value, onDec, onInc, min, max,
}: { label: string; value: number; onDec: () => void; onInc: () => void; min: number; max: number }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec}
          disabled={value <= min}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span className="text-4xl font-bold tabular-nums w-14 text-center">
          {String(value).padStart(2, '0')}
        </span>
        <button
          onClick={onInc}
          disabled={value >= max}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export function SleepCard({ date }: SleepCardProps) {
  const { entries, logSleep, deleteSleep } = useSleepStore()
  const habits = useHabitsStore(s => s.habits)
  const { isCompleted, toggleLog } = useLogsStore()
  const entry = entries.find(e => e.date === date)

  const [initialHrs, initialMins] = entry ? decimalToHM(entry.hours) : [7, 30]

  const [editing,  setEditing]  = useState(!entry)
  const [score,    setScore]    = useState(entry?.score ?? 75)
  const [hrs,      setHrs]      = useState(initialHrs)
  const [mins,     setMins]     = useState(initialMins)
  const [expanded, setExpanded] = useState(!entry)

  const syncSleepHabit = (savedHours: number) => {
    const sleepHabit = habits.find(h => h.isSleepDurationGoal && !h.archivedAt)
    if (!sleepHabit) return
    const currentlyDone = isCompleted(sleepHabit.id, date)
    const shouldBeDone  = savedHours >= 8
    if (shouldBeDone !== currentlyDone) toggleLog(sleepHabit.id, date)
  }

  const quality = sleepQuality(score)
  const cfg     = QUALITY_CONFIG[quality]
  const totalHours = hrs + mins / 60

  const handleSave = () => {
    logSleep(date, score, totalHours)
    syncSleepHabit(totalHours)
    setEditing(false)
    setExpanded(false)
  }

  const handleEdit = () => {
    if (entry) {
      const [h, m] = decimalToHM(entry.hours)
      setScore(entry.score)
      setHrs(h)
      setMins(m)
    }
    setEditing(true)
    setExpanded(true)
  }

  const handleDelete = () => {
    deleteSleep(date)
    const sleepHabit = habits.find(h => h.isSleepDurationGoal && !h.archivedAt)
    if (sleepHabit && isCompleted(sleepHabit.id, date)) toggleLog(sleepHabit.id, date)
    setEditing(false)
    setExpanded(false)
  }

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      entry ? `${cfg.bg} border-transparent` : 'bg-card border-border'
    }`}>
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5"
        onClick={() => !editing && setExpanded(v => !v)}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry ? cfg.bg : 'bg-muted'}`}>
          <Moon size={20} className={entry ? cfg.color : 'text-muted-foreground'} />
        </div>

        <div className="flex-1 text-left">
          <p className="font-semibold text-sm">Sueño de anoche</p>
          {entry ? (
            <p className={`text-xs mt-0.5 font-medium ${cfg.color}`}>
              {entry.score} pts · {formatHours(entry.hours)} · {cfg.label}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">Toca para registrar</p>
          )}
        </div>

        {entry && !editing && (
          <button
            onClick={e => { e.stopPropagation(); handleEdit() }}
            className="p-1.5 text-muted-foreground"
          >
            <Pencil size={15} />
          </button>
        )}
        {!editing && (
          expanded
            ? <ChevronUp  size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {/* Collapsed bar */}
      {entry && !expanded && (
        <div className="px-4 pb-3">
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
              style={{ width: `${entry.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded form */}
      {expanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-black/10 pt-4">

          {/* Score slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Score Garmin
              </label>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg}`}>
                <span className={`text-lg font-bold ${cfg.color}`}>{score}</span>
                <span className={`text-xs font-medium ${cfg.color}`}>· {cfg.label}</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="w-full accent-violet-500 h-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span className="text-rose-400">Bajo &lt;50</span>
              <span className="text-amber-400">Regular 50–69</span>
              <span className="text-emerald-400">Bueno 70–84</span>
              <span className="text-violet-400">Excelente 85+</span>
            </div>
          </div>

          {/* Hours + minutes spinners */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-4">
              Horas dormidas
            </label>
            <div className="flex items-center gap-2">
              <Spinner
                label="Horas"
                value={hrs}
                min={0}
                max={14}
                onDec={() => setHrs(h => Math.max(0, h - 1))}
                onInc={() => setHrs(h => Math.min(14, h + 1))}
              />
              <span className="text-3xl font-bold text-muted-foreground self-end mb-2.5">:</span>
              <Spinner
                label="Minutos"
                value={mins}
                min={0}
                max={59}
                onDec={() => setMins(m => Math.max(0, m - 1))}
                onInc={() => setMins(m => Math.min(59, m + 1))}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Total: <span className="font-semibold text-foreground">{formatHours(totalHours)}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {entry && (
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground active:scale-95 transition-transform"
              >
                Borrar
              </button>
            )}
            <button
              onClick={() => { setExpanded(false); setEditing(false) }}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
