'use client'

import { WeekStats } from '@/types/tracking'

interface Props {
  stats: WeekStats
}

export function GlobalProgress({ stats }: Props) {
  const { totalTasks, doneTasks, pendingTasks, rate } = stats
  const circumference = 2 * Math.PI * 36 // r=36
  const strokeDash = (rate / 100) * circumference

  return (
    <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Progression globale
      </p>

      <div className="flex items-center gap-4">
        {/* Cercle SVG */}
        <div className="relative shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            {/* Track */}
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="#1a2540"
              strokeWidth="6"
            />
            {/* Progress */}
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke={rate >= 80 ? '#22c55e' : rate >= 50 ? '#3b82f6' : '#f97316'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-100">{rate}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Réalisées</span>
            <span className="font-mono font-semibold text-green-400">{doneTasks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Total</span>
            <span className="font-mono text-slate-300">{totalTasks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Restantes</span>
            <span className="font-mono text-orange-400">{pendingTasks}</span>
          </div>
        </div>
      </div>

      {/* Barre bas */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#1a2540]">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${rate}%`, transition: 'width 0.5s ease' }}
        />
      </div>
      <p className="mt-1.5 text-center text-[10px] text-slate-600">
        {doneTasks} / {totalTasks} tâches réalisées
      </p>
    </div>
  )
}
