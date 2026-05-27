import { NavLink } from 'react-router-dom'
import { CalendarCheck, ListTodo, BarChart2, Trophy, Settings } from 'lucide-react'

const tabs = [
  { to: '/',          icon: CalendarCheck, label: 'Hoy'      },
  { to: '/habits',    icon: ListTodo,      label: 'Hábitos'  },
  { to: '/history',   icon: BarChart2,     label: 'Historial'},
  { to: '/challenge', icon: Trophy,        label: 'Desafío'  },
  { to: '/settings',  icon: Settings,      label: 'Ajustes'  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`
                  p-1.5 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-primary/15 scale-110' : 'scale-100'}
                `}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="transition-all duration-200" />
                </div>
                <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'opacity-100 font-semibold' : 'opacity-50'}`}>
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
