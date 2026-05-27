import { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CalendarCheck, ListTodo, BarChart2, Trophy, Settings, CalendarDays } from 'lucide-react'

const tabs = [
  { to: '/',          icon: CalendarCheck, label: 'Hoy'      },
  { to: '/calendar',  icon: CalendarDays,  label: 'Plan'     },
  { to: '/habits',    icon: ListTodo,      label: 'Hábitos'  },
  { to: '/history',   icon: BarChart2,     label: 'Stats'    },
  { to: '/challenge', icon: Trophy,        label: 'Desafío'  },
  { to: '/settings',  icon: Settings,      label: 'Ajustes'  },
]

export function BottomNav() {
  const navigate   = useNavigate()
  const holdTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdTarget = useRef<string | null>(null)

  // Long-press on any tab for 700 ms → go to hidden /nosotros page
  const startHold = (to: string) => {
    holdTarget.current = to
    holdTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(40)
      navigate('/nosotros')
      holdTimer.current = null
    }, 700)
  }
  const cancelHold = () => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-0.5 pt-1.5 pb-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onTouchStart={() => startHold(to)}
            onTouchEnd={cancelHold}
            onTouchMove={cancelHold}
            onMouseDown={() => startHold(to)}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-0 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
            style={{ transition: 'color 180ms cubic-bezier(0.23,1,0.32,1)', WebkitTouchCallout: 'none' }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl ${isActive ? 'bg-primary/15' : ''}`}
                  style={{
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 180ms cubic-bezier(0.23,1,0.32,1), background-color 180ms ease',
                  }}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ transition: 'stroke-width 180ms ease' }} />
                </div>
                <span
                  className={`text-[9px] font-medium truncate ${isActive ? 'font-semibold' : 'opacity-50'}`}
                  style={{ transition: 'opacity 180ms ease' }}
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
