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
  archivedAt?: string  // ISO date when archived
  createdAt: string    // ISO date
}

export interface HabitLog {
  id: string
  habitId: string
  completedAt: string  // ISO date (date only, YYYY-MM-DD)
  note?: string
}

export type AppView = 'today' | 'habits' | 'history' | 'settings'

export interface DayStats {
  date: string       // YYYY-MM-DD
  total: number
  completed: number
}
