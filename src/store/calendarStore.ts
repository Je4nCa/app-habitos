import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'

const idbStorage = {
  getItem:    async (name: string) => { const v = await get(name); return v ?? null },
  setItem:    async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

export interface CalendarEvent {
  id: string
  date: string              // YYYY-MM-DD
  title: string
  time?: string             // HH:MM
  emoji: string
  addedBy: 'me' | 'partner'
  forWhom: 'me' | 'partner' | 'both'
  done: boolean
  createdAt: string
}

interface CalendarState {
  events: CalendarEvent[]
  addEvent:    (e: Omit<CalendarEvent, 'id' | 'createdAt'>) => void
  toggleDone:  (id: string) => void
  deleteEvent: (id: string) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (e) => set(s => ({
        events: [...s.events, { ...e, id: nanoid(), createdAt: new Date().toISOString() }],
      })),
      toggleDone: (id) => set(s => ({
        events: s.events.map(e => e.id === id ? { ...e, done: !e.done } : e),
      })),
      deleteEvent: (id) => set(s => ({
        events: s.events.filter(e => e.id !== id),
      })),
    }),
    {
      name: 'habitos-mamocitos-calendar',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
