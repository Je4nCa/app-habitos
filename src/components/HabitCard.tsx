import { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { getColor } from '@/lib/colors'
import type { Habit } from '@/types'

interface HabitCardProps {
  habit: Habit
  completed: boolean
  onToggle: () => void
  streak?: number
  index?: number
}

export function HabitCard({ habit, completed, onToggle, streak = 0, index = 0 }: HabitCardProps) {
  const color = getColor(habit.color)
  const [pressed, setPressed] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setPressed(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setPressed(false)
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (dx > 50 && dy < 40) { onToggle(); return }
  }

  const handleTouchMove = () => setPressed(false)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={onToggle}
      style={{
        animationDelay: `${index * 45}ms`,
        transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms ease, border-color 200ms ease, opacity 200ms ease',
      }}
      className={`
        relative flex items-center gap-3 p-4 rounded-2xl border select-none cursor-pointer gpu
        animate-stagger-in
        ${pressed ? 'scale-[0.97]' : 'scale-100'}
        ${completed ? `${color.light} border-transparent` : 'bg-card border-border'}
      `}
    >
      {/* Emoji icon */}
      <div
        className={`flex items-center justify-center w-11 h-11 rounded-xl text-2xl ${completed ? color.bg : color.light}`}
        style={{ transition: 'background-color 200ms ease' }}
      >
        {habit.emoji}
      </div>

      {/* Name + streak */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-base truncate ${completed ? 'line-through opacity-60' : ''}`}
          style={{ transition: 'opacity 200ms ease, text-decoration 200ms ease' }}
        >
          {habit.name}
        </p>
        {streak > 1 && (
          <p className={`text-xs mt-0.5 ${color.text}`}>
            🔥 {streak} días seguidos
          </p>
        )}
      </div>

      {/* Check circle */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          completed ? `${color.bg} border-transparent` : 'border-border bg-transparent'
        }`}
        style={{ transition: 'background-color 200ms ease, border-color 200ms ease' }}
      >
        {completed && (
          <Check size={16} strokeWidth={3} className="text-white animate-check-pop" />
        )}
      </div>
    </div>
  )
}
