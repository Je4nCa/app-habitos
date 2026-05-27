import type { Habit } from '@/types'
import { nanoid } from 'nanoid'

export const DEFAULT_COUPLE_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  {
    name: 'Dormir antes de las 9 PM',
    emoji: '😴',
    category: 'sleep',
    frequency: 'daily',
    color: 'sky',
    order: 0,
  },
  {
    name: 'Levantarse sin snooze',
    emoji: '⏰',
    category: 'sleep',
    frequency: 'daily',
    color: 'amber',
    order: 1,
  },
  {
    name: 'Ejercicio o actividad física',
    emoji: '💪',
    category: 'fitness',
    frequency: 'daily',
    color: 'emerald',
    order: 2,
  },
  {
    name: 'Comer bien (sin comida chatarra)',
    emoji: '🥗',
    category: 'nutrition',
    frequency: 'daily',
    color: 'lime',
    order: 3,
  },
  {
    name: 'Sin TikTok / pantallas en la tarde',
    emoji: '📵',
    category: 'productivity',
    frequency: 'daily',
    color: 'rose',
    order: 4,
  },
  {
    name: 'Skincare mañana',
    emoji: '🧴',
    category: 'health',
    frequency: 'daily',
    color: 'pink',
    order: 5,
  },
  {
    name: 'Caminar al menos 20 min',
    emoji: '🚶',
    category: 'fitness',
    frequency: 'daily',
    color: 'cyan',
    order: 6,
  },
  {
    name: 'Hidratarse (2L de agua)',
    emoji: '💧',
    category: 'health',
    frequency: 'daily',
    color: 'violet',
    order: 7,
  },
]

export function buildDefaultHabits(): Habit[] {
  return DEFAULT_COUPLE_HABITS.map(h => ({
    ...h,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  }))
}
