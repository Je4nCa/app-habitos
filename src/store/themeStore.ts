import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { applyTheme, getThemeColor } from '@/lib/theme'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

interface ThemeState {
  primaryKey: string
  setPrimary: (key: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryKey: 'violet',

      setPrimary: (key) => {
        applyTheme(getThemeColor(key))
        set({ primaryKey: key })
      },
    }),
    {
      name: 'habitos-mamocitos-theme',
      storage: createJSONStorage(() => idbStorage),
      // Re-apply theme immediately after IndexedDB hydration
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(getThemeColor(state.primaryKey))
      },
    }
  )
)
