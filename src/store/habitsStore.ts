import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'
import type { Habit, HabitCategory, HabitFrequency } from '@/types'

const idbStorage = {
  getItem: async (name: string) => {
    const val = await get(name)
    return val ?? null
  },
  setItem: async (name: string, value: string) => {
    await set(name, value)
  },
  removeItem: async (name: string) => {
    await del(name)
  },
}

interface HabitsState {
  habits: Habit[]
  addHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => void
  updateHabit: (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void
  archiveHabit: (id: string) => void
  restoreHabit: (id: string) => void
  deleteHabit: (id: string) => void
  reorderHabits: (ids: string[]) => void
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set) => ({
      habits: [],

      addHabit: (data) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...data,
              id: nanoid(),
              createdAt: new Date().toISOString(),
              order: state.habits.length,
            },
          ],
        })),

      updateHabit: (id, data) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...data } : h)),
        })),

      archiveHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archivedAt: new Date().toISOString() } : h
          ),
        })),

      restoreHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archivedAt: undefined } : h
          ),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      reorderHabits: (ids) =>
        set((state) => ({
          habits: ids
            .map((id, idx) => {
              const h = state.habits.find((x) => x.id === id)
              return h ? { ...h, order: idx } : null
            })
            .filter(Boolean) as Habit[],
        })),
    }),
    {
      name: 'habitos-mamocitos-habits',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)

export type { HabitCategory, HabitFrequency }
