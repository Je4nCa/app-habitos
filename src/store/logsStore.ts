import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'
import type { HabitLog } from '@/types'
import { today } from '@/lib/dates'

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

interface LogsState {
  logs: HabitLog[]
  toggleLog: (habitId: string, date?: string) => void
  isCompleted: (habitId: string, date?: string) => boolean
  getLogsForDate: (date: string) => HabitLog[]
  getLogsForHabit: (habitId: string) => HabitLog[]
  deleteLogsForHabit: (habitId: string) => void
}

export const useLogsStore = create<LogsState>()(
  persist(
    (set, get) => ({
      logs: [],

      toggleLog: (habitId, date = today()) => {
        const existing = get().logs.find(
          (l) => l.habitId === habitId && l.completedAt === date
        )
        if (existing) {
          set((state) => ({
            logs: state.logs.filter((l) => l.id !== existing.id),
          }))
        } else {
          set((state) => ({
            logs: [
              ...state.logs,
              { id: nanoid(), habitId, completedAt: date },
            ],
          }))
        }
      },

      isCompleted: (habitId, date = today()) =>
        get().logs.some((l) => l.habitId === habitId && l.completedAt === date),

      getLogsForDate: (date) =>
        get().logs.filter((l) => l.completedAt === date),

      getLogsForHabit: (habitId) =>
        get().logs.filter((l) => l.habitId === habitId),

      deleteLogsForHabit: (habitId) =>
        set((state) => ({
          logs: state.logs.filter((l) => l.habitId !== habitId),
        })),
    }),
    {
      name: 'habitos-mamocitos-logs',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
