import { useState } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { useSleepStore } from '@/store/sleepStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useNotificationsStore } from '@/store/notificationsStore'
import { usePlayerStore } from '@/store/playerStore'
import { useThemeStore } from '@/store/themeStore'
import { THEME_COLORS } from '@/lib/theme'
import { Trash2, Download, Upload, ShieldCheck, ShieldAlert, AlertCircle, Bell, BellOff, Check } from 'lucide-react'
import { daysSince } from '@/lib/storage'
import { requestPermission, isSupported } from '@/lib/notifications'

export function SettingsPage() {
  const { habits } = useHabitsStore()
  const { logs } = useLogsStore()
  const { entries: sleepEntries } = useSleepStore()
  const { storagePermission, lastBackupAt, markBackup } = useSettingsStore()
  const notifs = useNotificationsStore()
  const { partnerName } = usePlayerStore()
  const { primaryKey, setPrimary } = useThemeStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleEnableNotifs = async () => {
    const perm = await requestPermission()
    notifs.setPermission(perm)
  }

  const totalLogs    = logs.length
  const activeHabits = habits.filter(h => !h.archivedAt).length
  const backupDays   = daysSince(lastBackupAt)
  const needsBackup  = backupDays === null || backupDays >= 30

  const exportData = () => {
    const data = JSON.stringify({ habits, logs, sleepEntries }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habitos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    markBackup()
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.habits && data.logs) {
          useHabitsStore.setState({ habits: data.habits })
          useLogsStore.setState({ logs: data.logs })
          if (data.sleepEntries) useSleepStore.setState({ entries: data.sleepEntries })
          alert('Datos restaurados correctamente')
        }
      } catch {
        alert('Archivo inválido')
      }
    }
    input.click()
  }

  const resetAll = () => {
    useHabitsStore.setState({ habits: [] })
    useLogsStore.setState({ logs: [] })
    useSleepStore.setState({ entries: [] })
    setConfirmReset(false)
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-5 pt-safe pb-4">
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </header>

      <main className="flex-1 px-4 pb-32 space-y-4">

        {/* Storage permission banner */}
        {storagePermission === 'denied' && (
          <div className="flex items-start gap-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4">
            <ShieldAlert size={20} className="text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-rose-300">Almacenamiento no protegido</p>
              <p className="text-xs text-rose-300/80 mt-1">
                iOS puede borrar tus datos si el iPhone se queda sin espacio o no abres la app por varios días.
                Para protegerlos, agrega la app a tu pantalla de inicio desde Safari (ícono de compartir → "Añadir a la pantalla de inicio").
              </p>
            </div>
          </div>
        )}

        {storagePermission === 'granted' && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-emerald-300">Datos protegidos ✓</p>
              <p className="text-xs text-emerald-300/70 mt-0.5">
                iOS no borrará tus datos automáticamente.
              </p>
            </div>
          </div>
        )}

        {/* Backup reminder */}
        {needsBackup && storagePermission !== 'unknown' && (
          <div className="flex items-start gap-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4">
            <AlertCircle size={20} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-amber-300">
                {lastBackupAt === null ? 'Aún no has hecho un backup' : `Último backup hace ${backupDays} días`}
              </p>
              <p className="text-xs text-amber-300/80 mt-1">
                Te recomendamos exportar una vez al mes como seguro extra.
              </p>
              <button
                onClick={exportData}
                className="mt-2 text-xs font-semibold text-amber-300 underline underline-offset-2"
              >
                Exportar ahora
              </button>
            </div>
          </div>
        )}

        {/* Stats card */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Datos guardados</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3">
              <p className="text-2xl font-bold">{activeHabits}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hábitos</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-2xl font-bold">{totalLogs}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Registros</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-2xl font-bold">{sleepEntries.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Noches</p>
            </div>
          </div>
          {lastBackupAt && !needsBackup && (
            <p className="text-xs text-muted-foreground mt-3">
              ✓ Backup hace {backupDays === 0 ? 'menos de 1 día' : `${backupDays} días`}
            </p>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex-1">Notificaciones</p>
            {notifs.permission === 'granted'
              ? <Bell size={14} className="text-primary" />
              : <BellOff size={14} className="text-muted-foreground" />
            }
          </div>

          {!isSupported() ? (
            <p className="px-5 pb-4 text-sm text-muted-foreground">Tu dispositivo no soporta notificaciones web.</p>
          ) : notifs.permission !== 'granted' ? (
            <div className="px-5 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Activa los permisos para recibir recordatorios de bedtime y el check-in de tarde.
                {notifs.permission === 'denied' && ' (Permiso bloqueado — actívalo en Ajustes del iPhone → Safari → Notificaciones)'}
              </p>
              {notifs.permission !== 'denied' && (
                <button
                  onClick={handleEnableNotifs}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
                >
                  Activar notificaciones
                </button>
              )}
              <p className="text-[10px] text-muted-foreground/60">
                ⚠️ Las notificaciones se programan cuando abres la app. Ábrela cada mañana para que funcionen ese día.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Bedtime */}
              <div className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xl">😴</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Hora de dormir</p>
                  <p className="text-xs text-muted-foreground">Recordatorio de bedtime</p>
                </div>
                <input
                  type="time"
                  value={notifs.bedtimeTime}
                  onChange={e => notifs.setTime('bedtimeTime', e.target.value)}
                  className="bg-muted rounded-lg px-2 py-1 text-sm mr-2 text-foreground"
                />
                <button
                  onClick={() => notifs.toggle('bedtimeEnabled')}
                  className={`w-11 h-6 rounded-full relative transition-all ${notifs.bedtimeEnabled ? 'bg-primary' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifs.bedtimeEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Afternoon */}
              <div className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Check-in de tarde</p>
                  <p className="text-xs text-muted-foreground">Para {partnerName || 'cuando llegan'} al llegar a casa</p>
                </div>
                <input
                  type="time"
                  value={notifs.afternoonTime}
                  onChange={e => notifs.setTime('afternoonTime', e.target.value)}
                  className="bg-muted rounded-lg px-2 py-1 text-sm mr-2 text-foreground"
                />
                <button
                  onClick={() => notifs.toggle('afternoonEnabled')}
                  className={`w-11 h-6 rounded-full relative transition-all duration-200 ${notifs.afternoonEnabled ? 'bg-primary' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${notifs.afternoonEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Habit reminder */}
              <div className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Hábitos pendientes</p>
                  <p className="text-xs text-muted-foreground">Avisa si quedaron hábitos sin completar</p>
                </div>
                <input
                  type="time"
                  value={notifs.habitReminderTime}
                  onChange={e => notifs.setTime('habitReminderTime', e.target.value)}
                  className="bg-muted rounded-lg px-2 py-1 text-sm mr-2 text-foreground"
                />
                <button
                  onClick={() => notifs.toggle('habitReminderEnabled')}
                  className={`w-11 h-6 rounded-full relative transition-all duration-200 ${notifs.habitReminderEnabled ? 'bg-primary' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${notifs.habitReminderEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Color theme picker */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
            Color del app
          </p>
          <div className="grid grid-cols-5 gap-3">
            {THEME_COLORS.map(c => {
              const isSelected = primaryKey === c.key
              return (
                <button
                  key={c.key}
                  onClick={() => setPrimary(c.key)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200
                      ${isSelected ? 'scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-background' : 'scale-100 group-active:scale-95'}`}
                    style={{ background: `hsl(${c.primary})` }}
                  >
                    {isSelected && (
                      <Check size={18} strokeWidth={3} style={{ color: `hsl(${c.fg})` }} className="animate-check-pop" />
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center leading-tight">{c.label}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Backup / restore */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-5 pt-4 pb-2">
            Respaldo
          </p>
          <button
            onClick={exportData}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left transition-colors active:bg-muted"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Download size={18} className="text-sky-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Exportar datos</p>
              <p className="text-xs text-muted-foreground">
                {lastBackupAt
                  ? `Último: ${new Date(lastBackupAt).toLocaleDateString('es')}`
                  : 'Descarga un JSON con todo'}
              </p>
            </div>
          </button>
          <div className="h-px bg-border mx-5" />
          <button
            onClick={importData}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left transition-colors active:bg-muted"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Upload size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Importar datos</p>
              <p className="text-xs text-muted-foreground">Restaura desde un backup JSON</p>
            </div>
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-5 pt-4 pb-2">
            Zona peligrosa
          </p>
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-left transition-colors active:bg-muted"
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Trash2 size={18} className="text-destructive" />
            </div>
            <div>
              <p className="font-medium text-sm text-destructive">Borrar todos los datos</p>
              <p className="text-xs text-muted-foreground">Elimina hábitos e historial</p>
            </div>
          </button>
        </div>

        {/* App info */}
        <div className="text-center text-xs text-muted-foreground py-4 space-y-1">
          <p className="font-semibold text-sm">Hábitos Mamocitos 🔥</p>
          <p>v0.1.0 · 100% offline · tus datos no salen del iPhone</p>
        </div>
      </main>

      {/* Confirm reset dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5">
          <div className="absolute inset-0 bg-black/60 animate-fade-bd" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-sm my-auto animate-scale-in">
            <h3 className="font-bold text-lg mb-2">¿Borrar todo?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Se eliminarán todos los hábitos y registros. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={resetAll}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold active:scale-95 transition-transform"
              >
                Borrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
