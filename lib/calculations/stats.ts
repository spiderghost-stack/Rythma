import { ScheduleTask, TaskRecord, TaskStatus, DayOfWeek, Category } from '@/types/planning'
import { WeekStats } from '@/types/tracking'
import { DAYS_OF_WEEK } from '@/lib/utils/date'

/** Filtre les tâches récurrentes et spécifiques pour une semaine donnée */
export function getTasksForWeek(tasks: ScheduleTask[], weekKey: string): ScheduleTask[] {
  return tasks.filter(t => !t.weekKey || t.weekKey === weekKey)
}

/** Obtient le record d'une tâche pour une semaine donnée */
export function getRecord(
  records: TaskRecord[],
  taskId: string,
  weekKey: string
): TaskRecord | undefined {
  return records.find(r => r.taskId === taskId && r.weekKey === weekKey)
}

/** Calcule les statistiques globales d'une semaine */
export function calculateWeekStats(
  tasks: ScheduleTask[],
  records: TaskRecord[],
  weekKey: string
): WeekStats {
  const weekTasks = getTasksForWeek(tasks, weekKey)

  let doneTasks = 0
  let partialTasks = 0
  let missedTasks = 0
  let pendingTasks = 0

  const byCategory: WeekStats['byCategory'] = {}
  const byDay: WeekStats['byDay'] = {}

  for (const task of weekTasks) {
    const record = getRecord(records, task.id, weekKey)
    const status: TaskStatus = record?.status ?? 'pending'

    if (status === 'done') doneTasks++
    else if (status === 'partial') partialTasks++
    else if (status === 'missed') missedTasks++
    else pendingTasks++

    // By category
    if (!byCategory[task.category]) {
      byCategory[task.category] = { total: 0, done: 0, partial: 0, missed: 0 }
    }
    byCategory[task.category]!.total++
    if (status === 'done') byCategory[task.category]!.done++
    else if (status === 'partial') byCategory[task.category]!.partial++
    else if (status === 'missed') byCategory[task.category]!.missed++

    // By day
    if (!byDay[task.day]) {
      byDay[task.day] = { total: 0, done: 0 }
    }
    byDay[task.day]!.total++
    if (status === 'done' || status === 'partial') byDay[task.day]!.done++
  }

  const total = weekTasks.length
  const rate = total > 0 ? Math.round((doneTasks / total) * 100) : 0

  return {
    weekKey,
    totalTasks: total,
    doneTasks,
    partialTasks,
    missedTasks,
    pendingTasks,
    rate,
    byCategory,
    byDay,
  }
}

/** Calcule le taux pour une catégorie spécifique */
export function getCategoryRate(
  category: Category,
  tasks: ScheduleTask[],
  records: TaskRecord[],
  weekKey: string
): number {
  const weekTasks = getTasksForWeek(tasks, weekKey).filter(t => t.category === category)
  if (weekTasks.length === 0) return 0
  const done = weekTasks.filter(t => {
    const r = getRecord(records, t.id, weekKey)
    return r?.status === 'done'
  }).length
  return Math.round((done / weekTasks.length) * 100)
}

/** Calcul des objectifs hebdomadaires par catégorie */
export function calculateWeeklyGoals(
  tasks: ScheduleTask[],
  records: TaskRecord[],
  weekKey: string
) {
  const weekTasks = getTasksForWeek(tasks, weekKey)

  const goals = [
    { label: 'Cours + travail PF', categories: ['physique'] as Category[] },
    { label: 'Exercices PF', categories: ['physique'] as Category[], subtitleFilter: 'Exercices' },
    { label: 'Groupe PF', categories: ['groupe'] as Category[] },
    { label: 'Python', categories: ['python'] as Category[] },
    { label: 'Cybersécurité', categories: ['cybersec'] as Category[] },
    { label: 'Espagnol', categories: ['espagnol'] as Category[] },
    { label: 'Basket collectif', categories: ['basket'] as Category[], subtitleFilter: 'Entraînement' },
    { label: 'Basket individuel', categories: ['basket'] as Category[], subtitleFilter: 'Sport' },
  ]

  return goals.map(g => {
    let filtered = weekTasks.filter(t => g.categories.includes(t.category))
    if (g.subtitleFilter) {
      filtered = filtered.filter(t => t.subtitle === g.subtitleFilter)
    } else if (g.label === 'Cours + travail PF') {
      // Cours physique (pas exercices)
      filtered = filtered.filter(t => t.subtitle !== 'Exercices')
    }
    const total = filtered.length
    const done = filtered.filter(t => {
      const r = getRecord(records, t.id, weekKey)
      return r?.status === 'done'
    }).length
    return {
      label: g.label,
      done,
      target: total,
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
    }
  })
}

/** Dernières actions validées */
export function getRecentActions(
  tasks: ScheduleTask[],
  records: TaskRecord[],
  limit = 6
): Array<{ task: ScheduleTask; record: TaskRecord }> {
  const validated = records
    .filter(r => r.status === 'done' || r.status === 'partial')
    .sort((a, b) => {
      const dateA = a.validatedAt ? new Date(a.validatedAt).getTime() : 0
      const dateB = b.validatedAt ? new Date(b.validatedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, limit)

  return validated.flatMap(r => {
    const task = tasks.find(t => t.id === r.taskId)
    return task ? [{ task, record: r }] : []
  })
}
