import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

type StoragePermission = 'granted' | 'denied' | 'unknown'

interface SettingsState {
  storagePermission: StoragePermission
  lastBackupAt: string | null
  setStoragePermission: (p: StoragePermission) => void
  markBackup: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storagePermission: 'unknown',
      lastBackupAt: null,
      setStoragePermission: (p) => set({ storagePermission: p }),
      markBackup: () => set({ lastBackupAt: new Date().toISOString() }),
    }),
    {
      name: 'habitos-mamocitos-settings',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
