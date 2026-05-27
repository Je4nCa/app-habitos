import { useMemo } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { usePlayerStore } from '@/store/playerStore'
import { HabitCard } from '@/components/HabitCard'
import { ProgressRing } from '@/components/ProgressRing'
import { SleepCard } from '@/components/SleepCard'
import { today, formatDisplayDate, isHabitScheduledForDate, toDateString } from '@/lib/dates'
import { calcDayPoints, getStreak } from '@/lib/points'

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}

export function TodayPage() {
  const habits = useHabitsStore(s => s.habits)
  const { logs, toggleLog, isCompleted } = useLogsStore()
  const { playerName } = usePlayerStore()

  const todayStr   = today()
  const yesterdayStr = yesterday()

  const morningHabits = useMemo(
    () => habits
      .filter(h => !h.archivedAt && h.isMorning && isHabitScheduledForDate(h, yesterdayStr))
      .sort((a, b) => a.order - b.order),
    [habits, yesterdayStr]
  )

  const regularHabits = useMemo(
    () => habits
      .filter(h => !h.archivedAt && !h.isMorning && isHabitScheduledForDate(h, todayStr))
      .sort((a, b) => a.order - b.order),
    [habits, todayStr]
  )

  const allScheduled = [...morningHabits, ...regularHabits]
  const completedCount =
    morningHabits.filter(h => isCompleted(h.id, yesterdayStr)).length +
    regularHabits.filter(h => isCompleted(h.id, todayStr)).length
  const allDone = allScheduled.length > 0 && completedCount === allScheduled.length

  const dayPoints = useMemo(
    () => calcDayPoints(todayStr, habits, logs),
    [todayStr, habits, logs]
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-5 pt-safe pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {formatDisplayDate(todayStr)}
            </p>
            <h1 className="text-2xl font-bold mt-0.5">
              {allDone
                ? '¡Todo listo! 🎉'
                : playerName
                  ? `Hola, ${playerName}`
                  : 'Buenos días'}
            </h1>
          </div>
          <div className="relative">
            <ProgressRing completed={completedCount} total={allScheduled.length} size={56} strokeWidth={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">
                {allScheduled.length === 0 ? '–' : `${completedCount}/${allScheduled.length}`}
              </span>
            </div>
          </div>
        </div>

        {dayPoints.total > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <PointChip label={`+${dayPoints.base} base`} color="violet" />
            {dayPoints.streakBonus > 0 && (
              <PointChip label={`+${dayPoints.streakBonus} racha 🔥`} color="amber" />
            )}
            {dayPoints.perfectDayBonus > 0 && (
              <PointChip label={`+${dayPoints.perfectDayBonus} día perfecto ⭐`} color="emerald" />
            )}
            <span className="text-xs font-bold text-primary ml-auto">{dayPoints.total} pts hoy</span>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 pb-32 space-y-3">
        {allScheduled.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center">
            <span className="text-5xl">🌴</span>
            <p className="text-muted-foreground text-sm">No hay hábitos para hoy</p>
            <p className="text-muted-foreground text-xs">Ve a <strong>Hábitos</strong> para agregar uno</p>
          </div>
        ) : (
          <>
            {/* Morning check-in section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">☀️</span>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Al despertar</p>
                <span className="text-xs text-muted-foreground">(de anoche)</span>
              </div>

              {/* Sleep tracker always visible in morning section */}
              <SleepCard date={yesterdayStr} />

              {morningHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed={isCompleted(habit.id, yesterdayStr)}
                  onToggle={() => toggleLog(habit.id, yesterdayStr)}
                  streak={getStreak(habit.id, logs, yesterdayStr)}
                />
              ))}
            </section>

            {/* Regular habits */}
            {regularHabits.length > 0 && (
              <section className="space-y-3">
                {morningHabits.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base">📋</span>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Del día</p>
                  </div>
                )}
                {regularHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completed={isCompleted(habit.id, todayStr)}
                    onToggle={() => toggleLog(habit.id, todayStr)}
                    streak={getStreak(habit.id, logs, todayStr)}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function PointChip({ label, color }: { label: string; color: 'violet' | 'amber' | 'emerald' }) {
  const colors = {
    violet:  'bg-violet-500/15 text-violet-400',
    amber:   'bg-amber-500/15 text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>
      {label}
    </span>
  )
}
