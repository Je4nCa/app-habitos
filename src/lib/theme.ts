// ─── Accent / Primary color ───────────────────────────────────────────────────

export interface ThemeColor {
  key: string
  label: string
  primary: string   // HSL without hsl() — e.g. '258 90% 66%'
  fg: string        // foreground ON primary backgrounds
}

// 24 colors — 4 cols × 6 rows
export const THEME_COLORS: ThemeColor[] = [
  // Row 1 — purples
  { key: 'lilac',    label: 'Lila',        primary: '268 55% 72%', fg: '222 47% 7%'  },
  { key: 'violet',   label: 'Violeta',     primary: '258 90% 66%', fg: '0 0% 100%'   },
  { key: 'indigo',   label: 'Índigo',      primary: '235 86% 65%', fg: '0 0% 100%'   },
  { key: 'purple',   label: 'Púrpura',     primary: '271 81% 62%', fg: '0 0% 100%'   },
  // Row 2 — pinks / reds
  { key: 'fuchsia',  label: 'Fucsia',      primary: '292 84% 62%', fg: '0 0% 100%'   },
  { key: 'pink',     label: 'Rosa',        primary: '330 81% 65%', fg: '0 0% 100%'   },
  { key: 'rose',     label: 'Frambuesa',   primary: '343 76% 57%', fg: '0 0% 100%'   },
  { key: 'red',      label: 'Rojo',        primary: '0 72% 58%',   fg: '0 0% 100%'   },
  // Row 3 — warm
  { key: 'coral',    label: 'Coral',       primary: '15 86% 62%',  fg: '0 0% 100%'   },
  { key: 'orange',   label: 'Naranja',     primary: '22 95% 56%',  fg: '0 0% 100%'   },
  { key: 'amber',    label: 'Ámbar',       primary: '38 92% 52%',  fg: '222 47% 7%'  },
  { key: 'gold',     label: 'Oro',         primary: '43 88% 52%',  fg: '222 47% 7%'  },
  // Row 4 — yellows / greens
  { key: 'yellow',   label: 'Amarillo',    primary: '48 96% 54%',  fg: '222 47% 7%'  },
  { key: 'lime',     label: 'Lima',        primary: '84 78% 44%',  fg: '0 0% 100%'   },
  { key: 'green',    label: 'Verde',       primary: '142 69% 43%', fg: '0 0% 100%'   },
  { key: 'mint',     label: 'Menta',       primary: '160 55% 52%', fg: '0 0% 100%'   },
  // Row 5 — teals / blues
  { key: 'emerald',  label: 'Esmeralda',   primary: '152 74% 40%', fg: '0 0% 100%'   },
  { key: 'teal',     label: 'Agua',        primary: '172 60% 45%', fg: '0 0% 100%'   },
  { key: 'cyan',     label: 'Cian',        primary: '192 90% 46%', fg: '0 0% 100%'   },
  { key: 'sky',      label: 'Cielo',       primary: '199 89% 50%', fg: '0 0% 100%'   },
  // Row 6 — blues / neutral
  { key: 'blue',     label: 'Azul',        primary: '217 91% 60%', fg: '0 0% 100%'   },
  { key: 'electric', label: 'Eléctrico',   primary: '210 100% 58%',fg: '0 0% 100%'   },
  { key: 'slate',    label: 'Pizarra',     primary: '215 28% 60%', fg: '0 0% 100%'   },
  { key: 'white',    label: 'Blanco',      primary: '0 0% 94%',    fg: '222 47% 7%'  },
]

export function applyTheme(color: ThemeColor): void {
  const r = document.documentElement
  r.style.setProperty('--primary', color.primary)
  r.style.setProperty('--primary-foreground', color.fg)
  r.style.setProperty('--accent', color.primary)
  r.style.setProperty('--accent-foreground', color.fg)
}

export function getThemeColor(key: string): ThemeColor {
  return THEME_COLORS.find(c => c.key === key) ?? THEME_COLORS[1] // violet default
}

// ─── Background theme ─────────────────────────────────────────────────────────

export interface BackgroundTheme {
  key: string
  label: string
  isDark: boolean
  background: string
  card: string
  muted: string
  border: string
  foreground: string
  mutedFg: string
}

// Semantic indicator colors for dark vs light backgrounds
// (sleep quality, etc.) — auto-switched in applyBackground
const QUALITY_DARK = {
  excellent: '258 90% 72%',  // violet-400
  good:      '152 68% 60%',  // emerald-400
  fair:      '38 92% 67%',   // amber-400
  poor:      '347 77% 72%',  // rose-400
}
const QUALITY_LIGHT = {
  excellent: '258 89% 44%',  // violet-700
  good:      '161 94% 28%',  // emerald-700
  fair:      '32 95% 38%',   // amber-700
  poor:      '346 87% 40%',  // rose-700
}

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  // ── Dark ───────────────────────────────────────────────────────────────────
  {
    key: 'navy',   label: 'Marina',      isDark: true,
    background: '222 47% 7%',  card: '222 47% 10%', muted: '223 47% 15%',
    border: '222 47% 16%',     foreground: '213 31% 91%', mutedFg: '215 20% 55%',
  },
  {
    key: 'black',  label: 'AMOLED',      isDark: true,
    background: '0 0% 0%',     card: '0 0% 6%',     muted: '0 0% 12%',
    border: '0 0% 14%',        foreground: '0 0% 93%',    mutedFg: '0 0% 48%',
  },
  {
    key: 'midnight', label: 'Medianoche', isDark: true,
    background: '250 40% 7%',  card: '250 35% 10%', muted: '250 30% 15%',
    border: '250 30% 17%',     foreground: '248 25% 92%', mutedFg: '248 15% 54%',
  },
  {
    key: 'lilac-dark', label: 'Lila oscuro', isDark: true,
    background: '268 35% 7%',  card: '268 30% 10%', muted: '268 25% 15%',
    border: '268 25% 17%',     foreground: '268 20% 92%', mutedFg: '268 12% 54%',
  },
  {
    key: 'forest',  label: 'Bosque',      isDark: true,
    background: '155 35% 6%',  card: '155 30% 9%',  muted: '155 25% 14%',
    border: '155 25% 16%',     foreground: '150 15% 91%', mutedFg: '150 10% 54%',
  },
  {
    key: 'petrol',  label: 'Petróleo',    isDark: true,
    background: '185 40% 7%',  card: '185 35% 10%', muted: '185 30% 15%',
    border: '185 30% 17%',     foreground: '185 20% 92%', mutedFg: '185 10% 54%',
  },
  {
    key: 'wine',    label: 'Vino',        isDark: true,
    background: '340 40% 7%',  card: '340 35% 10%', muted: '340 28% 15%',
    border: '340 28% 17%',     foreground: '340 15% 92%', mutedFg: '340 10% 54%',
  },
  {
    key: 'warm',    label: 'Noche cálida', isDark: true,
    background: '25 35% 7%',   card: '25 30% 10%',  muted: '25 25% 15%',
    border: '25 25% 17%',      foreground: '25 15% 92%',  mutedFg: '25 10% 54%',
  },
  {
    key: 'coffee',  label: 'Café',        isDark: true,
    background: '20 30% 7%',   card: '20 25% 10%',  muted: '20 20% 15%',
    border: '20 20% 17%',      foreground: '25 12% 92%',  mutedFg: '25 8% 54%',
  },
  {
    key: 'storm',   label: 'Tormenta',    isDark: true,
    background: '215 25% 7%',  card: '215 20% 10%', muted: '215 18% 15%',
    border: '215 18% 17%',     foreground: '215 15% 92%', mutedFg: '215 10% 54%',
  },

  // ── Light ──────────────────────────────────────────────────────────────────
  {
    key: 'white',   label: 'Blanco',      isDark: false,
    background: '0 0% 98%',    card: '0 0% 100%',   muted: '0 0% 93%',
    border: '0 0% 86%',        foreground: '222 20% 10%', mutedFg: '215 15% 45%',
  },
  {
    key: 'pearl',   label: 'Gris perla',  isDark: false,
    background: '210 15% 96%', card: '210 10% 100%', muted: '210 12% 91%',
    border: '210 12% 84%',     foreground: '210 20% 10%', mutedFg: '210 12% 44%',
  },
  {
    key: 'cream',   label: 'Crema',       isDark: false,
    background: '40 35% 97%',  card: '40 30% 100%', muted: '40 20% 93%',
    border: '40 20% 86%',      foreground: '25 22% 10%',  mutedFg: '30 12% 44%',
  },
  {
    key: 'lavender', label: 'Lavanda',    isDark: false,
    background: '265 30% 97%', card: '265 20% 100%', muted: '265 22% 92%',
    border: '265 20% 86%',     foreground: '265 30% 12%', mutedFg: '265 14% 45%',
  },
  {
    key: 'mint-light', label: 'Menta',    isDark: false,
    background: '160 28% 97%', card: '160 20% 100%', muted: '160 20% 92%',
    border: '160 16% 85%',     foreground: '160 25% 10%', mutedFg: '160 10% 44%',
  },
  {
    key: 'sky-light', label: 'Cielo',     isDark: false,
    background: '205 35% 97%', card: '205 25% 100%', muted: '205 25% 92%',
    border: '205 20% 85%',     foreground: '205 30% 10%', mutedFg: '205 14% 44%',
  },
  {
    key: 'blush',   label: 'Rosa palo',   isDark: false,
    background: '340 28% 97%', card: '340 20% 100%', muted: '340 20% 92%',
    border: '340 16% 86%',     foreground: '340 28% 12%', mutedFg: '340 12% 45%',
  },
  {
    key: 'sage',    label: 'Verde hoja',  isDark: false,
    background: '130 22% 97%', card: '130 15% 100%', muted: '130 16% 92%',
    border: '130 14% 86%',     foreground: '130 22% 10%', mutedFg: '130 10% 44%',
  },
  {
    key: 'peach',   label: 'Melocotón',   isDark: false,
    background: '20 45% 97%',  card: '20 35% 100%', muted: '20 30% 92%',
    border: '20 25% 86%',      foreground: '20 30% 10%',  mutedFg: '20 14% 44%',
  },
  {
    key: 'sand',    label: 'Arena',       isDark: false,
    background: '45 30% 96%',  card: '45 20% 100%', muted: '45 18% 91%',
    border: '45 16% 84%',      foreground: '35 20% 10%',  mutedFg: '35 10% 44%',
  },
]

export function applyBackground(bg: BackgroundTheme): void {
  const r = document.documentElement
  r.style.setProperty('--background',       bg.background)
  r.style.setProperty('--card',             bg.card)
  r.style.setProperty('--card-foreground',  bg.foreground)
  r.style.setProperty('--muted',            bg.muted)
  r.style.setProperty('--muted-foreground', bg.mutedFg)
  r.style.setProperty('--border',           bg.border)
  r.style.setProperty('--foreground',       bg.foreground)

  // Semantic quality indicator colors — darker variants for light backgrounds
  const q = bg.isDark ? QUALITY_DARK : QUALITY_LIGHT
  r.style.setProperty('--q-excellent', q.excellent)
  r.style.setProperty('--q-good',      q.good)
  r.style.setProperty('--q-fair',      q.fair)
  r.style.setProperty('--q-poor',      q.poor)

  // Mark mode on root for any CSS-level overrides
  r.dataset.themeMode = bg.isDark ? 'dark' : 'light'
}

export function getBackgroundTheme(key: string): BackgroundTheme {
  return BACKGROUND_THEMES.find(b => b.key === key) ?? BACKGROUND_THEMES[0]
}
