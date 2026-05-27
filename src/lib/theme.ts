export interface ThemeColor {
  key: string
  label: string
  primary: string   // HSL values without hsl() — e.g. '258 90% 66%'
  fg: string        // foreground on primary backgrounds
}

export const THEME_COLORS: ThemeColor[] = [
  { key: 'violet',  label: 'Violeta',    primary: '258 90% 66%', fg: '0 0% 100%' },
  { key: 'purple',  label: 'Púrpura',    primary: '271 81% 62%', fg: '0 0% 100%' },
  { key: 'fuchsia', label: 'Fucsia',     primary: '292 84% 62%', fg: '0 0% 100%' },
  { key: 'pink',    label: 'Rosa',       primary: '330 81% 65%', fg: '0 0% 100%' },
  { key: 'red',     label: 'Rojo',       primary: '0 72% 58%',   fg: '0 0% 100%' },
  { key: 'rose',    label: 'Frambuesa',  primary: '343 76% 57%', fg: '0 0% 100%' },
  { key: 'orange',  label: 'Naranja',    primary: '22 95% 56%',  fg: '0 0% 100%' },
  { key: 'amber',   label: 'Ámbar',      primary: '38 92% 52%',  fg: '222 47% 7%' },
  { key: 'yellow',  label: 'Amarillo',   primary: '48 96% 54%',  fg: '222 47% 7%' },
  { key: 'gold',    label: 'Oro',        primary: '43 88% 52%',  fg: '222 47% 7%' },
  { key: 'lime',    label: 'Lima',       primary: '84 78% 44%',  fg: '0 0% 100%' },
  { key: 'green',   label: 'Verde',      primary: '142 69% 43%', fg: '0 0% 100%' },
  { key: 'emerald', label: 'Esmeralda',  primary: '152 74% 40%', fg: '0 0% 100%' },
  { key: 'teal',    label: 'Agua',       primary: '172 60% 45%', fg: '0 0% 100%' },
  { key: 'cyan',    label: 'Cian',       primary: '192 90% 46%', fg: '0 0% 100%' },
  { key: 'sky',     label: 'Cielo',      primary: '199 89% 50%', fg: '0 0% 100%' },
  { key: 'blue',    label: 'Azul',       primary: '217 91% 60%', fg: '0 0% 100%' },
  { key: 'indigo',  label: 'Índigo',     primary: '235 86% 65%', fg: '0 0% 100%' },
  { key: 'slate',   label: 'Pizarra',    primary: '215 28% 60%', fg: '0 0% 100%' },
  { key: 'white',   label: 'Blanco',     primary: '0 0% 94%',    fg: '222 47% 7%' },
]

export function applyTheme(color: ThemeColor): void {
  const root = document.documentElement
  root.style.setProperty('--primary', color.primary)
  root.style.setProperty('--primary-foreground', color.fg)
  root.style.setProperty('--accent', color.primary)
  root.style.setProperty('--accent-foreground', color.fg)
}

export function getThemeColor(key: string): ThemeColor {
  return THEME_COLORS.find(c => c.key === key) ?? THEME_COLORS[0]
}
