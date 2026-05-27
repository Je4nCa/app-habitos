import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'
import type { SleepEntry } from '@/types'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

interface SleepState {
  entries: SleepEntry[]
  logSleep: (date: string, score: number, hours: number) => void
  deleteSleep: (date: string) => void
  getByDate: (date: string) => SleepEntry | undefined
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      entries: [],

      logSleep: (date, score, hours) => {
        const existing = get().entries.find(e => e.date === date)
        if (existing) {
          set(state => ({
            entries: state.entries.map(e =>
              e.date === date ? { ...e, score, hours, loggedAt: new Date().toISOString() } : e
            ),
          }))
        } else {
          set(state => ({
            entries: [
              ...state.entries,
              { id: nanoid(), date, score, hours, loggedAt: new Date().toISOString() },
            ],
          }))
        }
      },

      deleteSleep: (date) =>
        set(state => ({ entries: state.entries.filter(e => e.date !== date) })),

      getByDate: (date) => get().entries.find(e => e.date === date),
    }),
    {
      name: 'habitos-mamocitos-sleep',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
