import { NavLink } from 'react-router-dom'
import { CalendarCheck, ListTodo, BarChart2, Settings } from 'lucide-react'

const tabs = [
  { to: '/',         icon: CalendarCheck, label: 'Hoy'      },
  { to: '/habits',   icon: ListTodo,      label: 'Hábitos'  },
  { to: '/history',  icon: BarChart2,     label: 'Historial'},
  { to: '/settings', icon: Settings,      label: 'Ajustes'  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/15' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
