import { useState } from 'react'
import { Plus, ArchiveRestore, Trash2, Pencil } from 'lucide-react'
import { useHabitsStore } from '@/store/habitsStore'
import { useLogsStore } from '@/store/logsStore'
import { HabitForm } from '@/components/HabitForm'
import { getColor } from '@/lib/colors'
import type { Habit } from '@/types'

type Sheet = { type: 'create' } | { type: 'edit'; habit: Habit } | null

export function HabitsPage() {
  const { habits, addHabit, updateHabit, archiveHabit, restoreHabit, deleteHabit } = useHabitsStore()
  const { deleteLogsForHabit } = useLogsStore()
  const [sheet, setSheet] = useState<Sheet>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const active   = habits.filter(h => !h.archivedAt).sort((a, b) => a.order - b.order)
  const archived = habits.filter(h =>  h.archivedAt)

  const handleSave = (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    if (sheet?.type === 'edit') {
      updateHabit(sheet.habit.id, data)
    } else {
      addHabit(data)
    }
    setSheet(null)
  }

  const handleDelete = (id: string) => {
    deleteLogsForHabit(id)
    deleteHabit(id)
    setConfirmDelete(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-5 pt-safe pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <button
          onClick={() => setSheet({ type: 'create' })}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
        >
          <Plus size={18} />
          Nuevo
        </button>
      </header>

      <main className="flex-1 px-4 pb-32 space-y-3">
        {active.length === 0 && archived.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center">
            <span className="text-5xl">🌱</span>
            <p className="text-muted-foreground text-sm">Aún no tienes hábitos</p>
            <button
              onClick={() => setSheet({ type: 'create' })}
              className="mt-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Crear tu primer hábito
            </button>
          </div>
        )}

        {active.map(habit => {
          const color = getColor(habit.color)
          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card"
            >
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl text-2xl ${color.light}`}>
                {habit.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{habit.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {habit.frequency === 'daily' && 'Todos los días'}
                  {habit.frequency === 'weekdays' && 'Lun–Vie'}
                  {habit.frequency === 'weekends' && 'Sáb–Dom'}
                  {habit.frequency === 'custom' && `${habit.customDays?.length ?? 0} días/semana`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSheet({ type: 'edit', habit })}
                  className="p-2 rounded-xl text-muted-foreground transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => archiveHabit(habit.id)}
                  className="p-2 rounded-xl text-muted-foreground transition-colors"
                >
                  <ArchiveRestore size={18} />
                </button>
              </div>
            </div>
          )
        })}

        {archived.length > 0 && (
          <section>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-1 mt-6 mb-3">
              Archivados
            </p>
            {archived.map(habit => {
              const color = getColor(habit.color)
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card opacity-50 mb-3"
                >
                  <div className={`flex items-center justify-center w-11 h-11 rounded-xl text-2xl ${color.light}`}>
                    {habit.emoji}
                  </div>
                  <p className="flex-1 font-semibold truncate line-through">{habit.name}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => restoreHabit(habit.id)}
                      className="p-2 rounded-xl text-muted-foreground"
                    >
                      <ArchiveRestore size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(habit.id)}
                      className="p-2 rounded-xl text-destructive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </section>
        )}
      </main>

      {/* Slide-up sheet for create/edit */}
      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSheet(null)}
          />
          <div className="relative bg-background rounded-t-3xl border-t border-border min-h-[85dvh] max-h-[95dvh] flex flex-col safe-bottom">
            <div className="mx-auto w-10 h-1 bg-border rounded-full mt-3 mb-1" />
            <HabitForm
              initial={sheet.type === 'edit' ? sheet.habit : undefined}
              onSave={handleSave}
              onCancel={() => setSheet(null)}
            />
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-2">¿Eliminar hábito?</h3>
            <p className="text-muted-foreground text-sm mb-6">Esto también borrará todo el historial. No se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
