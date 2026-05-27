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
  playerName: string
}

export function scheduleTodayNotifications(cfg: NotifConfig) {
  timers.forEach(clearTimeout)
  timers = []

  if (!isSupported() || Notification.permission !== 'granted') return

  const now = new Date()

  const schedule = (timeStr: string, title: string, body: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target <= now) return
    const delay = target.getTime() - now.getTime()
    timers.push(
      setTimeout(() => {
        try {
          new Notification(title, {
            body,
            icon: '/app-habitos/icons/icon-192x192.png',
            badge: '/app-habitos/icons/icon-192x192.png',
            silent: false,
          })
        } catch {
          // Notification may fail if app is backgrounded on some iOS versions
        }
      }, delay)
    )
  }

  if (cfg.bedtimeEnabled) {
    schedule(
      cfg.bedtimeTime,
      '😴 Hora de dormir',
      `Son las ${cfg.bedtimeTime} — apagá pantallas y preparate para descansar bien`
    )
  }

  if (cfg.afternoonEnabled) {
    schedule(
      cfg.afternoonTime,
      '🏠 ¡Llegaste a casa!',
      '¿Qué vas a hacer? No te vayas directo a la cama y al TikTok 💪'
    )
  }
}

export function cancelAll() {
  timers.forEach(clearTimeout)
  timers = []
}
