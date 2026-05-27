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
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
            style={{ transition: 'color 180ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl ${isActive ? 'bg-primary/15' : ''}`}
                  style={{
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), background-color 180ms ease',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ transition: 'stroke-width 180ms ease' }}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium ${isActive ? 'font-semibold' : 'opacity-50'}`}
                  style={{ transition: 'opacity 180ms ease, font-weight 180ms ease' }}
                >
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
