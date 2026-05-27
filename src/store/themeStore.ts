import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { applyTheme, getThemeColor, applyBackground, getBackgroundTheme } from '@/lib/theme'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

interface ThemeState {
  primaryKey: string
  backgroundKey: string
  setPrimary:    (key: string) => void
  setBackground: (key: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryKey:    'violet',
      backgroundKey: 'navy',

      setPrimary: (key) => {
        applyTheme(getThemeColor(key))
        set({ primaryKey: key })
      },

      setBackground: (key) => {
        applyBackground(getBackgroundTheme(key))
        set({ backgroundKey: key })
      },
    }),
    {
      name: 'habitos-mamocitos-theme',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyTheme(getThemeColor(state.primaryKey))
        applyBackground(getBackgroundTheme(state.backgroundKey))
      },
    }
  )
)
