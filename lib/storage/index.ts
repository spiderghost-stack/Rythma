import { ScheduleTask, TaskRecord, Reminder, UserPreferences, Note } from '@/types/planning'
import { INITIAL_TASKS } from '@/data/initialPlanning'
import { getWeekKey } from '@/lib/utils/date'

const KEYS = {
  TASKS:       'monplanning:tasks',
  RECORDS:     'monplanning:records',
  NOTES:       'monplanning:notes',
  REMINDERS:   'monplanning:reminders',
  PREFERENCES: 'monplanning:preferences',
  VERSION:     'monplanning:version',
} as const

const SCHEMA_VERSION = '1'

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

// ─── Tasks ─────────────────────────────────────────────────────────────────

export function getTasks(): ScheduleTask[] {
  const stored = read<ScheduleTask[] | null>(KEYS.TASKS, null)
  if (!stored) {
    // First load: seed with initial planning
    write(KEYS.TASKS, INITIAL_TASKS)
    return INITIAL_TASKS
  }
  return stored
}

export function saveTasks(tasks: ScheduleTask[]): void {
  write(KEYS.TASKS, tasks)
}

// ─── Records ───────────────────────────────────────────────────────────────

export function getRecords(): TaskRecord[] {
  return read<TaskRecord[]>(KEYS.RECORDS, [])
}

export function saveRecords(records: TaskRecord[]): void {
  write(KEYS.RECORDS, records)
}

// ─── Notes ─────────────────────────────────────────────────────────────────

export function getNotes(): Note[] {
  const raw = read<unknown>(KEYS.NOTES, [])
  if (typeof raw === 'string') {
    const migrated: Note[] = [{
      id: Date.now().toString(),
      title: 'Note rapide',
      content: raw,
      updatedAt: new Date().toISOString()
    }]
    write(KEYS.NOTES, migrated)
    return migrated
  }
  return Array.isArray(raw) ? raw : []
}

export function saveNotes(notes: Note[]): void {
  write(KEYS.NOTES, notes)
}

// ─── Reminders ─────────────────────────────────────────────────────────────

export function getReminders(): Reminder[] {
  const today = new Date().toISOString().split('T')[0]
  const stored = read<Reminder[]>(KEYS.REMINDERS, [])
  // Seed default reminders if none for today
  if (!stored.some(r => r.date === today)) {
    const defaults: Reminder[] = [
      { id: `rem-${today}-1`, text: "Ne pas oublier l'espagnol 10–15 min", done: false, date: today },
      { id: `rem-${today}-2`, text: 'Hydratation', done: false, date: today },
      { id: `rem-${today}-3`, text: 'Dormir avant 00h00', done: false, date: today },
      { id: `rem-${today}-4`, text: 'Rester focus sur la PF', done: false, date: today },
    ]
    const merged = [...stored, ...defaults]
    write(KEYS.REMINDERS, merged)
    return merged
  }
  return stored
}

export function saveReminders(reminders: Reminder[]): void {
  write(KEYS.REMINDERS, reminders)
}

// ─── Preferences ───────────────────────────────────────────────────────────

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

// ─── Init / Migration ──────────────────────────────────────────────────────

export function initStorage(): void {
  if (!isBrowser()) return
  const version = read<string>(KEYS.VERSION, '')
  if (version !== SCHEMA_VERSION) {
    // Future: migrate here
    write(KEYS.VERSION, SCHEMA_VERSION)
  }
}
