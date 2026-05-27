import { useState } from 'react'
import { Moon, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { useSleepStore } from '@/store/sleepStore'
import { sleepQuality } from '@/types'

interface SleepCardProps {
  date: string  // the night being logged (yesterday)
}

const QUALITY_CONFIG = {
  excellent: { label: 'Excelente', color: 'text-violet-400', bg: 'bg-violet-500/20', ring: 'ring-violet-500/50', bar: 'bg-violet-500' },
  good:      { label: 'Bueno',     color: 'text-emerald-400', bg: 'bg-emerald-500/20', ring: 'ring-emerald-500/50', bar: 'bg-emerald-500' },
  fair:      { label: 'Regular',   color: 'text-amber-400', bg: 'bg-amber-500/20', ring: 'ring-amber-500/50', bar: 'bg-amber-500' },
  poor:      { label: 'Bajo',      color: 'text-rose-400', bg: 'bg-rose-500/20', ring: 'ring-rose-500/50', bar: 'bg-rose-500' },
}

export function SleepCard({ date }: SleepCardProps) {
  const { entries, logSleep, deleteSleep } = useSleepStore()
  const entry = entries.find(e => e.date === date)

  const [editing, setEditing] = useState(!entry)
  const [score, setScore] = useState(entry?.score ?? 75)
  const [hours, setHours] = useState(entry?.hours ?? 7)
  const [expanded, setExpanded] = useState(!entry)

  const quality = sleepQuality(score)
  const cfg = QUALITY_CONFIG[quality]

  const handleSave = () => {
    logSleep(date, score, hours)
    setEditing(false)
  }

  const handleEdit = () => {
    setScore(entry?.score ?? score)
    setHours(entry?.hours ?? hours)
    setEditing(true)
    setExpanded(true)
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
              {entry.score} pts · {entry.hours}h · {cfg.label}
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
            ? <ChevronUp size={16} className="text-muted-foreground" />
            : <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {/* Score bar (when logged, collapsed) */}
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

      {/* Expanded / editing form */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-black/10">
          <div className="pt-3 space-y-4">

            {/* Score */}
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
                <span>0</span>
                <span className="text-rose-400">Bajo &lt;50</span>
                <span className="text-amber-400">Regular 50–69</span>
                <span className="text-emerald-400">Bueno 70–84</span>
                <span className="text-violet-400">Excelente 85+</span>
                <span>100</span>
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Horas dormidas
                </label>
                <span className="text-xl font-bold">{hours}h</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(h => (
                  <button
                    key={h}
                    onClick={() => setHours(h)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      hours === h ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {entry && (
                <button
                  onClick={() => { deleteSleep(date); setEditing(false); setExpanded(false) }}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground"
                >
                  Borrar
                </button>
              )}
              <button
                onClick={() => { setExpanded(false); setEditing(false) }}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
