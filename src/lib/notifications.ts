import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { today, isHabitScheduledForDate } from '@/lib/dates'

let timers: ReturnType<typeof setTimeout>[] = []

export function isSupported(): boolean {
  return 'Notification' in window
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

interface NotifConfig {
  bedtimeEnabled: boolean
  bedtimeTime: string
  afternoonEnabled: boolean
  afternoonTime: string
  habitReminderEnabled: boolean
  habitReminderTime: string
  playerName: string
}

const ICON = '/app-habitos/icons/icon-192x192.png'

function scheduleAt(timeStr: string, cb: () => void) {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target <= now) return
  timers.push(setTimeout(cb, target.getTime() - now.getTime()))
}

export function scheduleTodayNotifications(cfg: NotifConfig) {
  timers.forEach(clearTimeout)
  timers = []

  if (!isSupported() || Notification.permission !== 'granted') return

  if (cfg.bedtimeEnabled) {
    scheduleAt(cfg.bedtimeTime, () => {
      try {
        new Notification('😴 Hora de dormir', {
          body: `Son las ${cfg.bedtimeTime} — apagá pantallas y preparate para descansar bien`,
          icon: ICON, badge: ICON,
        })
      } catch {}
    })
  }

  if (cfg.afternoonEnabled) {
    scheduleAt(cfg.afternoonTime, () => {
      try {
        new Notification('🏠 ¡Llegaste a casa!', {
          body: '¿Qué vas a hacer? No te vayas directo a la cama y al TikTok 💪',
          icon: ICON, badge: ICON,
        })
      } catch {}
    })
  }

  if (cfg.habitReminderEnabled) {
    scheduleAt(cfg.habitReminderTime, () => {
      try {
        // Read live store state at fire time so we know what's actually pending
        const habits = useHabitsStore.getState().habits
        const logs   = useLogsStore.getState().logs
        const date   = today()
        const scheduled = habits.filter(h => !h.archivedAt && isHabitScheduledForDate(h, date))
        const pending   = scheduled.filter(h => !logs.some(l => l.habitId === h.id && l.completedAt === date))
        if (pending.length === 0) return
        new Notification(
          `${cfg.playerName} — ${pending.length} ${pending.length === 1 ? 'hábito pendiente' : 'hábitos pendientes'} 💪`,
          {
            body: pending.slice(0, 3).map(h => `${h.emoji} ${h.name}`).join(' · '),
            icon: ICON, badge: ICON,
          }
        )
      } catch {}
    })
  }
}

export function cancelAll() {
  timers.forEach(clearTimeout)
  timers = []
}
