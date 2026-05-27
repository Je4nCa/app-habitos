import type { Habit } from '@/types'
import { nanoid } from 'nanoid'

export const DEFAULT_COUPLE_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  // Morning check-ins (se confirman al despertar, loguean para el día anterior)
  {
    name: 'Dormí 8 horas',
    emoji: '😴',
    category: 'sleep',
    frequency: 'daily',
    color: 'sky',
    order: 0,
    isMorning: true,
    isSleepDurationGoal: true,
  },
  {
    name: 'Me levanté sin snooze',
    emoji: '⏰',
    category: 'sleep',
    frequency: 'daily',
    color: 'amber',
    order: 1,
    isMorning: true,
  },

  // Hábitos del día
  {
    name: 'Ejercicio o actividad física',
    emoji: '💪',
    category: 'fitness',
    frequency: 'daily',
    color: 'emerald',
    order: 2,
  },
  {
    name: 'Sin TikTok / pantallas en la tarde',
    emoji: '📵',
    category: 'productivity',
    frequency: 'daily',
    color: 'rose',
    order: 3,
  },
  {
    name: 'Skincare mañana',
    emoji: '🧴',
    category: 'health',
    frequency: 'daily',
    color: 'pink',
    order: 4,
  },
  {
    name: 'Skincare en la noche',
    emoji: '🌙',
    category: 'health',
    frequency: 'daily',
    color: 'violet',
    order: 5,
  },
  {
    name: 'Magnesio en la noche',
    emoji: '💊',
    category: 'health',
    frequency: 'daily',
    color: 'teal',
    order: 6,
  },
  {
    name: 'Caminar / salir a correr',
    emoji: '🏃',
    category: 'fitness',
    frequency: 'daily',
    color: 'cyan',
    order: 7,
    isPersonal: true,
  },
  {
    name: 'Hidratarse (2L de agua)',
    emoji: '💧',
    category: 'health',
    frequency: 'daily',
    color: 'sky',
    order: 8,
  },
]

export function buildDefaultHabits(): Habit[] {
  return DEFAULT_COUPLE_HABITS.map(h => ({
    ...h,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  }))
}
