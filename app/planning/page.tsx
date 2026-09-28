'use client'

import { usePlanningStore } from '@/lib/store/planningStore'
import { WeeklyNavigation } from '@/components/planning/WeeklyNavigation'
import { WeeklyCalendar } from '@/components/planning/WeeklyCalendar'
import { AddTaskDialog } from '@/components/planning/AddTaskDialog'

export default function PlanningPage() {
  const { tasks, preferences } = usePlanningStore()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1a2540] bg-[#0a0e1a] px-4 md:px-6 py-3 md:py-4">
        <h1 className="text-lg md:text-xl font-semibold text-slate-100">Planning Hebdomadaire</h1>
        <AddTaskDialog />
      </div>
      <WeeklyNavigation />
      <WeeklyCalendar tasks={tasks} weekKey={preferences.currentWeekKey} />
    </div>
  )
}
