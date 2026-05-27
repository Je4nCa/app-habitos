// ─── Accent / Primary color ───────────────────────────────────────────────────

export interface ThemeColor {
  key: string
  label: string
  primary: string   // HSL without hsl() — e.g. '258 90% 66%'
  fg: string        // foreground ON primary backgrounds
}

// 24 colors — 4 cols × 6 rows grid
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
  background: string
  card: string
  muted: string
  border: string
  foreground: string
  mutedFg: string
}

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    key: 'navy',
    label: 'Marina',
    background: '222 47% 7%',
    card:       '222 47% 10%',
    muted:      '223 47% 15%',
    border:     '222 47% 16%',
    foreground: '213 31% 91%',
    mutedFg:    '215 20% 55%',
  },
  {
    key: 'black',
    label: 'AMOLED',
    background: '0 0% 0%',
    card:       '0 0% 6%',
    muted:      '0 0% 12%',
    border:     '0 0% 14%',
    foreground: '0 0% 93%',
    mutedFg:    '0 0% 48%',
  },
  {
    key: 'midnight',
    label: 'Medianoche',
    background: '250 40% 7%',
    card:       '250 35% 10%',
    muted:      '250 30% 15%',
    border:     '250 30% 17%',
    foreground: '248 25% 92%',
    mutedFg:    '248 15% 54%',
  },
  {
    key: 'forest',
    label: 'Bosque',
    background: '155 35% 6%',
    card:       '155 30% 9%',
    muted:      '155 25% 14%',
    border:     '155 25% 16%',
    foreground: '150 15% 91%',
    mutedFg:    '150 10% 54%',
  },
  {
    key: 'wine',
    label: 'Vino',
    background: '340 40% 7%',
    card:       '340 35% 10%',
    muted:      '340 28% 15%',
    border:     '340 28% 17%',
    foreground: '340 15% 92%',
    mutedFg:    '340 10% 54%',
  },
  {
    key: 'warm',
    label: 'Noche cálida',
    background: '25 35% 7%',
    card:       '25 30% 10%',
    muted:      '25 25% 15%',
    border:     '25 25% 17%',
    foreground: '25 15% 92%',
    mutedFg:    '25 10% 54%',
  },
  {
    key: 'storm',
    label: 'Tormenta',
    background: '215 25% 7%',
    card:       '215 20% 10%',
    muted:      '215 18% 15%',
    border:     '215 18% 17%',
    foreground: '215 15% 92%',
    mutedFg:    '215 10% 54%',
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
}

export function getBackgroundTheme(key: string): BackgroundTheme {
  return BACKGROUND_THEMES.find(b => b.key === key) ?? BACKGROUND_THEMES[0]
}
