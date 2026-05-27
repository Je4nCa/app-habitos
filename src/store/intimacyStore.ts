import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'

const idbStorage = {
  getItem:    async (name: string) => { const v = await get(name); return v ?? null },
  setItem:    async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

export interface IntimacyEntry {
  id: string
  date: string   // YYYY-MM-DD
  note?: string
  createdAt: string
}

interface IntimacyState {
  entries: IntimacyEntry[]
  logDay:     (date: string, note?: string) => void
  unlogDay:   (date: string) => void
  isLogged:   (date: string) => boolean
  updateNote: (date: string, note: string) => void
}

export const useIntimacyStore = create<IntimacyState>()(
  persist(
    (set, get) => ({
      entries: [],
      logDay: (date, note) => set(s => {
        if (s.entries.some(e => e.date === date)) return s
        return { entries: [...s.entries, { id: nanoid(), date, note, createdAt: new Date().toISOString() }] }
      }),
      unlogDay:   (date) => set(s => ({ entries: s.entries.filter(e => e.date !== date) })),
      isLogged:   (date) => get().entries.some(e => e.date === date),
      updateNote: (date, note) => set(s => ({
        entries: s.entries.map(e => e.date === date ? { ...e, note } : e),
      })),
    }),
    {
      name: 'habitos-mamocitos-intimacy',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
