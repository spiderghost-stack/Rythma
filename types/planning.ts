export type DayOfWeek =
  | 'lundi'
  | 'mardi'
  | 'mercredi'
  | 'jeudi'
  | 'vendredi'
  | 'samedi'
  | 'dimanche'

export type TaskStatus = 'pending' | 'done' | 'partial' | 'missed'

export type Category =
  | 'physique'
  | 'python'
  | 'cybersec'
  | 'espagnol'
  | 'basket'
  | 'repos'
  | 'groupe'
  | 'personnel'

export interface RecurringRule {
  type: 'daily' | 'weekly' | 'custom'
  days?: DayOfWeek[]
}

export interface ScheduleTask {
  id: string
  title: string
  subtitle?: string
  category: Category
  day: DayOfWeek
  startTime: string   // "07:00"
  endTime: string     // "09:50"
  description?: string
  color: string       // hex
  recurring?: RecurringRule
  weekKey?: string    // undefined = toutes les semaines (récurrent)
}

export interface TaskRecord {
  taskId: string
  weekKey: string   // "2026-W40"
  status: TaskStatus
  note?: string
  validatedAt?: string  // ISO date string
}

export interface Reminder {
  id: string
  text: string
  done: boolean
  date: string  // YYYY-MM-DD
}

export interface UserPreferences {
  currentWeekKey: string
  startHour: number   // 7
  endHour: number     // 24
  firstDayOfWeek: 0 | 1  // 0=dimanche, 1=lundi
}

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}
