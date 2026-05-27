interface ProgressRingProps {
  completed: number
  total: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({
  completed,
  total,
  size = 80,
  strokeWidth = 6,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total === 0 ? 0 : completed / total
  const offset = circumference * (1 - pct)

  return (
    <svg width={size} height={size} className={`-rotate-90 ${className}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500"
      />
    </svg>
  )
}
