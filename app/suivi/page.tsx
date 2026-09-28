'use client'

import { usePlanningStore } from '@/lib/store/planningStore'
import { calculateWeekStats } from '@/lib/calculations/stats'
import { CATEGORY_LABELS } from '@/lib/utils/categories'
import { DAY_FULL_LABELS, DAYS_OF_WEEK } from '@/lib/utils/date'

export default function SuiviPage() {
  const { tasks, records, preferences } = usePlanningStore()
  const weekKey = preferences.currentWeekKey
  const stats = calculateWeekStats(tasks, records, weekKey)

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-100">Statistiques de la semaine</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Résumé */}
        <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Aperçu général</h2>
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold text-blue-400">{stats.rate}%</div>
            <div className="pb-1 text-sm text-slate-500">de taux de respect</div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded border border-[#1a2540] bg-[#141e35] p-3 text-center">
              <div className="text-xl font-mono text-green-400">{stats.doneTasks}</div>
              <div className="text-xs text-slate-500">Tâches réalisées</div>
            </div>
            <div className="rounded border border-[#1a2540] bg-[#141e35] p-3 text-center">
              <div className="text-xl font-mono text-red-400">{stats.missedTasks}</div>
              <div className="text-xs text-slate-500">Tâches manquées</div>
            </div>
          </div>
        </div>

        {/* Taux par catégorie */}
        <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Par catégorie</h2>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([cat, data]) => {
              const rate = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0
              return (
                <div key={cat}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}</span>
                    <span className="font-mono text-slate-500">{rate}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1a2540]">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Taux par jour */}
        <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-300">Taux de réalisation par jour</h2>
          <div className="flex h-40 items-end gap-2">
            {DAYS_OF_WEEK.map(day => {
              const data = stats.byDay[day]
              const rate = data && data.total > 0 ? Math.round((data.done / data.total) * 100) : 0
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center rounded bg-[#141e35]">
                    <div 
                      className="w-full rounded bg-blue-500 transition-all" 
                      style={{ height: `${rate}%`, minHeight: rate > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-[10px] uppercase text-slate-500">{DAY_FULL_LABELS[day].slice(0, 3)}</span>
                  <span className="text-[10px] font-mono text-slate-400">{rate}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
