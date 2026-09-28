'use client'

import { useState } from 'react'
import { usePlanningStore } from '@/lib/store/planningStore'
import { INITIAL_TASKS } from '@/data/initialPlanning'
import { saveTasks, saveRecords, saveNotes, saveReminders } from '@/lib/storage'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ParametresPage() {
  const { userId, tasks, records, notes, reminders, hydrate } = usePlanningStore()

  const [confirmStats, setConfirmStats] = useState(false)
  const [confirmFactory, setConfirmFactory] = useState(false)

  function handleExport() {
    const data = { tasks, records, notes, reminders }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mon-planning-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Données exportées avec succès')
  }

  function executeResetStats() {
    saveRecords([])
    if (userId) hydrate(userId)
    toast.success('Statistiques réinitialisées.')
  }

  function executeFactoryReset() {
    saveTasks(INITIAL_TASKS)
    saveRecords([])
    saveNotes([])
    saveReminders([])
    if (userId) hydrate(userId)
    toast.success('Application réinitialisée à son état initial.')
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-8 text-xl font-semibold text-slate-100">Paramètres</h1>

      <div className="max-w-2xl space-y-6">
        
        {/* Export */}
        <section className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-200">Export des données</h2>
          <p className="mb-4 text-xs text-slate-500">
            Téléchargez une sauvegarde de tout votre planning, notes et statistiques au format JSON.
          </p>
          <button
            onClick={handleExport}
            className="rounded bg-[#141e35] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#1e2d4a] transition-colors"
          >
            Exporter les données
          </button>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-red-900/30 bg-red-950/10 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-400">
            <AlertCircle className="h-4 w-4" />
            Zone de danger
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-red-900/20 pb-4">
              <div>
                <h3 className="text-xs font-medium text-slate-300">Réinitialiser les statuts</h3>
                <p className="text-[10px] text-slate-500">Efface l&apos;historique des tâches réalisées.</p>
              </div>
              <button
                onClick={() => setConfirmStats(true)}
                className="rounded border border-red-900/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Réinitialiser
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-slate-300">Remise à zéro d&apos;usine</h3>
                <p className="text-[10px] text-slate-500">Restaure le planning initial par défaut. Irréversible.</p>
              </div>
              <button
                onClick={() => setConfirmFactory(true)}
                className="rounded bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-800/40 transition-colors"
              >
                Tout effacer
              </button>
            </div>
          </div>
        </section>

      </div>

      <AlertDialog open={confirmStats} onOpenChange={setConfirmStats}>
        <AlertDialogContent className="border-[#1a2540] bg-[#0f1629] text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les statistiques ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Voulez-vous vraiment effacer tous les statuts et recommencer à zéro ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1a2540] bg-transparent text-slate-300 hover:bg-[#141e35] hover:text-slate-100">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeResetStats} className="bg-red-600 text-white hover:bg-red-700">
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFactory} onOpenChange={setConfirmFactory}>
        <AlertDialogContent className="border-red-900/50 bg-[#0f1629] text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">ATTENTION : Remise à zéro totale</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Voulez-vous vraiment tout effacer et remettre le planning initial par défaut ? Vos notes et rappels seront perdus. Action irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1a2540] bg-transparent text-slate-300 hover:bg-[#141e35] hover:text-slate-100">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeFactoryReset} className="bg-red-600 text-white hover:bg-red-700">
              Tout effacer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
