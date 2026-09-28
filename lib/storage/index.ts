import { ScheduleTask, TaskRecord, Reminder, UserPreferences, Note } from '@/types/planning'
import { INITIAL_TASKS } from '@/data/initialPlanning'
import { getWeekKey } from '@/lib/utils/date'
import { supabase } from '@/lib/supabase'

const KEYS = {
  TASKS:       'monplanning:tasks',
  RECORDS:     'monplanning:records',
  NOTES:       'monplanning:notes',
  REMINDERS:   'monplanning:reminders',
  PREFERENCES: 'monplanning:preferences',
  VERSION:     'monplanning:version',
} as const

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.error('[storage] Failed to write', key)
  }
}

// ─── Supabase Sync ────────────────────────────────────────────────────────
// This reads from Supabase and overwrites local storage.
export async function syncFromSupabase(userId: string) {
  const [
    { data: prefsData },
    { data: tasksData },
    { data: recordsData },
    { data: notesData },
    { data: remsData }
  ] = await Promise.all([
    supabase.from('preferences').select('*').eq('user_id', userId).single(),
    supabase.from('tasks').select('*').eq('user_id', userId),
    supabase.from('records').select('*').eq('user_id', userId),
    supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('reminders').select('*').eq('user_id', userId)
  ])

  if (prefsData) {
    savePreferences({
      currentWeekKey: prefsData.current_week_key,
      startHour: prefsData.start_hour,
      endHour: prefsData.end_hour,
      firstDayOfWeek: prefsData.first_day_of_week as 0 | 1
    })
  }

  if (tasksData && tasksData.length > 0) {
    saveTasks(tasksData.map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      category: t.category as any,
      day: t.day as any,
      startTime: t.start_time,
      endTime: t.end_time,
      description: t.description,
      color: t.color,
      weekKey: t.week_key,
      recurring: t.recurring_type ? { type: t.recurring_type, days: t.recurring_days } : undefined
    })))
  }

  if (recordsData) {
    saveRecords(recordsData.map(r => ({
      taskId: r.task_id,
      weekKey: r.week_key,
      status: r.status as any,
      note: r.note,
      validatedAt: r.validated_at
    })))
  }

  if (notesData) {
    saveNotes(notesData.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      updatedAt: n.updated_at
    })))
  }

  if (remsData) {
    saveReminders(remsData.map(r => ({
      id: r.id,
      text: r.text,
      done: r.done,
      date: r.date
    })))
  }
}

// ─── Local Getters & Setters ──────────────────────────────────────────────

export function getTasks(): ScheduleTask[] {
  return read(KEYS.TASKS, INITIAL_TASKS)
}
export function saveTasks(tasks: ScheduleTask[]): void {
  write(KEYS.TASKS, tasks)
}

export function getRecords(): TaskRecord[] {
  return read<TaskRecord[]>(KEYS.RECORDS, [])
}
export function saveRecords(records: TaskRecord[]): void {
  write(KEYS.RECORDS, records)
}

export function getNotes(): Note[] {
  const raw = read<unknown>(KEYS.NOTES, [])
  if (typeof raw === 'string') return []
  return Array.isArray(raw) ? raw : []
}
export function saveNotes(notes: Note[]): void {
  write(KEYS.NOTES, notes)
}

export function getReminders(): Reminder[] {
  return read<Reminder[]>(KEYS.REMINDERS, [])
}
export function saveReminders(reminders: Reminder[]): void {
  write(KEYS.REMINDERS, reminders)
}

export function getPreferences(): UserPreferences {
  return read<UserPreferences>(KEYS.PREFERENCES, {
    currentWeekKey: getWeekKey(),
    startHour: 7,
    endHour: 24,
    firstDayOfWeek: 1,
  })
}
export function savePreferences(prefs: UserPreferences): void {
  write(KEYS.PREFERENCES, prefs)
}

export function initStorage(): void {}
