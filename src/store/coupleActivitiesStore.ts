import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

export interface CoupleActivity {
  id: string
  date: string   // YYYY-MM-DD
  name: string
  emoji: string
  loggedAt: string
}

export const PRESET_ACTIVITIES = [
  { name: 'Fuimos al gym',         emoji: '🏋️' },
  { name: 'Salimos a correr',      emoji: '🏃' },
  { name: 'Caminamos juntos',      emoji: '🚶‍♂️' },
  { name: 'Jugamos tenis',         emoji: '🎾' },
  { name: 'Cocinamos juntos',      emoji: '👨‍🍳' },
  { name: 'Cenamos afuera',        emoji: '🍽️' },
  { name: 'Vimos una película',    emoji: '🎬' },
  { name: 'Salimos a pasear',      emoji: '🌳' },
  { name: 'Dormimos temprano',     emoji: '🌙' },
  { name: 'Jugamos algo juntos',   emoji: '🎮' },
]

interface CoupleActivitiesState {
  activities: CoupleActivity[]
  addActivity: (date: string, name: string, emoji: string) => void
  removeActivity: (id: string) => void
  getByDate: (date: string) => CoupleActivity[]
}

export const useCoupleActivitiesStore = create<CoupleActivitiesState>()(
  persist(
    (set, get) => ({
      activities: [],

      addActivity: (date, name, emoji) =>
        set((s) => ({
          activities: [
            ...s.activities,
            { id: nanoid(), date, name, emoji, loggedAt: new Date().toISOString() },
          ],
        })),

      removeActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),

      getByDate: (date) => get().activities.filter((a) => a.date === date),
    }),
    {
      name: 'habitos-mamocitos-couple',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
