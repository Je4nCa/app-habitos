import { useState } from 'react'
import { X } from 'lucide-react'
import { HABIT_COLORS } from '@/lib/colors'
import { getDayName } from '@/lib/dates'
import type { Habit, HabitCategory, HabitFrequency } from '@/types'

const EMOJIS = ['💪', '🧘', '📚', '🏃', '💧', '🥗', '😴', '🎯', '✍️', '🎵', '🌱', '🧹', '💊', '🚴', '🧠', '❤️', '🌞', '🙏']
const CATEGORIES: { key: HabitCategory; label: string }[] = [
  { key: 'health',       label: 'Salud'        },
  { key: 'fitness',      label: 'Ejercicio'    },
  { key: 'mindfulness',  label: 'Mindfulness'  },
  { key: 'learning',     label: 'Aprendizaje'  },
  { key: 'nutrition',    label: 'Nutrición'    },
  { key: 'sleep',        label: 'Sueño'        },
  { key: 'productivity', label: 'Productividad'},
  { key: 'social',       label: 'Social'       },
  { key: 'other',        label: 'Otro'         },
]

interface HabitFormProps {
  initial?: Partial<Habit>
  onSave: (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => void
  onCancel: () => void
}

export function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const [name, setName]           = useState(initial?.name ?? '')
  const [emoji, setEmoji]         = useState(initial?.emoji ?? '💪')
  const [category, setCategory]   = useState<HabitCategory>(initial?.category ?? 'health')
  const [frequency, setFrequency] = useState<HabitFrequency>(initial?.frequency ?? 'daily')
  const [customDays, setCustomDays] = useState<number[]>(initial?.customDays ?? [1,2,3,4,5])
  const [color, setColor]         = useState(initial?.color ?? 'violet')

  const toggleDay = (d: number) =>
    setCustomDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      emoji,
      category,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      color,
      archivedAt: initial?.archivedAt,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onCancel} className="p-2 rounded-xl text-muted-foreground">
          <X size={22} />
        </button>
        <h2 className="font-bold text-lg">{initial?.name ? 'Editar hábito' : 'Nuevo hábito'}</h2>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
        >
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-8 space-y-6 mt-2">
        {/* Emoji picker */}
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Ícono</label>
          <div className="grid grid-cols-9 gap-1.5">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-2xl p-1.5 rounded-xl transition-all duration-150 ${emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        {/* Name */}
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Meditar 10 minutos"
            className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary transition-all"
            maxLength={40}
            autoCapitalize="sentences"
          />
        </section>

        {/* Color */}
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Color</label>
          <div className="flex gap-2 flex-wrap">
            {HABIT_COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => setColor(c.key)}
                className={`w-8 h-8 rounded-full ${c.bg} transition-all duration-150 ${color === c.key ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-background' : ''}`}
              />
            ))}
          </div>
        </section>

        {/* Category */}
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  category === c.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Frequency */}
        <section>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Frecuencia</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['daily',    'Todos los días'],
              ['weekdays', 'Días de semana'],
              ['weekends', 'Fines de semana'],
              ['custom',   'Personalizado'],
            ] as [HabitFrequency, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFrequency(key)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  frequency === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {frequency === 'custom' && (
            <div className="flex gap-2 mt-3 justify-between">
              {[0,1,2,3,4,5,6].map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    customDays.includes(d) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {getDayName(d)}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
