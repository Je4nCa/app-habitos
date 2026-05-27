import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

interface NotificationsState {
  permission: NotificationPermission | 'unsupported'
  bedtimeEnabled: boolean
  bedtimeTime: string        // 'HH:MM'
  afternoonEnabled: boolean
  afternoonTime: string      // 'HH:MM'
  setPermission: (p: NotificationPermission | 'unsupported') => void
  toggle: (key: 'bedtimeEnabled' | 'afternoonEnabled') => void
  setTime: (key: 'bedtimeTime' | 'afternoonTime', value: string) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      permission: 'default',
      bedtimeEnabled: true,
      bedtimeTime: '20:30',
      afternoonEnabled: true,
      afternoonTime: '15:30',
      setPermission: (p) => set({ permission: p }),
      toggle: (key) => set((s) => ({ [key]: !s[key] })),
      setTime: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'habitos-mamocitos-notifications',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
