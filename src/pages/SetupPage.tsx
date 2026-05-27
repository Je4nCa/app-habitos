import { useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useHabitsStore } from '@/store/habitsStore'
import { buildDefaultHabits } from '@/lib/defaultHabits'

export function SetupPage() {
  const { setPlayer } = usePlayerStore()
  const { habits, addHabit } = useHabitsStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [playerName, setPlayerName] = useState('')
  const [partnerName, setPartnerName] = useState('')

  const goStep2 = () => {
    if (playerName.trim() && partnerName.trim()) setStep(2)
  }

  const finish = (loadDefaults: boolean) => {
    if (loadDefaults && habits.length === 0) {
      buildDefaultHabits().forEach(h => {
        addHabit({
          name: h.name, emoji: h.emoji, category: h.category,
          frequency: h.frequency, color: h.color,
        })
      })
    }
    setPlayer(playerName, partnerName)
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 py-12">
      {step === 1 ? (
        <div className="w-full max-w-sm space-y-6 animate-in">
          <div className="text-center space-y-2">
            <span className="text-6xl">🔥</span>
            <h1 className="text-2xl font-bold">Hábitos Mamocitos</h1>
            <p className="text-muted-foreground text-sm">
              La app que los va a obligar a mejorar. Juntos, pero compitiendo.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">
                Tu nombre
              </label>
              <input
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Ej: Jean"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary transition-all"
                autoCapitalize="words"
                onKeyDown={e => e.key === 'Enter' && goStep2()}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">
                Nombre de tu pareja
              </label>
              <input
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                placeholder="Ej: Jaz"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary transition-all"
                autoCapitalize="words"
                onKeyDown={e => e.key === 'Enter' && goStep2()}
              />
            </div>
          </div>

          <button
            onClick={goStep2}
            disabled={!playerName.trim() || !partnerName.trim()}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base disabled:opacity-40 transition-all active:scale-95"
          >
            Continuar →
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-6xl">💪</span>
            <h2 className="text-xl font-bold">¿Empezamos con hábitos?</h2>
            <p className="text-muted-foreground text-sm">
              Preparé 8 hábitos para tu contexto: sueño, ejercicio, alimentación, pantallas y más.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
            {['😴 Dormir antes de las 9 PM', '⏰ Levantarse sin snooze', '💪 Ejercicio o actividad física',
              '🥗 Comer bien', '📵 Sin TikTok en la tarde', '🧴 Skincare mañana',
              '🚶 Caminar 20 min', '💧 Hidratarse (2L)'].map(h => (
              <div key={h} className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-xs">✓</span>
                <span>{h}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Puedes editar, agregar o eliminar hábitos cuando quieras desde la pestaña Hábitos.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => finish(true)}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base transition-all active:scale-95"
            >
              Cargar estos hábitos ✓
            </button>
            <button
              onClick={() => finish(false)}
              className="w-full py-3 text-muted-foreground text-sm"
            >
              Empezar desde cero
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
