import { useState, useMemo } from 'react'
import { Plus, ChevronLeft, ChevronRight, Check, Trash2, X, Clock } from 'lucide-react'
import { useCalendarStore, type CalendarEvent } from '@/store/calendarStore'
import { usePlayerStore } from '@/store/playerStore'
import { today, toDateString } from '@/lib/dates'

const DAY_NAMES  = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const EVENT_EMOJIS = ['📝','🏥','🎂','✈️','🏋️','🍽️','🎬','🛒','💊','📞','🎁','⚡','🐾','🎵','🎉','🧳']

function getMonthGrid(year: number, month: number): (string | null)[] {
  const firstDow = new Date(year, month, 1).getDay()         // 0=Sun … 6=Sat
  const startPad = firstDow === 0 ? 6 : firstDow - 1         // Monday-first grid
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(startPad).fill(null)
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(toDateString(new Date(year, month, d)))
  return cells
}

function fmtDayHeading(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

// ─── Event card ──────────────────────────────────────────────────────────────

interface EventCardProps {
  event: CalendarEvent
  meLabel: string
  partnerLabel: string
  onToggle: () => void
  onDelete: () => void
}

function EventCard({ event, meLabel, partnerLabel, onToggle, onDelete }: EventCardProps) {
  const isMe       = event.addedBy === 'me'
  const authorName = isMe ? meLabel : partnerLabel
  const leftBorder = isMe ? 'border-l-primary' : 'border-l-emerald-400'
  const authorClr  = isMe ? 'text-primary'      : 'text-emerald-400'

  const forLabel =
    event.forWhom === 'both'    ? 'Ambos'    :
    event.forWhom === 'me'      ? meLabel    : partnerLabel

  return (
    <div
      style={{ transition: 'transform 160ms cubic-bezier(0.23,1,0.32,1), opacity 160ms ease' }}
      className={`bg-card border border-border border-l-[3px] ${leftBorder} rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.98]`}
    >
      <span className="text-2xl flex-shrink-0">{event.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${event.done ? 'line-through opacity-40' : ''}`}>
          {event.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {event.time && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock size={9} /> {event.time}
            </span>
          )}
          <span className={`text-[10px] font-semibold ${authorClr}`}>{authorName}</span>
          <span className="text-[10px] text-muted-foreground">· {forLabel}</span>
        </div>
      </div>

      {/* Done toggle */}
      <button
        onClick={onToggle}
        style={{ transition: 'transform 130ms cubic-bezier(0.23,1,0.32,1), background-color 130ms ease, border-color 130ms ease' }}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 active:scale-[0.88] ${
          event.done ? 'bg-primary border-transparent' : 'border-border bg-transparent'
        }`}
      >
        {event.done && <Check size={12} strokeWidth={3} className="text-white animate-check-pop" />}
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{ transition: 'transform 130ms cubic-bezier(0.23,1,0.32,1)' }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 active:scale-[0.88] active:text-destructive"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const { events, addEvent, toggleDone, deleteEvent } = useCalendarStore()
  const { playerName, partnerName } = usePlayerStore()

  const todayStr  = today()
  const nowDate   = new Date()

  const [viewYear,  setViewYear]  = useState(nowDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(nowDate.getMonth())
  const [selected,  setSelected]  = useState<string>(todayStr)
  const [sheet,     setSheet]     = useState(false)

  // Add-form state
  const [fEmoji,    setFEmoji]    = useState('📝')
  const [fTitle,    setFTitle]    = useState('')
  const [fTime,     setFTime]     = useState('')
  const [fAddedBy,  setFAddedBy]  = useState<'me' | 'partner'>('me')
  const [fForWhom,  setFForWhom]  = useState<'me' | 'partner' | 'both'>('both')

  const meLabel      = playerName  || 'Yo'
  const partnerLabel = partnerName || 'Pareja'

  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach(e => { (map[e.date] ??= []).push(e) })
    return map
  }, [events])

  const selectedEvents = (eventsByDate[selected] ?? [])
    .slice()
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))

  const prevMonth = () => viewMonth === 0
    ? (setViewYear(y => y - 1), setViewMonth(11))
    : setViewMonth(m => m - 1)
  const nextMonth = () => viewMonth === 11
    ? (setViewYear(y => y + 1), setViewMonth(0))
    : setViewMonth(m => m + 1)

  const openSheet = () => {
    setFEmoji('📝'); setFTitle(''); setFTime('')
    setFAddedBy('me'); setFForWhom('both')
    setSheet(true)
  }

  const handleSave = () => {
    if (!fTitle.trim()) return
    addEvent({ date: selected, title: fTitle.trim(), time: fTime || undefined,
               emoji: fEmoji, addedBy: fAddedBy, forWhom: fForWhom, done: false })
    setSheet(false)
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-5 pt-safe pb-3">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Planeen juntos</p>
      </header>

      <main className="flex-1 px-4 pb-32 space-y-4">

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth}
            style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-[0.97]">
            <ChevronLeft size={18} />
          </button>
          <p className="font-bold text-lg">{MONTH_NAMES[viewMonth]} {viewYear}</p>
          <button onClick={nextMonth}
            style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-[0.97]">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-card border border-border rounded-2xl p-4">
          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1.5">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground tracking-wider">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((dateStr, i) => {
              if (!dateStr) return <div key={`pad-${i}`} />
              const isToday    = dateStr === todayStr
              const isSel      = dateStr === selected
              const dayEvts    = eventsByDate[dateStr] ?? []
              const hasMine    = dayEvts.some(e => e.addedBy === 'me')
              const hasPartner = dayEvts.some(e => e.addedBy === 'partner')

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelected(dateStr)}
                  style={{ transition: 'transform 110ms cubic-bezier(0.23,1,0.32,1), background-color 110ms ease' }}
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-semibold active:scale-[0.88] ${
                    isSel    ? 'bg-primary text-primary-foreground' :
                    isToday  ? 'bg-primary/20 text-primary' :
                    'text-foreground'
                  }`}
                >
                  <span className="leading-none">{Number(dateStr.split('-')[2])}</span>
                  {(hasMine || hasPartner) && (
                    <div className="flex gap-0.5 mt-0.5">
                      {hasMine    && <div className={`w-1 h-1 rounded-full ${isSel ? 'bg-white'      : 'bg-primary'    }`} />}
                      {hasPartner && <div className={`w-1 h-1 rounded-full ${isSel ? 'bg-white/60'   : 'bg-emerald-400'}`} />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">{meLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-muted-foreground">{partnerLabel}</span>
            </div>
          </div>
        </div>

        {/* Selected day events */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold leading-tight">
                {selected === todayStr ? 'Hoy' : fmtDayHeading(selected)}
              </p>
              {selectedEvents.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {selectedEvents.filter(e => e.done).length}/{selectedEvents.length} completados
                </p>
              )}
            </div>
            <button onClick={openSheet}
              style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-[0.97]">
              <Plus size={14} /> Agregar
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-muted-foreground">Sin planes para este día</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Toca "Agregar" para planear algo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event, i) => (
                <div key={event.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-stagger-in">
                  <EventCard
                    event={event}
                    meLabel={meLabel}
                    partnerLabel={partnerLabel}
                    onToggle={() => toggleDone(event.id)}
                    onDelete={() => deleteEvent(event.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Add event modal — centered so iOS swipe-down doesn't interfere */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-bd" onClick={() => setSheet(false)} />
          <div className="relative bg-card border border-border rounded-2xl w-full max-w-sm my-auto animate-scale-in gpu overflow-y-auto scrollbar-none max-h-[88dvh]">

            <div className="px-5 pt-5 pb-6 space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Nuevo evento</h2>
                <button onClick={() => setSheet(false)}
                  style={{ transition: 'transform 130ms cubic-bezier(0.23,1,0.32,1)' }}
                  className="p-1.5 rounded-xl bg-muted active:scale-[0.92]">
                  <X size={18} />
                </button>
              </div>

              {/* Emoji */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Emoji</p>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_EMOJIS.map(e => (
                    <button key={e} onClick={() => setFEmoji(e)}
                      style={{ transition: 'transform 120ms cubic-bezier(0.23,1,0.32,1), background-color 120ms ease' }}
                      className={`text-xl p-2 rounded-xl active:scale-[0.88] ${fEmoji === e ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">¿Qué hay?</p>
                <input
                  type="text"
                  value={fTitle}
                  onChange={e => setFTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="Ej: Cita médica, cumpleaños de mamá…"
                  autoFocus
                  autoCapitalize="sentences"
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary"
                />
              </div>

              {/* Time */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Hora <span className="normal-case font-normal">(opcional)</span></p>
                <input
                  type="time"
                  value={fTime}
                  onChange={e => setFTime(e.target.value)}
                  className="w-full bg-muted rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 ring-primary"
                />
              </div>

              {/* Added by */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Lo agrega</p>
                <div className="flex gap-2">
                  {(['me', 'partner'] as const).map(who => (
                    <button key={who} onClick={() => setFAddedBy(who)}
                      style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease' }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] ${
                        fAddedBy === who ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                      {who === 'me' ? meLabel : partnerLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* For whom */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Para</p>
                <div className="flex gap-2">
                  {(['me', 'both', 'partner'] as const).map(who => (
                    <button key={who} onClick={() => setFForWhom(who)}
                      style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease' }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] ${
                        fForWhom === who ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                      {who === 'me' ? meLabel : who === 'partner' ? partnerLabel : 'Ambos'}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={!fTitle.trim()}
                style={{ transition: 'transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-40 active:scale-[0.97]">
                Guardar evento
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
