import { HashRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { TodayPage }    from '@/pages/TodayPage'
import { HabitsPage }   from '@/pages/HabitsPage'
import { HistoryPage }  from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-dvh bg-background text-foreground flex flex-col">
        <Routes>
          <Route path="/"         element={<TodayPage />}    />
          <Route path="/habits"   element={<HabitsPage />}   />
          <Route path="/history"  element={<HistoryPage />}  />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
