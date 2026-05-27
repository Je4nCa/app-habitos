import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

interface PlayerState {
  playerName: string
  partnerName: string
  setupDone: boolean
  setPlayer: (playerName: string, partnerName: string) => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerName: '',
      partnerName: '',
      setupDone: false,
      setPlayer: (playerName, partnerName) =>
        set({ playerName: playerName.trim(), partnerName: partnerName.trim(), setupDone: true }),
    }),
    {
      name: 'habitos-mamocitos-player',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
