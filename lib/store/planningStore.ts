'use client'

import { create } from 'zustand'
import { ScheduleTask, TaskRecord, TaskStatus, Reminder, UserPreferences, Note } from '@/types/planning'
import {
  getTasks, saveTasks,
  getRecords, saveRecords,
  getNotes, saveNotes,
  getReminders, saveReminders,
  getPreferences, savePreferences,
  initStorage,
} from '@/lib/storage'
import { getWeekKey, nextWeekKey, prevWeekKey } from '@/lib/utils/date'
import { calculateWeekStats, getTasksForWeek, getRecord } from '@/lib/calculations/stats'
import { WeekStats } from '@/types/tracking'
import { CATEGORY_COLORS } from '@/lib/utils/categories'

interface PlanningStore {
  // State
  tasks: ScheduleTask[]
  records: TaskRecord[]
  notes: Note[]
  reminders: Reminder[]
  preferences: UserPreferences
  hydrated: boolean

  // Computed
  currentWeekStats: WeekStats | null

  // Actions
  hydrate: () => void
  setTaskStatus: (taskId: string, status: TaskStatus, note?: string) => void
  addTask: (task: Omit<ScheduleTask, 'id'>) => void
  updateTask: (id: string, updates: Partial<ScheduleTask>) => void
  deleteTask: (id: string) => void
  navigateWeek: (direction: 'prev' | 'next' | 'today') => void
  addNote: (title: string, content: string) => void
  updateNote: (id: string, title: string, content: string) => void
  deleteNote: (id: string) => void
  toggleReminder: (id: string) => void
  addReminder: (text: string) => void
  refreshStats: () => void
}

let taskCounter = 1000

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  tasks: [],
  records: [],
  notes: [],
  reminders: [],
  preferences: {
    currentWeekKey: getWeekKey(),
    startHour: 7,
    endHour: 24,
    firstDayOfWeek: 1,
  },
  hydrated: false,
  currentWeekStats: null,

  hydrate: () => {
    initStorage()
    const tasks = getTasks()
    const records = getRecords()
    const notes = getNotes()
    const reminders = getReminders()
    const preferences = getPreferences()
    const weekKey = preferences.currentWeekKey
    const currentWeekStats = calculateWeekStats(tasks, records, weekKey)
    set({ tasks, records, notes, reminders, preferences, hydrated: true, currentWeekStats })
  },

  refreshStats: () => {
    const { tasks, records, preferences } = get()
    const currentWeekStats = calculateWeekStats(tasks, records, preferences.currentWeekKey)
    set({ currentWeekStats })
  },

  setTaskStatus: (taskId, status, note) => {
    const { records, preferences } = get()
    const weekKey = preferences.currentWeekKey
    const existing = records.findIndex(r => r.taskId === taskId && r.weekKey === weekKey)
    const record: TaskRecord = {
      taskId,
      weekKey,
      status,
      note,
      validatedAt: new Date().toISOString(),
    }
    const newRecords = existing >= 0
      ? records.map((r, i) => (i === existing ? record : r))
      : [...records, record]
    saveRecords(newRecords)
    const currentWeekStats = calculateWeekStats(get().tasks, newRecords, weekKey)
    set({ records: newRecords, currentWeekStats })
  },

  addTask: (taskData) => {
    const task: ScheduleTask = {
      ...taskData,
      id: `task-custom-${++taskCounter}`,
      color: taskData.color || CATEGORY_COLORS[taskData.category],
    }
    const newTasks = [...get().tasks, task]
    saveTasks(newTasks)
    set({ tasks: newTasks })
    get().refreshStats()
  },

  updateTask: (id, updates) => {
    const newTasks = get().tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    saveTasks(newTasks)
    set({ tasks: newTasks })
    get().refreshStats()
  },

  deleteTask: (id) => {
    const newTasks = get().tasks.filter(t => t.id !== id)
    const newRecords = get().records.filter(r => r.taskId !== id)
    saveTasks(newTasks)
    saveRecords(newRecords)
    set({ tasks: newTasks, records: newRecords })
    get().refreshStats()
  },

  navigateWeek: (direction) => {
    const { preferences } = get()
    let newWeekKey: string
    if (direction === 'today') newWeekKey = getWeekKey()
    else if (direction === 'next') newWeekKey = nextWeekKey(preferences.currentWeekKey)
    else newWeekKey = prevWeekKey(preferences.currentWeekKey)

    const newPrefs = { ...preferences, currentWeekKey: newWeekKey }
    savePreferences(newPrefs)
    const currentWeekStats = calculateWeekStats(get().tasks, get().records, newWeekKey)
    set({ preferences: newPrefs, currentWeekStats })
  },

  addNote: (title, content) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content,
      updatedAt: new Date().toISOString(),
    }
    const newNotes = [newNote, ...get().notes]
    saveNotes(newNotes)
    set({ notes: newNotes })
  },

  updateNote: (id, title, content) => {
    const newNotes = get().notes.map(n =>
      n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
    )
    saveNotes(newNotes)
    set({ notes: newNotes })
  },

  deleteNote: (id) => {
    const newNotes = get().notes.filter(n => n.id !== id)
    saveNotes(newNotes)
    set({ notes: newNotes })
  },

  toggleReminder: (id) => {
    const newReminders = get().reminders.map(r =>
      r.id === id ? { ...r, done: !r.done } : r
    )
    saveReminders(newReminders)
    set({ reminders: newReminders })
  },

  addReminder: (text) => {
    const today = new Date().toISOString().split('T')[0]
    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      text,
      done: false,
      date: today,
    }
    const newReminders = [...get().reminders, reminder]
    saveReminders(newReminders)
    set({ reminders: newReminders })
  },
}))
