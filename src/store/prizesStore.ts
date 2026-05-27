import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { nanoid } from 'nanoid'
import { endOfNextMonth } from '@/lib/points'

const idbStorage = {
  getItem: async (name: string) => { const v = await get(name); return v ?? null },
  setItem: async (name: string, value: string) => { await set(name, value) },
  removeItem: async (name: string) => { await del(name) },
}

export interface Prize {
  id: string
  name: string
  emoji: string
  isCustom: boolean
  // Claim info — set when winner picks this prize
  claimedAt?: string    // ISO timestamp
  claimedBy?: string    // player name
  claimType?: 'weekly' | 'monthly'
  expiresAt?: string    // ISO date — end of next month from claim
}

const DEFAULT_PRIZES: Prize[] = [
  { id: 'p1', name: 'Cena en restaurante',       emoji: '🍽️', isCustom: false },
  { id: 'p2', name: 'Película en cine',           emoji: '🎬', isCustom: false },
  { id: 'p3', name: 'Masaje de 30 min',           emoji: '💆', isCustom: false },
  { id: 'p4', name: 'Día de spa',                 emoji: '🧖', isCustom: false },
  { id: 'p5', name: 'Desayuno en la cama',        emoji: '🛏️', isCustom: false },
  { id: 'p6', name: 'Escoger el plan del finde',  emoji: '🗓️', isCustom: false },
  { id: 'p7', name: 'Noche de videojuegos',       emoji: '🎮', isCustom: false },
  { id: 'p8', name: 'El otro limpia la casa',     emoji: '🧹', isCustom: false },
]

interface PrizesState {
  prizes: Prize[]
  addPrize: (name: string, emoji: string) => void
  removePrize: (id: string) => void
  claimPrize: (id: string, claimedBy: string, type: 'weekly' | 'monthly') => void
}

export const usePrizesStore = create<PrizesState>()(
  persist(
    (set) => ({
      prizes: DEFAULT_PRIZES,

      addPrize: (name, emoji) =>
        set((state) => ({
          prizes: [...state.prizes, { id: nanoid(), name: name.trim(), emoji, isCustom: true }],
        })),

      removePrize: (id) =>
        set((state) => ({ prizes: state.prizes.filter((p) => p.id !== id) })),

      claimPrize: (id, claimedBy, type) =>
        set((state) => ({
          prizes: state.prizes.map((p) =>
            p.id === id
              ? {
                  ...p,
                  claimedAt: new Date().toISOString(),
                  claimedBy,
                  claimType: type,
                  expiresAt: endOfNextMonth().toISOString(),
                }
              : p
          ),
        })),
    }),
    {
      name: 'habitos-mamocitos-prizes',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
