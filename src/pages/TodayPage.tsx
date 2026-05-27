import { useMemo } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { HabitCard } from '@/components/HabitCard'
import { ProgressRing } from '@/components/ProgressRing'
import { today, formatDisplayDate, isHabitScheduledForDate, toDateString } from '@/lib/dates'

function getStreak(habitId: string, logs: { habitId: string; completedAt: string }[]): number {
  let streak = 0
  const d = new Date()
  while (true) {
    const dateStr = toDateString(d)
    const done = logs.some(l => l.habitId === habitId && l.completedAt === dateStr)
    if (!done) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function TodayPage() {
  const habits = useHabitsStore(s => s.habits)
  const { logs, toggleLog, isCompleted } = useLogsStore()

  const todayStr = today()

  const scheduled = useMemo(
    () => habits
      .filter(h => !h.archivedAt && isHabitScheduledForDate(h, todayStr))
      .sort((a, b) => a.order - b.order),
    [habits, todayStr]
  )

  const completedCount = scheduled.filter(h => isCompleted(h.id, todayStr)).length

  const allDone = scheduled.length > 0 && completedCount === scheduled.length

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-5 pt-safe pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {formatDisplayDate(todayStr)}
          </p>
          <h1 className="text-2xl font-bold mt-0.5">
            {allDone ? '¡Todo listo! 🎉' : 'Buenos días'}
          </h1>
        </div>
        <div className="relative">
          <ProgressRing completed={completedCount} total={scheduled.length} size={56} strokeWidth={5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">
              {scheduled.length === 0 ? '–' : `${completedCount}/${scheduled.length}`}
            </span>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="flex-1 px-4 pb-32 space-y-3">
        {scheduled.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center">
            <span className="text-5xl">🌴</span>
            <p className="text-muted-foreground text-sm">No hay hábitos para hoy</p>
            <p className="text-muted-foreground text-xs">Ve a <strong>Hábitos</strong> para agregar uno</p>
          </div>
        ) : (
          scheduled.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completed={isCompleted(habit.id, todayStr)}
              onToggle={() => toggleLog(habit.id, todayStr)}
              streak={getStreak(habit.id, logs)}
            />
          ))
        )}
      </main>
    </div>
  )
}
