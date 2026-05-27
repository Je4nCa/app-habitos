import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useCoupleActivitiesStore, PRESET_ACTIVITIES } from '@/store/coupleActivitiesStore'

interface Props {
  date: string
  partnerName: string
}

export function CoupleActivitySection({ date, partnerName }: Props) {
  const { activities, addActivity, removeActivity } = useCoupleActivitiesStore()
  const todayActivities = activities.filter(a => a.date === date)
  const [open, setOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('❤️')

  const CUSTOM_EMOJIS = ['❤️', '🎯', '🌮', '☕', '🎵', '🌅', '🧘', '🛒', '📸', '🏊']

  const handleAdd = (name: string, emoji: string) => {
    addActivity(date, name, emoji)
    setOpen(false)
  }

  const handleCustom = () => {
    if (!customName.trim()) return
    handleAdd(customName.trim(), customEmoji)
    setCustomName('')
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">❤️</span>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          Juntos hoy
        </p>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs text-primary font-semibold"
        >
          <Plus size={14} /> Agregar
        </button>
      </div>

      {todayActivities.length === 0 ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-border text-muted-foreground transition-colors active:bg-muted"
        >
          <span className="text-2xl">+</span>
          <p className="text-sm">¿Hicieron algo juntos hoy con {partnerName}?</p>
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {todayActivities.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 group"
            >
              <span className="text-lg">{a.emoji}</span>
              <span className="text-sm font-medium">{a.name}</span>
              <button
                onClick={() => removeActivity(a.id)}
                className="ml-1 text-muted-foreground opacity-0 group-active:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground"
          >
            <Plus size={14} /> Más
          </button>
        </div>
      )}

      {/* Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-background rounded-t-3xl border-t border-border safe-bottom">
            <div className="mx-auto w-10 h-1 bg-border rounded-full mt-3 mb-1" />
            <div className="px-5 pt-2 pb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">¿Qué hicieron juntos?</h3>
              <button onClick={() => setOpen(false)} className="p-2 text-muted-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="px-4 pb-6 space-y-4 max-h-[70dvh] overflow-y-auto scrollbar-none">
              {/* Presets */}
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ACTIVITIES.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handleAdd(p.name, p.emoji)}
                    style={{ transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                    className="flex items-center gap-2 p-3 bg-card border border-border rounded-2xl text-left active:scale-[0.97]"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Personalizado</p>
                <div className="flex gap-2 flex-wrap">
                  {CUSTOM_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setCustomEmoji(e)}
                      className={`text-xl p-2 rounded-xl transition-all ${customEmoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="Ej: Hicimos las compras"
                    className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary"
                    onKeyDown={e => e.key === 'Enter' && handleCustom()}
                    autoCapitalize="sentences"
                  />
                  <button
                    onClick={handleCustom}
                    disabled={!customName.trim()}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
