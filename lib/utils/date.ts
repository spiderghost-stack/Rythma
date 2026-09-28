import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  getISOWeek,
  getYear,
  parseISO,
  isToday,
  isBefore,
  isAfter,
  parse,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { DayOfWeek } from '@/types/planning'

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  lundi:    'Lun.',
  mardi:    'Mar.',
  mercredi: 'Mer.',
  jeudi:    'Jeu.',
  vendredi: 'Ven.',
  samedi:   'Sam.',
  dimanche: 'Dim.',
}

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  lundi:    'Lundi',
  mardi:    'Mardi',
  mercredi: 'Mercredi',
  jeudi:    'Jeudi',
  vendredi: 'Vendredi',
  samedi:   'Samedi',
  dimanche: 'Dimanche',
}

/** Retourne la clé de semaine ISO : "2026-W40" */
export function getWeekKey(date: Date = new Date()): string {
  const week = getISOWeek(date)
  const year = getYear(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Retourne la Date du lundi de la semaine ISO donnée */
export function getWeekStart(weekKey: string): Date {
  const [year, weekPart] = weekKey.split('-W')
  const jan4 = new Date(Number(year), 0, 4)
  const startOfYear = startOfWeek(jan4, { weekStartsOn: 1 })
  return addWeeks(startOfYear, Number(weekPart) - 1)
}

/** Retourne les 7 dates (lun→dim) d'une semaine */
export function getWeekDates(weekKey: string): Date[] {
  const monday = getWeekStart(weekKey)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/** Semaine suivante */
export function nextWeekKey(weekKey: string): string {
  return getWeekKey(addWeeks(getWeekStart(weekKey), 1))
}

/** Semaine précédente */
export function prevWeekKey(weekKey: string): string {
  return getWeekKey(subWeeks(getWeekStart(weekKey), 1))
}

/** Affichage : "28 sept. 2026 → 4 oct. 2026" */
export function formatWeekRange(weekKey: string): string {
  const dates = getWeekDates(weekKey)
  const start = format(dates[0], 'd MMM yyyy', { locale: fr })
  const end   = format(dates[6], 'd MMM yyyy', { locale: fr })
  return `${start} → ${end}`
}

/** Retourne le DayOfWeek (0=lundi…6=dimanche) d'une date */
export function dateToDayOfWeek(date: Date): DayOfWeek {
  const idx = (date.getDay() + 6) % 7 // 0=lundi
  return DAYS_OF_WEEK[idx]
}

/** Convertit "HH:MM" en minutes depuis minuit */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Vérifie si un créneau "HH:MM" est passé (comparé à maintenant) */
export function isTimePast(day: DayOfWeek, endTime: string, weekKey: string): boolean {
  const dates = getWeekDates(weekKey)
  const dayIdx = DAYS_OF_WEEK.indexOf(day)
  const taskDate = new Date(dates[dayIdx])
  const [h, m] = endTime.split(':').map(Number)
  taskDate.setHours(h, m, 0, 0)
  return isBefore(taskDate, new Date())
}

/** Vérifie si un créneau est en cours */
export function isTimeInProgress(day: DayOfWeek, startTime: string, endTime: string, weekKey: string): boolean {
  const dates = getWeekDates(weekKey)
  const dayIdx = DAYS_OF_WEEK.indexOf(day)
  const now = new Date()

  const start = new Date(dates[dayIdx])
  const [sh, sm] = startTime.split(':').map(Number)
  start.setHours(sh, sm, 0, 0)

  const end = new Date(dates[dayIdx])
  const [eh, em] = endTime.split(':').map(Number)
  end.setHours(eh, em, 0, 0)

  return isAfter(now, start) && isBefore(now, end)
}

export function isDayToday(day: DayOfWeek, weekKey: string): boolean {
  const dates = getWeekDates(weekKey)
  const dayIdx = DAYS_OF_WEEK.indexOf(day)
  return isToday(dates[dayIdx])
}

/** Format date court : "Lun. 28/09" */
export function formatShortDate(date: Date): string {
  return format(date, 'EEE dd/MM', { locale: fr })
}
