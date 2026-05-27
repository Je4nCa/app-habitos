import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { BottomNav }      from '@/components/BottomNav'
import { SetupPage }      from '@/pages/SetupPage'
import { TodayPage }      from '@/pages/TodayPage'
import { HabitsPage }     from '@/pages/HabitsPage'
import { HistoryPage }    from '@/pages/HistoryPage'
import { ChallengePage }  from '@/pages/ChallengePage'
import { SettingsPage }   from '@/pages/SettingsPage'

function AppShell() {
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
