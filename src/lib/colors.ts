export const HABIT_COLORS = [
  { key: 'violet', bg: 'bg-violet-500', ring: 'ring-violet-500', text: 'text-violet-400', light: 'bg-violet-500/20' },
  { key: 'sky',    bg: 'bg-sky-500',    ring: 'ring-sky-500',    text: 'text-sky-400',    light: 'bg-sky-500/20'    },
  { key: 'emerald',bg: 'bg-emerald-500',ring: 'ring-emerald-500',text: 'text-emerald-400',light: 'bg-emerald-500/20'},
  { key: 'amber',  bg: 'bg-amber-500',  ring: 'ring-amber-500',  text: 'text-amber-400',  light: 'bg-amber-500/20'  },
  { key: 'rose',   bg: 'bg-rose-500',   ring: 'ring-rose-500',   text: 'text-rose-400',   light: 'bg-rose-500/20'   },
  { key: 'pink',   bg: 'bg-pink-500',   ring: 'ring-pink-500',   text: 'text-pink-400',   light: 'bg-pink-500/20'   },
  { key: 'cyan',   bg: 'bg-cyan-500',   ring: 'ring-cyan-500',   text: 'text-cyan-400',   light: 'bg-cyan-500/20'   },
  { key: 'lime',   bg: 'bg-lime-500',   ring: 'ring-lime-500',   text: 'text-lime-400',   light: 'bg-lime-500/20'   },
  { key: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-500', text: 'text-orange-400', light: 'bg-orange-500/20' },
  { key: 'teal',   bg: 'bg-teal-500',   ring: 'ring-teal-500',   text: 'text-teal-400',   light: 'bg-teal-500/20'   },
] as const

export type ColorKey = typeof HABIT_COLORS[number]['key']

export function getColor(key: string) {
  return HABIT_COLORS.find(c => c.key === key) ?? HABIT_COLORS[0]
}
