import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { usePlayerStore }        from '@/store/playerStore'
import { useSettingsStore }      from '@/store/settingsStore'
import { useNotificationsStore } from '@/store/notificationsStore'
import { useThemeStore }         from '@/store/themeStore'
import { applyTheme, getThemeColor, applyBackground, getBackgroundTheme } from '@/lib/theme'
import { requestPersistentStorage } from '@/lib/storage'
import { scheduleTodayNotifications } from '@/lib/notifications'
import { BottomNav }      from '@/components/BottomNav'
import { SetupPage }      from '@/pages/SetupPage'
import { TodayPage }      from '@/pages/TodayPage'
import { HabitsPage }     from '@/pages/HabitsPage'
import { HistoryPage }    from '@/pages/HistoryPage'
import { ChallengePage }  from '@/pages/ChallengePage'
import { SettingsPage }   from '@/pages/SettingsPage'

function AppShell() {
  const { storagePermission, setStoragePermission } = useSettingsStore()
  const notifs     = useNotificationsStore()
  const primaryKey    = useThemeStore(s => s.primaryKey)
  const backgroundKey = useThemeStore(s => s.backgroundKey)
  const { playerName } = usePlayerStore()

  // Re-apply both layers on change (covers the hydration race with onRehydrateStorage)
  useEffect(() => { applyTheme(getThemeColor(primaryKey)) },       [primaryKey])
  useEffect(() => { applyBackground(getBackgroundTheme(backgroundKey)) }, [backgroundKey])

  // Request persistent storage once
  useEffect(() => {
    if (storagePermission === 'unknown') {
      requestPersistentStorage().then(granted => {
        setStoragePermission(granted ? 'granted' : 'denied')
      })
    }
  }, [storagePermission, setStoragePermission])

  // Schedule today's notifications on mount and when app regains focus
  useEffect(() => {
    const schedule = () => {
      scheduleTodayNotifications({
        bedtimeEnabled:        notifs.bedtimeEnabled,
        bedtimeTime:           notifs.bedtimeTime,
        afternoonEnabled:      notifs.afternoonEnabled,
        afternoonTime:         notifs.afternoonTime,
        habitReminderEnabled:  notifs.habitReminderEnabled,
        habitReminderTime:     notifs.habitReminderTime,
        playerName,
      })
    }

    schedule()

    const onVisible = () => { if (document.visibilityState === 'visible') schedule() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [
    notifs.bedtimeEnabled, notifs.bedtimeTime,
    notifs.afternoonEnabled, notifs.afternoonTime,
    notifs.habitReminderEnabled, notifs.habitReminderTime,
    playerName,
  ])

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <Routes>
        <Route path="/"          element={<TodayPage />}     />
        <Route path="/habits"    element={<HabitsPage />}    />
        <Route path="/history"   element={<HistoryPage />}   />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/settings"  element={<SettingsPage />}  />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const setupDone = usePlayerStore(s => s.setupDone)

  return (
    <HashRouter>
      {setupDone ? <AppShell /> : <SetupPage />}
    </HashRouter>
  )
}
