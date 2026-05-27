import type { Habit, HabitLog } from '@/types'
import { isHabitScheduledForDate, toDateString } from './dates'

export const PTS_PER_HABIT   = 10
export const PTS_PERFECT_DAY = 25
export const PTS_STREAK_3    = 5
export const PTS_STREAK_7    = 15

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

/** Total points for a range of dates */
export function calcRangePoints(
  startDate: string,
  endDate: string,
  habits: Habit[],
  logs: HabitLog[]
): number {
  let total = 0
  const cur = new Date(startDate + 'T12:00:00')
  const end = new Date(endDate + 'T12:00:00')
  while (cur <= end) {
    total += calcDayPoints(toDateString(cur), habits, logs).total
    cur.setDate(cur.getDate() + 1)
  }
  return total
}

/** Total points for a month (YYYY-MM) */
export function calcMonthPoints(monthKey: string, habits: Habit[], logs: HabitLog[]): number {
  const [y, m] = monthKey.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const start = `${monthKey}-01`
  const end   = `${monthKey}-${String(daysInMonth).padStart(2, '0')}`
  return calcRangePoints(start, end, habits, logs)
}

// ─── Week helpers (Monday–Sunday) ────────────────────────────────────────────

/** ISO week bounds for a given date — returns Monday and Sunday as YYYY-MM-DD */
export function getWeekBounds(date: Date): { start: string; end: string } {
  const d = new Date(date)
  const dow = d.getDay() // 0=Sun
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diffToMonday)
  const start = toDateString(d)
  d.setDate(d.getDate() + 6)
  const end = toDateString(d)
  return { start, end }
}

/** "YYYY-WNN" key for a given date */
export function weekKey(date: Date): string {
  // Use the Monday of the week as the key base
  const { start } = getWeekBounds(date)
  const monday = new Date(start + 'T12:00:00')
  const jan1   = new Date(monday.getFullYear(), 0, 1)
  const week   = Math.ceil(((monday.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${monday.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function currentWeekKey(): string {
  return weekKey(new Date())
}

/** Points for a given week key */
export function calcWeekPoints(wKey: string, habits: Habit[], logs: HabitLog[]): number {
  // wKey = "YYYY-WNN" — reconstruct the Monday date to get bounds
  // Easier: just pass bounds directly via getWeekBoundsFromKey
  const { start, end } = getWeekBoundsFromKey(wKey)
  return calcRangePoints(start, end, habits, logs)
}

/** Reconstruct start/end from a week key */
export function getWeekBoundsFromKey(wKey: string): { start: string; end: string } {
  // Parse YYYY-WNN, find the Monday of that week
  const [yearStr, weekStr] = wKey.split('-W')
  const year = Number(yearStr)
  const week = Number(weekStr)
  const jan1 = new Date(year, 0, 1)
  const jan1Dow = jan1.getDay() // 0=Sun
  const daysToFirstMonday = jan1Dow === 0 ? 1 : jan1Dow === 1 ? 0 : 8 - jan1Dow
  const firstMonday = new Date(year, 0, 1 + daysToFirstMonday)
  const monday = new Date(firstMonday)
  monday.setDate(firstMonday.getDate() + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toDateString(monday), end: toDateString(sunday) }
}

export function weekLabel(wKey: string): string {
  const { start, end } = getWeekBoundsFromKey(wKey)
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end   + 'T12:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
  return `${fmt(s)} – ${fmt(e)}`
}

export function isSunday(): boolean {
  return new Date().getDay() === 0
}

export function isDay30(): boolean {
  return new Date().getDate() === 30
}

// ─── Month helpers ────────────────────────────────────────────────────────────

export function currentMonthKey(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })
}

/** End of next month from a given date */
export function endOfNextMonth(from = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth() + 2, 0) // day 0 = last day of next month
  return d
}
