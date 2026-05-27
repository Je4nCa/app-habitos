import { useState, useMemo } from 'react'
import { Download, Upload, Plus, Trash2, Trophy, Gift } from 'lucide-react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { usePlayerStore } from '@/store/playerStore'
import { usePrizesStore } from '@/store/prizesStore'
import {
  calcWeekPoints, calcMonthPoints,
  currentWeekKey, currentMonthKey,
  weekLabel, monthLabel,
  getWeekBounds, isSunday, isDay30,
} from '@/lib/points'
import { isHabitScheduledForDate } from '@/lib/dates'
import type { Habit, HabitLog } from '@/types'
import type { Prize } from '@/store/prizesStore'

const PRIZE_EMOJIS = ['🎁','🍕','🎬','💆','🧖','🛏️','🎮','🧹','🍽️','🎉','🏖️','🌮','🍰','🎲','💅']

type PeriodType = 'weekly' | 'monthly'

interface PartnerData {
  playerName: string
  periodType: PeriodType
  periodKey: string
  points: number
  habits?: Habit[]
  logs?: HabitLog[]
}

export function ChallengePage() {
  const { habits } = useHabitsStore()
  const { logs } = useLogsStore()
  const { playerName, partnerName } = usePlayerStore()
  const { prizes, addPrize, removePrize, claimPrize } = usePrizesStore()

  const [tab, setTab] = useState<PeriodType>('weekly')
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null)
  const [showAddPrize, setShowAddPrize] = useState(false)
  const [newPrizeName, setNewPrizeName] = useState('')
  const [newPrizeEmoji, setNewPrizeEmoji] = useState('🎁')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [claimingFor, setClaimingFor] = useState<PeriodType | null>(null)

  // Current period keys
  const wKey = currentWeekKey()
  const mKey = currentMonthKey()
  const weekBounds = getWeekBounds(new Date())

  // My points
  const myWeekPts  = useMemo(() => calcWeekPoints(wKey,  habits, logs), [wKey,  habits, logs])
  const myMonthPts = useMemo(() => calcMonthPoints(mKey, habits, logs), [mKey, habits, logs])
  const myPts = tab === 'weekly' ? myWeekPts : myMonthPts

  // Available (unclaimed) and active (claimed but not expired) prizes
  const now = new Date()
  const availablePrizes = prizes.filter(p => !p.claimedAt)
  const activePrizes    = prizes.filter(p => p.claimedAt && new Date(p.expiresAt!) > now)

  // Winner of current comparison
  const winner = partnerData
    ? myPts > partnerData.points ? playerName
      : partnerData.points > myPts ? partnerData.playerName
      : 'Empate'
    : null

  const iWon = winner === playerName

  // Habit breakdown
  const habitBreakdown = useMemo(() => {
    if (!partnerData?.habits || !partnerData?.logs) return []
    const { start, end } = tab === 'weekly' ? weekBounds : (() => {
      const [y, m] = mKey.split('-').map(Number)
      const days = new Date(y, m, 0).getDate()
      return { start: `${mKey}-01`, end: `${mKey}-${String(days).padStart(2,'0')}` }
    })()

    const periodDays: string[] = []
    const cur = new Date(start + 'T12:00:00')
    const endD = new Date(end + 'T12:00:00')
    while (cur <= endD) {
      periodDays.push(cur.toLocaleDateString('en-CA'))
      cur.setDate(cur.getDate() + 1)
    }

    const names = new Set([
      ...habits.filter(h => !h.archivedAt).map(h => h.name),
      ...(partnerData.habits ?? []).filter(h => !h.archivedAt).map(h => h.name),
    ])

    return Array.from(names).map(name => {
      const myH   = habits.find(h => h.name === name && !h.archivedAt)
      const themH = partnerData.habits?.find(h => h.name === name && !h.archivedAt)
      const myDays   = myH   ? periodDays.filter(d => isHabitScheduledForDate(myH, d))   : []
      const themDays = themH ? periodDays.filter(d => isHabitScheduledForDate(themH, d)) : []
      const myDone   = myDays.filter(d =>  logs.some(l => l.habitId === myH?.id && l.completedAt === d)).length
      const themDone = themDays.filter(d => partnerData.logs?.some(l => l.habitId === themH?.id && l.completedAt === d)).length
      const myPct   = myDays.length   === 0 ? 0 : Math.round(myDone   / myDays.length   * 100)
      const themPct = themDays.length === 0 ? 0 : Math.round(themDone / themDays.length * 100)
      return {
        name,
        emoji: myH?.emoji ?? themH?.emoji ?? '📋',
        myPct, themPct,
        isPersonal: !!(myH?.isPersonal || themH?.isPersonal),
      }
    }).sort((a, b) => (b.myPct + b.themPct) - (a.myPct + a.themPct))
  }, [partnerData, habits, logs, tab, weekBounds, mKey])

  const exportChallenge = () => {
    const isWeekly = tab === 'weekly'
    const { start, end } = isWeekly ? weekBounds : (() => {
      const [y, m] = mKey.split('-').map(Number)
      const days = new Date(y, m, 0).getDate()
      return { start: `${mKey}-01`, end: `${mKey}-${String(days).padStart(2, '0')}` }
    })()

    const periodLogs = logs.filter(l => l.completedAt >= start && l.completedAt <= end)
    const payload = {
      playerName,
      periodType: tab,
      periodKey: isWeekly ? wKey : mKey,
      points: myPts,
      habits,
      logs: periodLogs,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `desafio-${tab}-${playerName.toLowerCase()}-${isWeekly ? wKey : mKey}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importPartner = () => {
    const input = document.createElement('input')
    input.type   = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const data = JSON.parse(await file.text())
        if (data.playerName && data.periodType && typeof data.points === 'number') {
          setPartnerData({
            playerName: data.playerName,
            periodType: data.periodType,
            periodKey:  data.periodKey,
            points:     data.points,
            habits:     data.habits,
            logs:       data.logs,
          })
          if (data.periodType !== tab) setTab(data.periodType)
        } else {
          alert('Archivo de desafío inválido')
        }
      } catch {
        alert('No se pudo leer el archivo')
      }
    }
    input.click()
  }

  const handleClaimPrize = (prize: Prize) => {
    claimPrize(prize.id, playerName, claimingFor!)
    setClaimingFor(null)
  }

  // Review day banners
  const isReviewDay = tab === 'weekly' ? isSunday() : isDay30()

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-5 pt-safe pb-3">
        <h1 className="text-2xl font-bold">Desafío</h1>
      </header>

      {/* Tab switcher */}
      <div className="px-4 pb-3">
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          {(['weekly', 'monthly'] as PeriodType[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPartnerData(null) }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t === 'weekly' ? '📅 Semanal' : '🗓️ Mensual'}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pb-32 space-y-4">

        {/* Period info */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
            {tab === 'weekly' ? 'Semana actual' : 'Mes actual'}
          </p>
          <p className="text-sm font-semibold capitalize">
            {tab === 'weekly' ? weekLabel(wKey) : monthLabel(mKey)}
          </p>
          {tab === 'weekly' && (
            <p className="text-xs text-muted-foreground mt-1">
              Revisión cada domingo · Revisión mensual el día 30
            </p>
          )}
          {isReviewDay && (
            <div className="mt-2 flex items-center gap-2 bg-primary/15 rounded-xl px-3 py-2">
              <span className="text-lg">🏆</span>
              <p className="text-xs font-semibold text-primary">
                {tab === 'weekly' ? '¡Hoy es domingo! Hacé la revisión semanal' : '¡Día 30! Hacé la revisión mensual'}
              </p>
            </div>
          )}
        </div>

        {/* My points */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
            Tus puntos {tab === 'weekly' ? 'esta semana' : 'este mes'}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-primary">{myPts}</span>
            <span className="text-muted-foreground mb-1">pts</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{playerName}</p>
        </div>

        {/* Points system */}
        <div className="bg-muted/40 rounded-2xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sistema de puntos</p>
          {[
            ['Hábito completado',       '+10 pts'],
            ['Racha de 3 días',         '+5 pts/hábito'],
            ['Racha de 7 días',         '+15 pts/hábito'],
            ['Día perfecto (todos ✓)',  '+25 pts'],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{l}</span>
              <span className="font-semibold text-primary">{v}</span>
            </div>
          ))}
        </div>

        {/* Comparison result */}
        {partnerData ? (
          <>
            <div className={`rounded-2xl border p-5 ${
              winner === playerName ? 'bg-primary/10 border-primary/40' :
              winner === 'Empate'   ? 'bg-amber-500/10 border-amber-500/40' :
                                     'bg-rose-500/10 border-rose-500/40'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Resultado · {tab === 'weekly' ? weekLabel(partnerData.periodKey) : monthLabel(partnerData.periodKey)}
                  </p>
                </div>
                <span className="text-3xl">
                  {winner === playerName ? '🏆' : winner === 'Empate' ? '🤝' : '😤'}
                </span>
              </div>
              <div className="flex gap-4 mb-3">
                <ScoreBox name={playerName} pts={myPts}              highlight={winner === playerName} />
                <div className="flex items-center text-muted-foreground font-bold">vs</div>
                <ScoreBox name={partnerData.playerName} pts={partnerData.points} highlight={winner === partnerData.playerName} />
              </div>

              {winner === 'Empate' && (
                <p className="text-sm font-semibold text-center">¡Empate! Los dos ganan 🤝</p>
              )}

              {iWon && (
                <button
                  onClick={() => setClaimingFor(tab)}
                  className="w-full mt-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Gift size={16} /> Canjear mi premio 🎁
                </button>
              )}
              {!iWon && winner !== 'Empate' && (
                <p className="text-sm text-center text-muted-foreground mt-1">
                  {partnerData.playerName} ganó esta {tab === 'weekly' ? 'semana' : 'vez'}
                </p>
              )}
            </div>

            {/* Habit breakdown */}
            {habitBreakdown.length > 0 && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center px-4 py-2.5 bg-muted/40">
                  <p className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hábito por hábito</p>
                  <div className="w-14 text-center text-[10px] font-semibold text-muted-foreground uppercase">{playerName}</div>
                  <div className="w-14 text-center text-[10px] font-semibold text-muted-foreground uppercase">{partnerData.playerName}</div>
                </div>
                <div className="divide-y divide-border">
                  {habitBreakdown.map(({ name, emoji, myPct, themPct, isPersonal }) => {
                    const iWinHabit   = myPct > themPct
                    const theyWinHabit = themPct > myPct
                    return (
                      <div key={name} className="flex items-center gap-2 px-4 py-2.5">
                        <span className="text-lg">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{name}</p>
                          {isPersonal && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">Personal</span>}
                        </div>
                        <div className="w-14 text-center">
                          <span className={`text-sm font-bold ${iWinHabit ? 'text-primary' : 'text-muted-foreground'}`}>{myPct}%</span>
                          {iWinHabit && <span className="text-xs ml-0.5">🏅</span>}
                        </div>
                        <div className="w-14 text-center">
                          <span className={`text-sm font-bold ${theyWinHabit ? 'text-primary' : 'text-muted-foreground'}`}>{themPct}%</span>
                          {theyWinHabit && <span className="text-xs ml-0.5">🏅</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-2">
            <Trophy size={32} className="mx-auto text-muted-foreground" />
            <p className="font-semibold">¿Quién ganó?</p>
            <p className="text-sm text-muted-foreground">
              Exportá tus datos, mandáselos a {partnerName} y cuando recibas los de ella, importálos aquí.
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
              <p className="text-xs text-muted-foreground">{tab === 'weekly' ? 'Esta semana' : 'Este mes'} · mandáselos a {partnerName}</p>
            </div>
          </button>
          <div className="h-px bg-border mx-5" />
          <button onClick={importPartner} className="flex items-center gap-3 w-full px-5 py-3.5 text-left active:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Upload size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Importar datos de {partnerName}</p>
              <p className="text-xs text-muted-foreground">Ver quién ganó</p>
            </div>
          </button>
        </div>

        {/* Active prizes (claimed, not yet expired) */}
        {activePrizes.length > 0 && (
          <section>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3 px-1">Premios activos</p>
            <div className="space-y-2">
              {activePrizes.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Ganado por {p.claimedBy} · {p.claimType === 'weekly' ? 'Semanal' : 'Mensual'}
                    </p>
                    <p className="text-xs text-amber-400">
                      Vence: {new Date(p.expiresAt!).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prize pool */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Pool de premios</p>
            <button onClick={() => setShowAddPrize(true)} className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Plus size={14} /> Agregar
            </button>
          </div>

          {availablePrizes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>No hay premios disponibles</p>
              <button onClick={() => setShowAddPrize(true)} className="mt-2 text-primary text-xs font-semibold">+ Agregar premio</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availablePrizes.map(prize => (
                <div key={prize.id} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-2 group">
                  <span className="text-2xl">{prize.emoji}</span>
                  <span className="text-sm font-medium flex-1 leading-tight">{prize.name}</span>
                  {prize.isCustom && (
                    <button onClick={() => setConfirmRemove(prize.id)} className="opacity-0 group-active:opacity-100 p-1 text-muted-foreground">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Prize picker sheet (when winner claims) */}
      {claimingFor && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setClaimingFor(null)} />
          <div className="relative bg-background rounded-t-3xl border-t border-border safe-bottom">
            <div className="mx-auto w-10 h-1 bg-border rounded-full mt-3" />
            <div className="px-5 pt-3 pb-2">
              <h3 className="font-bold text-xl">🏆 Escogé tu premio</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {claimingFor === 'weekly' ? 'Premio semanal' : 'Premio mensual'} · válido hasta fin del mes siguiente
              </p>
            </div>
            {availablePrizes.length === 0 ? (
              <div className="px-5 pb-8 text-center text-muted-foreground text-sm py-6">
                <p>No hay premios en el pool</p>
                <button onClick={() => { setClaimingFor(null); setShowAddPrize(true) }} className="mt-2 text-primary font-semibold">
                  Agregar uno
                </button>
              </div>
            ) : (
              <div className="px-4 pb-8 pt-2 grid grid-cols-2 gap-2 max-h-[60dvh] overflow-y-auto scrollbar-none">
                {availablePrizes.map(prize => (
                  <button
                    key={prize.id}
                    onClick={() => handleClaimPrize(prize)}
                    className="flex items-center gap-2 p-4 bg-card border border-border rounded-2xl text-left active:scale-95 active:bg-primary/10 transition-all"
                  >
                    <span className="text-3xl">{prize.emoji}</span>
                    <span className="text-sm font-semibold leading-tight">{prize.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                  <button key={e} onClick={() => setNewPrizeEmoji(e)}
                    className={`text-2xl p-1.5 rounded-xl transition-all ${newPrizeEmoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-2">Nombre</label>
              <input
                value={newPrizeName}
                onChange={e => setNewPrizeName(e.target.value)}
                placeholder="Ej: Noche de Netflix"
                className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 ring-primary"
                autoCapitalize="sentences"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddPrize(false)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold">Cancelar</button>
              <button
                disabled={!newPrizeName.trim()}
                onClick={() => { addPrize(newPrizeName, newPrizeEmoji); setNewPrizeName(''); setNewPrizeEmoji('🎁'); setShowAddPrize(false) }}
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

function ScoreBox({ name, pts, highlight }: { name: string; pts: number; highlight: boolean }) {
  return (
    <div className={`flex-1 text-center p-3 rounded-xl ${highlight ? 'bg-primary/20' : 'bg-muted/40'}`}>
      <p className="text-xs text-muted-foreground font-medium truncate">{name}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>{pts}</p>
      <p className="text-xs text-muted-foreground">pts</p>
    </div>
  )
}
