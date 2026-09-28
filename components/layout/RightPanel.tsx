'use client'

import { useMemo } from 'react'
import { usePlanningStore } from '@/lib/store/planningStore'
import { calculateWeekStats, calculateWeeklyGoals } from '@/lib/calculations/stats'
import { GlobalProgress } from '@/components/dashboard/GlobalProgress'
import { WeeklyGoals } from '@/components/goals/WeeklyGoals'
import { DailyReminders } from '@/components/notes/DailyReminders'
import { QuickNotes } from '@/components/notes/QuickNotes'

export function RightPanel() {
  const { tasks, records, preferences } = usePlanningStore()
  const weekKey = preferences.currentWeekKey

  const stats = useMemo(
    () => calculateWeekStats(tasks, records, weekKey),
    [tasks, records, weekKey]
  )

  const goals = useMemo(
    () => calculateWeeklyGoals(tasks, records, weekKey),
    [tasks, records, weekKey]
  )

  return (
    <aside className="hidden xl:flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-[#1a2540] bg-[#0a0e1a] p-4">
      <GlobalProgress stats={stats} />
      <WeeklyGoals goals={goals} />
      <DailyReminders />
      <QuickNotes />
    </aside>
  )
}
