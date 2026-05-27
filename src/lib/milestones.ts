import type { Habit, HabitLog } from '@/types'
import { today, toDateString, isHabitScheduledForDate } from './dates'
import { getStreak } from './points'

export interface Milestone {
  type: 'streak7' | 'streak14' | 'streak30' | 'perfect_week' | 'perfect_month'
  label: string
  emoji: string
  habitName?: string
}

export function detectMilestones(habits: Habit[], logs: HabitLog[]): Milestone[] {
  const milestones: Milestone[] = []
  const todayStr = today()

  // Streak milestones per habit
  for (const habit of habits.filter(h => !h.archivedAt)) {
    const streak = getStreak(habit.id, logs, todayStr)
    if (streak === 30) {
      milestones.push({ type: 'streak30', emoji: '🏆', label: `¡30 días seguidos!`, habitName: habit.name })
    } else if (streak === 14) {
      milestones.push({ type: 'streak14', emoji: '🔥', label: `¡2 semanas seguidas!`, habitName: habit.name })
    } else if (streak === 7) {
      milestones.push({ type: 'streak7', emoji: '⭐', label: `¡7 días seguidos!`, habitName: habit.name })
    }
  }

  // Perfect week (last 7 days, all scheduled habits done every day)
  const activeHabits = habits.filter(h => !h.archivedAt && !h.isMorning)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return toDateString(d)
  })
  const perfectWeek = last7.every(date => {
    const scheduled = activeHabits.filter(h => isHabitScheduledForDate(h, date))
    if (scheduled.length === 0) return false
    return scheduled.every(h => logs.some(l => l.habitId === h.id && l.completedAt === date))
  })
  if (perfectWeek) {
    milestones.push({ type: 'perfect_week', emoji: '🌟', label: '¡Semana perfecta!' })
  }

  return milestones
}
