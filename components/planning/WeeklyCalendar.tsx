'use client'

import { ScheduleTask } from '@/types/planning'
import { getTasksForWeek, getRecord } from '@/lib/calculations/stats'
import { timeToMinutes, isDayToday, DAY_LABELS, DAYS_OF_WEEK, getWeekDates } from '@/lib/utils/date'
import { ScheduleBlock } from './ScheduleBlock'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Props {
  tasks: ScheduleTask[]
  weekKey: string
}

const START_HOUR = 7
const END_HOUR = 24
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60
const HOUR_PX = 64

function getBlockPosition(startTime: string, endTime: string) {
  const startMin = timeToMinutes(startTime) - START_HOUR * 60
  const endMin = timeToMinutes(endTime === '23:59' ? '24:00' : endTime) - START_HOUR * 60
  const topPct = (startMin / TOTAL_MINUTES) * 100
  const heightPct = ((endMin - startMin) / TOTAL_MINUTES) * 100
  return { topPercent: Math.max(topPct, 0), heightPercent: Math.max(heightPct, 0.5) }
}

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
)

export function WeeklyCalendar({ tasks, weekKey }: Props) {
  const weekTasks = getTasksForWeek(tasks, weekKey)
  const weekDates = getWeekDates(weekKey)
  const totalHeight = TOTAL_MINUTES / 60 * HOUR_PX

  // Heure courante — ligne rouge
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60
  const nowPct = (nowMin / TOTAL_MINUTES) * 100
  const showNowLine = nowMin > 0 && nowMin < TOTAL_MINUTES

  return (
    <div className="flex-1 overflow-auto min-h-0 relative">
      <div className="flex min-w-max">
        {/* Colonne heures (sticky à gauche) */}
        <div className="sticky left-0 z-30 w-14 shrink-0 border-r border-[#1a2540] bg-[#0a0e1a]">
          {/* Header placeholder (sticky en haut et à gauche) */}
          <div className="sticky top-0 z-40 h-10 border-b border-[#1a2540] bg-[#0a0e1a]" />
          {/* Heures */}
          <div className="relative" style={{ height: totalHeight }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: `${((h - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%` }}
              >
                <span className="mt-px text-[9px] font-mono text-slate-600">
                  {String(h).padStart(2, '0')}h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grille des jours */}
        <div className="flex flex-1">
          {DAYS_OF_WEEK.map((day, idx) => {
            const date = weekDates[idx]
            const isToday = isDayToday(day, weekKey)
            const dayTasks = weekTasks.filter(t => t.day === day)

            return (
              <div key={day} className="flex flex-col border-r border-[#1a2540]" style={{ width: 160 }}>
                {/* Header jour (sticky en haut) */}
                <div className={cn(
                  'sticky top-0 z-20 flex h-10 shrink-0 flex-col items-center justify-center border-b border-[#1a2540] px-1 bg-[#0a0e1a]',
                  isToday && 'bg-[#141e35]'
                )}>
                  <span className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider',
                    isToday ? 'text-blue-400' : 'text-slate-500'
                  )}>
                    {DAY_LABELS[day]}
                  </span>
                  <span className={cn(
                    'text-xs font-medium',
                    isToday ? 'text-blue-300' : 'text-slate-400'
                  )}>
                    {format(date, 'd MMM', { locale: fr })}
                    {isToday && (
                      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-400 align-middle" />
                    )}
                  </span>
                </div>

                {/* Colonne avec blocs */}
                <div
                  className="relative"
                  style={{ height: totalHeight, backgroundImage: 'repeating-linear-gradient(to bottom, #1a2540 0px, #1a2540 1px, transparent 1px, transparent 64px)' }}
                >
                  {/* Ligne heure actuelle */}
                  {isToday && showNowLine && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-10 border-t-2 border-red-500"
                      style={{ top: `${nowPct}%` }}
                    >
                      <div className="absolute -left-1 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </div>
                  )}

                  {/* Blocs de tâches */}
                  {dayTasks.map(task => {
                    const { topPercent, heightPercent } = getBlockPosition(
                      task.startTime,
                      task.endTime
                    )
                    return (
                      <ScheduleBlock
                        key={task.id}
                        task={task}
                        weekKey={weekKey}
                        topPercent={topPercent}
                        heightPercent={heightPercent}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
