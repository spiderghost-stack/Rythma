'use client'

import { useState } from 'react'
import { ScheduleTask, Category, DayOfWeek } from '@/types/planning'
import { usePlanningStore } from '@/lib/store/planningStore'
import { CATEGORY_COLORS, CATEGORY_LABELS, ALL_CATEGORIES } from '@/lib/utils/categories'
import { DAYS_OF_WEEK, DAY_FULL_LABELS } from '@/lib/utils/date'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  task: ScheduleTask
  onClose: () => void
}

export function EditTaskDialog({ task, onClose }: Props) {
  const { updateTask } = usePlanningStore()

  const [title, setTitle] = useState(task.title)
  const [subtitle, setSubtitle] = useState(task.subtitle ?? '')
  const [category, setCategory] = useState<Category>(task.category)
  const [day, setDay] = useState<DayOfWeek>(task.day)
  const [startTime, setStartTime] = useState(task.startTime)
  const [endTime, setEndTime] = useState(task.endTime)
  const [description, setDescription] = useState(task.description ?? '')
  const [error, setError] = useState('')

  function handleSave() {
    if (!title.trim()) { setError('Le titre est requis'); return }
    if (startTime >= endTime) { setError("L'heure de fin doit être après l'heure de début"); return }

    updateTask(task.id, {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      day,
      startTime,
      endTime,
      description: description.trim() || undefined,
      color: CATEGORY_COLORS[category],
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md border-[#1a2540] bg-[#0f1629] text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-sm">Modifier l&apos;activité</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {error && <p className="text-xs text-red-400">{error}</p>}

          <Field label="Titre *">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-base"
            />
          </Field>

          <Field label="Sous-titre / Type">
            <input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="ex: Cours, Exercices..."
              className="input-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              <select value={category} onChange={e => setCategory(e.target.value as Category)} className="input-base">
                {ALL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </Field>
            <Field label="Jour">
              <select value={day} onChange={e => setDay(e.target.value as DayOfWeek)} className="input-base">
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d}>{DAY_FULL_LABELS[d]}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Début">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-base" />
            </Field>
            <Field label="Fin">
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-base" />
            </Field>
          </div>

          <Field label="Description (optionnel)">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded border border-[#1a2540] py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded bg-blue-600 py-1.5 text-xs text-white hover:bg-blue-500 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  )
}
