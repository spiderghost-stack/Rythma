import { Category } from './planning'

export interface Goal {
  id: string
  title: string
  description?: string
  target: number
  current: number
  unit: string
  deadline?: string
  category: Category
  status: 'active' | 'completed' | 'paused'
}

export interface WeeklyGoalProgress {
  label: string
  category: Category
  done: number
  target: number
  rate: number
}
