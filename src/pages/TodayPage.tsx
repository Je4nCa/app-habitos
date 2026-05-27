import { useMemo, useState } from 'react'
import { Share2 } from 'lucide-react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { usePlayerStore } from '@/store/playerStore'
import { useSleepStore } from '@/store/sleepStore'
import { HabitCard } from '@/components/HabitCard'
import { ProgressRing } from '@/components/ProgressRing'
import { SleepCard } from '@/components/SleepCard'
import { CoupleActivitySection } from '@/components/CoupleActivitySection'
import { today, formatDisplayDate, isHabitScheduledForDate, toDateString } from '@/lib/dates'
import { calcDayPoints, getStreak } from '@/lib/points'
import { detectMilestones } from '@/lib/milestones'
import { shareAchievement } from '@/lib/shareAchievement'
import type { Milestone } from '@/lib/milestones'

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}

export function TodayPage() {
  const habits = useHabitsStore(s => s.habits)
  const { logs, toggleLog, isCompleted } = useLogsStore()
  const { playerName, partnerName } = usePlayerStore()
  const sleepEntries = useSleepStore(s => s.entries)
  const [sharingMilestone, setSharingMilestone] = useState<Milestone | null>(null)

  const todayStr     = today()
  const yesterdayStr = yesterday()
  const sleepEntry   = sleepEntries.find(e => e.date === yesterdayStr)

  const morningHabits = useMemo(
    () => habits
      .filter(h => {
        if (h.archivedAt || !h.isMorning) return false
        if (!isHabitScheduledForDate(h, yesterdayStr)) return false
        if (h.isSleepDurationGoal) return (sleepEntry?.hours ?? 0) >= 8
        return true
      })
      .sort((a, b) => a.order - b.order),
    [habits, yesterdayStr, sleepEntry]
  )

  const regularHabits = useMemo(
    () => habits
      .filter(h => !h.archivedAt && !h.isMorning && isHabitScheduledForDate(h, todayStr))
      .sort((a, b) => a.order - b.order),
    [habits, todayStr]
  )

  const completedCount =
    morningHabits.filter(h => isCompleted(h.id, yesterdayStr)).length +
    regularHabits.filter(h => isCompleted(h.id, todayStr)).length
  const allScheduled = [...morningHabits, ...regularHabits]
  const allDone = allScheduled.length > 0 && completedCount === allScheduled.length

  const dayPoints = useMemo(
    () => calcDayPoints(todayStr, habits, logs),
    [todayStr, habits, logs]
  )

  const milestones = useMemo(
    () => detectMilestones(habits, logs),
    [habits, logs]
  )

  const handleShare = async (m: Milestone) => {
    setSharingMilestone(m)
    try {
      await shareAchievement(m, playerName)
    } catch {
      // user dismissed share sheet
    } finally {
      setSharingMilestone(null)
    }
  }

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
              {allDone ? '¡Todo listo! 🎉' : playerName ? `Hola, ${playerName}` : 'Buenos días'}
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

      <main className="flex-1 px-4 pb-32 space-y-5">

        {/* Milestone banners */}
        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-2xl px-4 py-3"
          >
            <span className="text-3xl">{m.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{m.label}</p>
              {m.habitName && (
                <p className="text-xs text-muted-foreground truncate">{m.habitName}</p>
              )}
            </div>
            <button
              onClick={() => handleShare(m)}
              disabled={sharingMilestone === m}
              style={{ transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }}
              className="p-2 rounded-xl bg-primary/20 text-primary active:scale-[0.97] disabled:opacity-50"
            >
              <Share2 size={18} />
            </button>
          </div>
        ))}

        {allScheduled.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center">
            <span className="text-5xl">🌴</span>
            <p className="text-muted-foreground text-sm">No hay hábitos para hoy</p>
            <p className="text-muted-foreground text-xs">Ve a <strong>Hábitos</strong> para agregar uno</p>
          </div>
        ) : (
          <>
            {/* Morning check-in */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">☀️</span>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Al despertar</p>
                <span className="text-xs text-muted-foreground">(de anoche)</span>
              </div>
              <SleepCard date={yesterdayStr} />
              {morningHabits.map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed={isCompleted(habit.id, yesterdayStr)}
                  onToggle={() => toggleLog(habit.id, yesterdayStr)}
                  streak={getStreak(habit.id, logs, yesterdayStr)}
                  index={i + 1}
                />
              ))}
            </section>

            {/* Regular habits */}
            {regularHabits.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Del día</p>
                </div>
                {regularHabits.map((habit, i) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completed={isCompleted(habit.id, todayStr)}
                    onToggle={() => toggleLog(habit.id, todayStr)}
                    streak={getStreak(habit.id, logs, todayStr)}
                    index={i}
                  />
                ))}
              </section>
            )}
          </>
        )}

        {/* Couple activities */}
        <CoupleActivitySection date={todayStr} partnerName={partnerName || 'tu pareja'} />
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
