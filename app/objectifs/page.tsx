'use client'

import { usePlanningStore } from '@/lib/store/planningStore'
import { calculateWeeklyGoals } from '@/lib/calculations/stats'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ObjectifsPage() {
  const { tasks, records, preferences } = usePlanningStore()
  const weekKey = preferences.currentWeekKey
  const goals = calculateWeeklyGoals(tasks, records, weekKey)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-100">Objectifs & Progression</h1>

      <div className="mb-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
        <h2 className="mb-2 text-lg font-bold text-blue-400">L3 Physique Fondamentale</h2>
        <p className="mb-4 text-sm text-blue-200/70">Objectif académique : ≥ 15/20</p>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-xs text-blue-200/50">Restez discipliné et maintenez le cap sur le planning.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {goals.map((g) => {
          const isDone = g.rate >= 100
          return (
            <div key={g.label} className={cn(
              "rounded-lg border p-5 transition-colors",
              isDone ? "border-green-500/30 bg-green-500/5" : "border-[#1a2540] bg-[#0f1629]"
            )}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-slate-200">{g.label}</h3>
                <span className="font-mono text-sm text-slate-500">{g.done} / {g.target}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1a2540]">
                <div 
                  className={cn("h-full rounded-full", isDone ? "bg-green-500" : "bg-blue-500")}
                  style={{ width: `${g.target > 0 ? (g.done / g.target) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-3 text-right text-xs font-mono text-slate-500">{g.rate}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
