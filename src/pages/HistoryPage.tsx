import { useMemo } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { useSleepStore } from '@/store/sleepStore'
import { getLast30Days, formatShortDate, isHabitScheduledForDate } from '@/lib/dates'
import { getColor } from '@/lib/colors'
import { sleepQuality } from '@/types'

const SLEEP_BAR_COLOR: Record<string, string> = {
  excellent: 'bg-violet-500',
  good:      'bg-emerald-500',
  fair:      'bg-amber-500',
  poor:      'bg-rose-500',
}
const SLEEP_TEXT_COLOR: Record<string, string> = {
  excellent: 'text-violet-400',
  good:      'text-emerald-400',
  fair:      'text-amber-400',
  poor:      'text-rose-400',
}

export function HistoryPage() {
  const habits = useHabitsStore(s => s.habits)
  const { logs } = useLogsStore()
  const { entries: sleepEntries } = useSleepStore()

  const last30 = useMemo(() => getLast30Days(), [])

  const activeHabits = habits.filter(h => !h.archivedAt).sort((a, b) => a.order - b.order)

  const stats = useMemo(() => {
    return last30.map(date => {
      const scheduled = activeHabits.filter(h => isHabitScheduledForDate(h, date))
      const completed = scheduled.filter(h => logs.some(l => l.habitId === h.id && l.completedAt === date))
      return { date, total: scheduled.length, completed: completed.length }
    })
  }, [last30, activeHabits, logs])

  const overallPct = useMemo(() => {
    const totalSlots = stats.reduce((acc, s) => acc + s.total, 0)
    const totalDone  = stats.reduce((acc, s) => acc + s.completed, 0)
    return totalSlots === 0 ? 0 : Math.round((totalDone / totalSlots) * 100)
  }, [stats])

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-5 pt-safe pb-4">
        <h1 className="text-2xl font-bold">Historial</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Últimos 30 días</p>
      </header>

      <main className="flex-1 px-4 pb-32 space-y-6">

        {/* Overall stat */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tasa de completado</p>
            <p className="text-4xl font-bold mt-1">{overallPct}%</p>
            <p className="text-xs text-muted-foreground mt-1">en los últimos 30 días</p>
          </div>
          <div className="text-6xl">
            {overallPct >= 80 ? '🔥' : overallPct >= 50 ? '💪' : '🌱'}
          </div>
        </div>

        {/* Heatmap grid */}
        <section>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
            Actividad diaria
          </p>
          <div className="grid grid-cols-10 gap-1.5">
            {stats.map(({ date, total, completed }) => {
              const pct = total === 0 ? 0 : completed / total
              const opacity =
                total === 0 ? 'bg-muted/40' :
                pct === 0   ? 'bg-muted' :
                pct < 0.5   ? 'bg-primary/30' :
                pct < 1     ? 'bg-primary/60' :
                              'bg-primary'
              return (
                <div key={date} className="flex flex-col items-center gap-0.5">
                  <div className={`w-full aspect-square rounded-md ${opacity} transition-all duration-200`} />
                  <span className="text-[8px] text-muted-foreground">{formatShortDate(date).split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="text-[10px] text-muted-foreground">Menos</span>
            {['bg-muted', 'bg-primary/30', 'bg-primary/60', 'bg-primary'].map(c => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">Más</span>
          </div>
        </section>

        {/* Per-habit streaks */}
        {activeHabits.length > 0 && (
          <section>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
              Por hábito
            </p>
            <div className="space-y-3">
              {activeHabits.map(habit => {
                const color = getColor(habit.color)
                const habitLogs = logs.filter(l => l.habitId === habit.id)
                const scheduled30 = last30.filter(d => isHabitScheduledForDate(habit, d))
                const done30 = scheduled30.filter(d => habitLogs.some(l => l.completedAt === d))
                const pct = scheduled30.length === 0 ? 0 : Math.round((done30.length / scheduled30.length) * 100)

                return (
                  <div key={habit.id} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-xl ${color.light}`}>
                        {habit.emoji}
                      </div>
                      <p className="font-semibold flex-1 truncate">{habit.name}</p>
                      <span className={`text-sm font-bold ${color.text}`}>{pct}%</span>
                    </div>
                    {/* Mini bar chart — last 14 days */}
                    <div className="flex gap-1 items-end h-8">
                      {last30.slice(-14).map(date => {
                        const inSchedule = isHabitScheduledForDate(habit, date)
                        const done = habitLogs.some(l => l.completedAt === date)
                        return (
                          <div
                            key={date}
                            className={`flex-1 rounded-sm transition-all duration-200 ${
                              !inSchedule ? 'bg-muted/30 h-1' :
                              done        ? `${color.bg} h-full` :
                                           'bg-muted h-2'
                            }`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Sleep history */}
        {sleepEntries.length > 0 && (
          <section>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">
              Sueño (Garmin)
            </p>
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">

              {/* Summary row */}
              {(() => {
                const recent = sleepEntries
                  .filter(e => last30.includes(e.date))
                  .sort((a, b) => a.date.localeCompare(b.date))
                if (recent.length === 0) return null
                const avgScore = Math.round(recent.reduce((s, e) => s + e.score, 0) / recent.length)
                const avgHours = (recent.reduce((s, e) => s + e.hours, 0) / recent.length).toFixed(1)
                const q = sleepQuality(avgScore)
                return (
                  <div className="flex gap-3">
                    <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${SLEEP_TEXT_COLOR[q]}`}>{avgScore}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Score promedio</p>
                    </div>
                    <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold">{avgHours}h</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Horas promedio</p>
                    </div>
                    <div className="flex-1 bg-muted rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold">{recent.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Noches</p>
                    </div>
                  </div>
                )
              })()}

              {/* Bar chart — last 14 nights with data */}
              {(() => {
                const last14 = last30.slice(-14)
                const maxScore = 100
                return (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Últimas 2 semanas</p>
                    <div className="flex gap-1 items-end h-20">
                      {last14.map(date => {
                        const entry = sleepEntries.find(e => e.date === date)
                        if (!entry) {
                          return (
                            <div key={date} className="flex-1 flex flex-col items-center gap-0.5">
                              <div className="flex-1 w-full" />
                              <div className="h-1 w-full rounded-sm bg-muted/30" />
                              <span className="text-[8px] text-muted-foreground/40">{formatShortDate(date).split(' ')[0]}</span>
                            </div>
                          )
                        }
                        const q = sleepQuality(entry.score)
                        const heightPct = (entry.score / maxScore) * 100
                        return (
                          <div key={date} className="flex-1 flex flex-col items-center gap-0.5 group">
                            <span className="text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {entry.score}
                            </span>
                            <div className="flex-1 w-full flex items-end">
                              <div
                                className={`w-full rounded-t-sm ${SLEEP_BAR_COLOR[q]} transition-all duration-300`}
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <span className="text-[8px] text-muted-foreground">{formatShortDate(date).split(' ')[0]}</span>
                          </div>
                        )
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex gap-3 mt-2 justify-center flex-wrap">
                      {(['excellent','good','fair','poor'] as const).map(q => (
                        <div key={q} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${SLEEP_BAR_COLOR[q]}`} />
                          <span className={`text-[10px] ${SLEEP_TEXT_COLOR[q]}`}>
                            {q === 'excellent' ? 'Excelente 85+' : q === 'good' ? 'Bueno 70-84' : q === 'fair' ? 'Regular 50-69' : 'Bajo <50'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
