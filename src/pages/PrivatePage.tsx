import { useState, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useIntimacyStore } from '@/store/intimacyStore'
import { usePlayerStore } from '@/store/playerStore'
import { today, toDateString } from '@/lib/dates'

const DAY_NAMES  = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const startPad = firstDow === 0 ? 6 : firstDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(startPad).fill(null)
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(toDateString(new Date(year, month, d)))
  return cells
}

// Streak: consecutive logged days backwards from today
function calcStreak(isLogged: (d: string) => boolean): number {
  let count = 0
  const d = new Date()
  while (true) {
    if (!isLogged(toDateString(d))) break
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export function PrivatePage() {
  const { entries, logDay, unlogDay, isLogged, updateNote } = useIntimacyStore()
  const { playerName, partnerName } = usePlayerStore()

  const todayStr = today()
  const now      = new Date()

  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selected,  setSelected]  = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [editNote,  setEditNote]  = useState(false)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  // Stats
  const monthPrefix    = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthCount = entries.filter(e => e.date.startsWith(monthPrefix)).length
  const streak         = useMemo(() => calcStreak(isLogged), [entries])
  const todayLogged    = isLogged(todayStr)

  const selectedEntry  = selected ? entries.find(e => e.date === selected) : null

  const prevMonth = () => viewMonth === 0
    ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1)
  const nextMonth = () => viewMonth === 11
    ? (setViewYear(y => y + 1), setViewMonth(0))  : setViewMonth(m => m + 1)

  const handleToggleToday = () => {
    if (todayLogged) unlogDay(todayStr)
    else logDay(todayStr)
  }

  const handleDayTap = (dateStr: string) => {
    if (dateStr > todayStr) return   // no futuras
    if (selected === dateStr) {
      setSelected(null)
      setEditNote(false)
    } else {
      setSelected(dateStr)
      const e = entries.find(en => en.date === dateStr)
      setNoteInput(e?.note ?? '')
      setEditNote(false)
    }
  }

  const handleToggleSelected = () => {
    if (!selected) return
    if (isLogged(selected)) { unlogDay(selected); setSelected(null) }
    else logDay(selected)
  }

  const handleSaveNote = () => {
    if (!selected) return
    if (!isLogged(selected)) logDay(selected, noteInput)
    else updateNote(selected, noteInput)
    setEditNote(false)
  }

  const fmtSelected = selected
    ? new Date(selected + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <div className="flex flex-col min-h-full">

      {/* Discreet header */}
      <header className="px-5 pt-safe pb-3">
        <div className="flex items-center gap-2.5">
          <Heart size={22} className="text-rose-400 flex-shrink-0" fill="currentColor" />
          <div>
            <h1 className="text-2xl font-bold">Nosotros</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {playerName} &amp; {partnerName}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-32 space-y-5">

        {/* Today big button */}
        <button
          onClick={handleToggleToday}
          style={{ transition: 'transform 200ms cubic-bezier(0.23,1,0.32,1), background-color 220ms ease, border-color 220ms ease' }}
          className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg active:scale-[0.97] ${
            todayLogged
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
              : 'bg-card border border-border text-foreground'
          }`}
        >
          <Heart
            size={26}
            style={{ transition: 'fill 220ms ease, color 220ms ease' }}
            className={todayLogged ? 'fill-rose-400 text-rose-400' : 'text-muted-foreground'}
          />
          {todayLogged ? '¡Registrado hoy! 💕' : 'Registrar hoy'}
        </button>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: thisMonthCount, label: 'Este mes' },
            { value: streak,         label: 'Racha 🔥'  },
            { value: entries.length, label: 'Total'     },
          ].map(({ value, label }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-rose-400">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth}
            style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-[0.97]">
            <ChevronLeft size={18} />
          </button>
          <p className="font-bold">{MONTH_NAMES[viewMonth]} {viewYear}</p>
          <button onClick={nextMonth}
            style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-[0.97]">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="grid grid-cols-7 mb-1.5">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((dateStr, i) => {
              if (!dateStr) return <div key={`pad-${i}`} />
              const logged   = isLogged(dateStr)
              const isToday  = dateStr === todayStr
              const isFuture = dateStr > todayStr
              const isSel    = dateStr === selected

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayTap(dateStr)}
                  disabled={isFuture}
                  style={{ transition: 'transform 110ms cubic-bezier(0.23,1,0.32,1), background-color 110ms ease' }}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold
                    ${isFuture ? 'opacity-20 cursor-not-allowed' : 'active:scale-[0.88]'}
                    ${logged && !isSel ? 'bg-rose-500/20 text-rose-400' : ''}
                    ${isSel   ? 'bg-rose-500 text-white' : ''}
                    ${isToday && !isSel && !logged ? 'bg-primary/20 text-primary' : ''}
                  `}
                >
                  {logged
                    ? <Heart size={14} className={isSel ? 'fill-white text-white' : 'fill-rose-400 text-rose-400'} />
                    : <span>{Number(dateStr.split('-')[2])}</span>
                  }
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day detail */}
        {selected && selected !== todayStr && (
          <div className={`rounded-2xl border p-4 space-y-3 animate-scale-in ${
            isLogged(selected)
              ? 'border-rose-500/40 bg-rose-500/10'
              : 'border-border bg-card'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground capitalize">{fmtSelected}</p>
                <p className="font-semibold mt-0.5">
                  {isLogged(selected) ? '💕 Registrado' : '—'}
                </p>
              </div>
              <button
                onClick={handleToggleSelected}
                style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-[0.95] ${
                  isLogged(selected)
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isLogged(selected) ? 'Quitar' : 'Registrar'}
              </button>
            </div>

            {/* Note */}
            {isLogged(selected) && (
              <div>
                {editNote ? (
                  <div className="space-y-2">
                    <textarea
                      ref={noteRef}
                      rows={2}
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Nota opcional…"
                      className="w-full bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setEditNote(false)}
                        style={{ transition: 'transform 130ms cubic-bezier(0.23,1,0.32,1)' }}
                        className="flex-1 py-1.5 rounded-xl border border-border text-xs font-semibold active:scale-[0.97]">
                        Cancelar
                      </button>
                      <button onClick={handleSaveNote}
                        style={{ transition: 'transform 130ms cubic-bezier(0.23,1,0.32,1)' }}
                        className="flex-1 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.97]">
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setNoteInput(selectedEntry?.note ?? ''); setEditNote(true) }}
                    className="w-full text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {selectedEntry?.note
                      ? `"${selectedEntry.note}"`
                      : '+ Agregar nota privada'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Frequency tip */}
        {entries.length > 0 && (
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <p className="text-xs text-muted-foreground text-center">
              {entries.length === 1
                ? 'Primera vez registrada 🥳'
                : thisMonthCount === 0
                  ? 'Ninguna vez este mes'
                  : thisMonthCount === 1
                    ? '1 vez este mes'
                    : `${thisMonthCount} veces este mes · aprox. cada ${Math.round(now.getDate() / thisMonthCount)} días`
              }
            </p>
          </div>
        )}

      </main>
    </div>
  )
}
