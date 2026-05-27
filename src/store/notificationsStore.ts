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
  bedtimeTime: string
  afternoonEnabled: boolean
  afternoonTime: string
  habitReminderEnabled: boolean
  habitReminderTime: string
  setPermission: (p: NotificationPermission | 'unsupported') => void
  toggle: (key: 'bedtimeEnabled' | 'afternoonEnabled' | 'habitReminderEnabled') => void
  setTime: (key: 'bedtimeTime' | 'afternoonTime' | 'habitReminderTime', value: string) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      permission: 'default',
      bedtimeEnabled: true,
      bedtimeTime: '20:30',
      afternoonEnabled: true,
      afternoonTime: '15:30',
      habitReminderEnabled: true,
      habitReminderTime: '18:00',
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
