import { Category, DayOfWeek } from './planning'

export interface WeekStats {
  weekKey: string
  totalTasks: number
  doneTasks: number
  partialTasks: number
  missedTasks: number
  pendingTasks: number
  rate: number
  byCategory: Partial<Record<Category, { total: number; done: number; partial: number; missed: number }>>
  byDay: Partial<Record<DayOfWeek, { total: number; done: number }>>
}

export interface StreakInfo {
  current: number
  best: number
}

export interface ActivityStat {
  taskId: string
  title: string
  doneCount: number
  totalCount: number
  rate: number
}
