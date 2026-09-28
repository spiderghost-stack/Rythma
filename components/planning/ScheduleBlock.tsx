'use client'

import { useState } from 'react'
import { ScheduleTask, TaskStatus } from '@/types/planning'
import { usePlanningStore } from '@/lib/store/planningStore'
import { isTimePast, isTimeInProgress } from '@/lib/utils/date'
import { cn } from '@/lib/utils'
import { Check, Minus, X, ChevronRight } from 'lucide-react'
import { TaskDetailModal } from './TaskDetailModal'

interface Props {
  task: ScheduleTask
  weekKey: string
  topPercent: number
  heightPercent: number
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'border-l-[#1e2d4a]',
  done:    'border-l-green-500',
  partial: 'border-l-yellow-500',
  missed:  'border-l-red-500',
}

export function ScheduleBlock({ task, weekKey, topPercent, heightPercent }: Props) {
  const { records, setTaskStatus } = usePlanningStore()
  const [modalOpen, setModalOpen] = useState(false)

  const record = records.find(r => r.taskId === task.id && r.weekKey === weekKey)
  const status: TaskStatus = record?.status ?? 'pending'
  const isPast = isTimePast(task.day, task.endTime, weekKey)
  const inProgress = isTimeInProgress(task.day, task.startTime, task.endTime, weekKey)

  const isSmall = heightPercent < 4  // < ~40min → compact

  function quickSet(s: TaskStatus, e: React.MouseEvent) {
    e.stopPropagation()
    setTaskStatus(task.id, status === s ? 'pending' : s)
  }

  return (
    <>
      <div
        className={cn(
          'task-block absolute left-0.5 right-0.5 cursor-pointer overflow-hidden rounded-r-md border-l-4',
          'bg-[#0f1629] hover:bg-[#141e35]',
          STATUS_COLORS[status],
          status === 'missed' && 'opacity-50',
          inProgress && 'ring-1 ring-blue-400/50',
        )}
        style={{
          top: `${topPercent}%`,
          height: `${Math.max(heightPercent, 1.5)}%`,
          borderLeftColor: status === 'pending' ? task.color + '80' : undefined,
          backgroundColor: status === 'done'
            ? 'rgba(34,197,94,0.07)'
            : status === 'missed'
            ? 'rgba(239,68,68,0.05)'
            : task.color + '15',
        }}
        onClick={() => setModalOpen(true)}
      >
        {/* Barre colorée de catégorie */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: task.color }}
        />

        <div className="relative ml-1 flex h-full flex-col justify-between px-1.5 py-1">
          {/* Titre */}
          <div className="min-w-0">
            <p className={cn(
              'truncate font-medium text-slate-200 leading-tight',
              isSmall ? 'text-[9px]' : 'text-[10px]'
            )}>
              {task.title}
            </p>
            {!isSmall && task.subtitle && (
              <p className="truncate text-[9px] text-slate-500">{task.subtitle}</p>
            )}
            {!isSmall && (
              <p className="text-[9px] font-mono text-slate-600">
                {task.startTime}–{task.endTime}
              </p>
            )}
          </div>

          {/* Status badges — seulement si assez grand */}
          {heightPercent >= 5 && (
            <div className="flex items-center gap-0.5 mt-auto">
              <button
                onClick={(e) => quickSet('done', e)}
                title="Réalisé"
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded text-[9px] transition-colors',
                  status === 'done'
                    ? 'bg-green-500 text-white'
                    : 'bg-[#1a2540] text-slate-500 hover:bg-green-500/20 hover:text-green-400'
                )}
              >
                <Check className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={(e) => quickSet('partial', e)}
                title="Partiellement réalisé"
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded transition-colors',
                  status === 'partial'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-[#1a2540] text-slate-500 hover:bg-yellow-500/20 hover:text-yellow-400'
                )}
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={(e) => quickSet('missed', e)}
                title="Non réalisé"
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded transition-colors',
                  status === 'missed'
                    ? 'bg-red-500 text-white'
                    : 'bg-[#1a2540] text-slate-500 hover:bg-red-500/20 hover:text-red-400'
                )}
              >
                <X className="h-2.5 w-2.5" />
              </button>

              {/* Badge À valider */}
              {isPast && status === 'pending' && (
                <span className="ml-auto rounded bg-orange-500/20 px-1 py-px text-[8px] text-orange-400">
                  À valider
                </span>
              )}
              {inProgress && (
                <span className="ml-auto rounded bg-blue-500/20 px-1 py-px text-[8px] text-blue-400 animate-pulse">
                  En cours
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <TaskDetailModal
          task={task}
          weekKey={weekKey}
          record={record}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
