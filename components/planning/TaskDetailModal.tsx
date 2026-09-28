'use client'

import { useState } from 'react'
import { ScheduleTask, TaskRecord, TaskStatus } from '@/types/planning'
import { usePlanningStore } from '@/lib/store/planningStore'
import { CATEGORY_LABELS } from '@/lib/utils/categories'
import { DAY_FULL_LABELS } from '@/lib/utils/date'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Check, Minus, X, Pencil, Trash2 } from 'lucide-react'
import { EditTaskDialog } from './EditTaskDialog'
import { toast } from 'sonner'

interface Props {
  task: ScheduleTask
  weekKey: string
  record: TaskRecord | undefined
  onClose: () => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'done',    label: 'Réalisé',              color: 'green',  icon: <Check className="h-4 w-4" /> },
  { value: 'partial', label: 'Partiellement réalisé', color: 'yellow', icon: <Minus className="h-4 w-4" /> },
  { value: 'missed',  label: 'Non réalisé',           color: 'red',    icon: <X className="h-4 w-4" />    },
]

export function TaskDetailModal({ task, weekKey, record, onClose }: Props) {
  const { setTaskStatus, deleteTask } = usePlanningStore()
  const [note, setNote] = useState(record?.note ?? '')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const status: TaskStatus = record?.status ?? 'pending'

  function handleStatus(s: TaskStatus) {
    setTaskStatus(task.id, status === s ? 'pending' : s, note || undefined)
    toast.success('Statut mis à jour')
  }

  function handleDelete() {
    deleteTask(task.id)
    toast.success('Activité supprimée')
    onClose()
  }

  function handleSaveNote() {
    setTaskStatus(task.id, status, note || undefined)
  }

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md border-[#1a2540] bg-[#0f1629] text-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: task.color }}
              />
              {task.title}
            </DialogTitle>
          </DialogHeader>

          {/* Meta */}
          <div className="space-y-1.5 rounded-lg border border-[#1a2540] bg-[#141e35] px-3 py-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Jour</span>
              <span className="text-slate-300">{DAY_FULL_LABELS[task.day]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Horaire</span>
              <span className="font-mono text-slate-300">{task.startTime} → {task.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Catégorie</span>
              <span className="text-slate-300">{CATEGORY_LABELS[task.category]}</span>
            </div>
            {task.subtitle && (
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-300">{task.subtitle}</span>
              </div>
            )}
          </div>

          {/* Statut */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Statut
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatus(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-all',
                    status === opt.value
                      ? opt.color === 'green'
                        ? 'border-green-500 bg-green-500/15 text-green-400'
                        : opt.color === 'yellow'
                        ? 'border-yellow-500 bg-yellow-500/15 text-yellow-400'
                        : 'border-red-500 bg-red-500/15 text-red-400'
                      : 'border-[#1a2540] bg-[#141e35] text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  )}
                >
                  {opt.icon}
                  <span className="text-[10px] text-center leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Note rapide
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={handleSaveNote}
              placeholder="Observation, difficulté, commentaire..."
              rows={2}
              className="w-full resize-none rounded border border-[#1a2540] bg-[#141e35] px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setEditOpen(true) }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#1a2540] py-1.5 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Modifier
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#1a2540] py-1.5 text-xs text-slate-400 hover:border-red-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Supprimer
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="border-[#1a2540] bg-[#0f1629] text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer &quot;{task.title}&quot; ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Cette action supprimera définitivement cette activité du planning.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1a2540] bg-transparent text-slate-300 hover:bg-[#141e35] hover:text-slate-100">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editOpen && (
        <EditTaskDialog
          task={task}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
