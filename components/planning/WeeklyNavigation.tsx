'use client'

import { usePlanningStore } from '@/lib/store/planningStore'
import { formatWeekRange, getWeekKey } from '@/lib/utils/date'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WeeklyNavigation() {
  const { preferences, navigateWeek } = usePlanningStore()
  const { currentWeekKey } = preferences
  const isCurrentWeek = currentWeekKey === getWeekKey()

  return (
    <div className="flex items-center gap-2 md:gap-3 border-b border-[#1a2540] bg-[#0a0e1a] px-3 md:px-6 py-3">
      <button
        onClick={() => navigateWeek('prev')}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#1a2540] text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        title="Semaine précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-300">
          {formatWeekRange(currentWeekKey)}
        </span>
      </div>

      <button
        onClick={() => navigateWeek('next')}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#1a2540] text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        title="Semaine suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => navigateWeek('today')}
          className="ml-2 rounded border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          Aujourd&apos;hui
        </button>
      )}

      <div className="ml-auto">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
          {currentWeekKey}
        </span>
      </div>
    </div>
  )
}
