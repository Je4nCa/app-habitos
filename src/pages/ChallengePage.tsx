import { useState, useMemo } from 'react'
import { Trophy, Download, Upload, Plus, Trash2 } from 'lucide-react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { usePlayerStore } from '@/store/playerStore'
import { usePrizesStore } from '@/store/prizesStore'
import { calcMonthPoints, currentMonthKey, monthLabel } from '@/lib/points'

const PRIZE_EMOJIS = ['🎁', '🍕', '🎬', '💆', '🧖', '🛏️', '🎮', '🧹', '🍽️', '🎉', '🏖️', '🌮', '🍰', '🎲', '💅']

interface PartnerData {
  playerName: string
  monthKey: string
  points: number
}

export function ChallengePage() {
  const { habits } = useHabitsStore()
  const { logs } = useLogsStore()
  const { playerName, partnerName } = usePlayerStore()
  const { prizes, addPrize, removePrize } = usePrizesStore()

  const monthKey = currentMonthKey()
  const myPoints = useMemo(() => calcMonthPoints(monthKey, habits, logs), [monthKey, habits, logs])

  const [partnerData, setPartnerData] = useState<PartnerData | null>(null)
  const [showAddPrize, setShowAddPrize] = useState(false)
  const [newPrizeName, setNewPrizeName] = useState('')
  const [newPrizeEmoji, setNewPrizeEmoji] = useState('🎁')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const exportChallenge = () => {
    const payload = {
      playerName,
      monthKey,
      points: myPoints,
      habits,
      logs: logs.filter(l => l.completedAt.startsWith(monthKey)),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `desafio-${playerName.toLowerCase()}-${monthKey}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importPartner = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.playerName && data.monthKey && typeof data.points === 'number') {
          setPartnerData({ playerName: data.playerName, monthKey: data.monthKey, points: data.points })
        } else {
          alert('Archivo de desafío inválido')
        }
      } catch {
        alert('No se pudo leer el archivo')
      }
    }
    input.click()
  }

  const winner = partnerData
    ? myPoints > partnerData.points
      ? playerName
      : partnerData.points > myPoints
        ? partnerData.playerName
        : 'Empate'
    : null

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-5 pt-safe pb-4">
        <h1 className="text-2xl font-bold">Desafío</h1>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{monthLabel(monthKey)}</p>
      </header>

      <main className="flex-1 px-4 pb-32 space-y-4">

        {/* My points */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Tus puntos este mes</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-primary">{myPoints}</span>
            <span className="text-muted-foreground mb-1">pts</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {playerName} · {monthLabel(monthKey)}
          </p>
        </div>

        {/* Points breakdown info */}
        <div className="bg-muted/40 rounded-2xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sistema de puntos</p>
          <Row label="Hábito completado" value="+10 pts" />
          <Row label="Racha de 3 días" value="+5 pts/hábito" />
          <Row label="Racha de 7 días" value="+15 pts/hábito" />
          <Row label="Día perfecto (todos ✓)" value="+25 pts" />
        </div>

        {/* Partner result */}
        {partnerData ? (
          <div className={`rounded-2xl border p-5 ${
            winner === playerName ? 'bg-primary/10 border-primary/40' :
            winner === 'Empate'   ? 'bg-amber-500/10 border-amber-500/40' :
                                   'bg-rose-500/10 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Resultado vs {partnerData.playerName}</p>
                <p className="text-xs text-muted-foreground">{monthLabel(partnerData.monthKey)}</p>
              </div>
              <span className="text-3xl">
                {winner === playerName ? '🏆' : winner === 'Empate' ? '🤝' : '😤'}
              </span>
            </div>
            <div className="flex gap-4">
              <Score name={playerName} pts={myPoints} highlight={winner === playerName} />
              <div className="flex items-center text-muted-foreground text-lg font-bold">vs</div>
              <Score name={partnerData.playerName} pts={partnerData.points} highlight={winner === partnerData.playerName} />
            </div>
            {winner !== 'Empate' && (
              <p className="text-sm font-semibold mt-3 text-center">
                🎉 {winner} gana — ¡elige tu premio!
              </p>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-2">
            <Trophy size={32} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">¿Quién ganó?</p>
            <p className="text-sm text-muted-foreground">
              Exporta tus datos, mándaselos a {partnerName} y cuando recibas los de ella, impórtalos aquí.
            </p>
          </div>
        )}

        {/* Export / Import */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-5 pt-4 pb-2">
            Sincronizar con {partnerName}
          </p>
          <button onClick={exportChallenge} className="flex items-center gap-3 w-full px-5 py-3.5 text-left active:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Download size={18} className="text-sky-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Exportar mis puntos</p>
              <p className="text-xs text-muted-foreground">Mándale el archivo a {partnerName}</p>
            </div>
          </button>
          <div className="h-px bg-border mx-5" />
          <button onClick={importPartner} className="flex items-center gap-3 w-full px-5 py-3.5 text-left active:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Upload size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Importar datos de {partnerName}</p>
              <p className="text-xs text-muted-foreground">Ver quién ganó el mes</p>
            </div>
          </button>
        </div>

        {/* Prize pool */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Pool de premios</p>
            <button
              onClick={() => setShowAddPrize(true)}
              className="flex items-center gap-1 text-xs text-primary font-semibold"
            >
              <Plus size={14} /> Agregar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {prizes.map(prize => (
              <div
                key={prize.id}
                className="bg-card border border-border rounded-2xl p-3 flex items-center gap-2 group"
              >
                <span className="text-2xl">{prize.emoji}</span>
                <span className="text-sm font-medium flex-1 leading-tight">{prize.name}</span>
                {prize.isCustom && (
                  <button
                    onClick={() => setConfirmRemove(prize.id)}
                    className="opacity-0 group-active:opacity-100 p-1 text-muted-foreground"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Add prize sheet */}
      {showAddPrize && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPrize(false)} />
          <div className="relative bg-background rounded-t-3xl border-t border-border p-6 safe-bottom space-y-4">
            <div className="mx-auto w-10 h-1 bg-border rounded-full -mt-2 mb-2" />
            <h3 className="font-bold text-lg">Nuevo premio</h3>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {PRIZE_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setNewPrizeEmoji(e)}
                    className={`text-2xl p-1.5 rounded-xl transition-all ${newPrizeEmoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">Nombre del premio</label>
              <input
                value={newPrizeName}
                onChange={e => setNewPrizeName(e.target.value)}
                placeholder="Ej: Noche de Netflix"
                className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary"
                autoCapitalize="sentences"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAddPrize(false)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold">
                Cancelar
              </button>
              <button
                disabled={!newPrizeName.trim()}
                onClick={() => {
                  addPrize(newPrizeName, newPrizeEmoji)
                  setNewPrizeName('')
                  setNewPrizeEmoji('🎁')
                  setShowAddPrize(false)
                }}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm remove prize */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmRemove(null)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2">¿Eliminar premio?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmRemove(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold">Cancelar</button>
              <button onClick={() => { removePrize(confirmRemove); setConfirmRemove(null) }} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  )
}

function Score({ name, pts, highlight }: { name: string; pts: number; highlight: boolean }) {
  return (
    <div className={`flex-1 text-center p-3 rounded-xl ${highlight ? 'bg-primary/20' : 'bg-muted/40'}`}>
      <p className="text-xs text-muted-foreground font-medium">{name}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>{pts}</p>
      <p className="text-xs text-muted-foreground">pts</p>
    </div>
  )
}
