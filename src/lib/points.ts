import type { Habit, HabitLog } from '@/types'
import { isHabitScheduledForDate, toDateString } from './dates'

export const PTS_PER_HABIT   = 10
export const PTS_PERFECT_DAY = 25   // bonus if ALL habits done in a day
export const PTS_STREAK_3    = 5    // bonus per habit with 3+ day streak
export const PTS_STREAK_7    = 15   // bonus per habit with 7+ day streak

/** Streak length for a habit up to and including the given date */
export function getStreak(habitId: string, logs: HabitLog[], upToDate: string): number {
  let streak = 0
  const d = new Date(upToDate + 'T12:00:00')
  while (true) {
    const s = toDateString(d)
    if (!logs.some(l => l.habitId === habitId && l.completedAt === s)) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export interface DayPointsBreakdown {
  base: number
  streakBonus: number
  perfectDayBonus: number
  total: number
}

/** Points earned on a single day */
export function calcDayPoints(
  date: string,
  habits: Habit[],
  logs: HabitLog[]
): DayPointsBreakdown {
  const scheduled = habits.filter(h => !h.archivedAt && isHabitScheduledForDate(h, date))
  const completed = scheduled.filter(h => logs.some(l => l.habitId === h.id && l.completedAt === date))

  const base = completed.length * PTS_PER_HABIT

  let streakBonus = 0
  for (const h of completed) {
    const s = getStreak(h.id, logs, date)
    if (s >= 7) streakBonus += PTS_STREAK_7
    else if (s >= 3) streakBonus += PTS_STREAK_3
  }

  const perfectDayBonus =
    scheduled.length > 0 && completed.length === scheduled.length ? PTS_PERFECT_DAY : 0

  return { base, streakBonus, perfectDayBonus, total: base + streakBonus + perfectDayBonus }
}

/** Total points for a given month (YYYY-MM) */
export function calcMonthPoints(
  monthKey: string, // 'YYYY-MM'
  habits: Habit[],
  logs: HabitLog[]
): number {
  const [y, m] = monthKey.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  let total = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${monthKey}-${String(d).padStart(2, '0')}`
    total += calcDayPoints(date, habits, logs).total
  }
  return total
}

export function currentMonthKey(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })
}
