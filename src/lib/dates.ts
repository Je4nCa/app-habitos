export function today(): string {
  return toDateString(new Date())
}

export function toDateString(date: Date): string {
  return date.toLocaleDateString('en-CA') // YYYY-MM-DD
}

export function fromDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDisplayDate(dateStr: string): string {
  const date = fromDateString(dateStr)
  const t = today()
  if (dateStr === t) return 'Hoy'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === toDateString(yesterday)) return 'Ayer'

  return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatShortDate(dateStr: string): string {
  const date = fromDateString(dateStr)
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export function getLast30Days(): string[] {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toDateString(d))
  }
  return days
}

export function getDayOfWeek(dateStr: string): number {
  return fromDateString(dateStr).getDay()
}

export function isHabitScheduledForDate(habit: { frequency: string; customDays?: number[] }, dateStr: string): boolean {
  const dow = getDayOfWeek(dateStr)
  switch (habit.frequency) {
    case 'daily':
      return true
    case 'weekdays':
      return dow >= 1 && dow <= 5
    case 'weekends':
      return dow === 0 || dow === 6
    case 'custom':
      return habit.customDays?.includes(dow) ?? false
    default:
      return true
  }
}

export function getDayName(dow: number): string {
  const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return names[dow]
}
