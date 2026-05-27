export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom'

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'learning'
  | 'social'
  | 'productivity'
  | 'nutrition'
  | 'sleep'
  | 'other'

export interface Habit {
  id: string
  name: string
  emoji: string
  category: HabitCategory
  frequency: HabitFrequency
  customDays?: number[] // 0=Sun, 1=Mon, ... 6=Sat
  color: string        // tailwind color key, e.g. 'violet', 'sky', 'emerald'
  order: number
  isMorning?: boolean  // completed next morning (logs for previous day)
  archivedAt?: string  // ISO date when archived
  createdAt: string    // ISO date
}

export interface HabitLog {
  id: string
  habitId: string
  completedAt: string  // ISO date (date only, YYYY-MM-DD)
  note?: string
}

export interface SleepEntry {
  id: string
  date: string    // YYYY-MM-DD (the night that ended — yesterday when logged in the morning)
  score: number   // Garmin sleep score 0–100
  hours: number   // hours slept, e.g. 7.5
  loggedAt: string
}

export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor'

export function sleepQuality(score: number): SleepQuality {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

export type AppView = 'today' | 'habits' | 'history' | 'settings'

export interface DayStats {
  date: string
  total: number
  completed: number
}
