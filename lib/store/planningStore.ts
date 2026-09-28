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
  syncFromSupabase
} from '@/lib/storage'
import { getWeekKey, nextWeekKey, prevWeekKey } from '@/lib/utils/date'
import { calculateWeekStats } from '@/lib/calculations/stats'
import { WeekStats } from '@/types/tracking'
import { CATEGORY_COLORS } from '@/lib/utils/categories'
import { supabase } from '@/lib/supabase'

interface PlanningStore {
  userId: string | null
  tasks: ScheduleTask[]
  records: TaskRecord[]
  notes: Note[]
  reminders: Reminder[]
  preferences: UserPreferences
  hydrated: boolean
  currentWeekStats: WeekStats | null

  hydrate: (userId: string) => Promise<void>
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

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  userId: null,
  tasks: [],
  records: [],
  notes: [],
  reminders: [],
  preferences: { currentWeekKey: getWeekKey(), startHour: 7, endHour: 24, firstDayOfWeek: 1 },
  hydrated: false,
  currentWeekStats: null,

  hydrate: async (userId) => {
    initStorage()
    try {
      await syncFromSupabase(userId)
    } catch (e) {
      console.error('Failed to sync from Supabase', e)
    }
    
    const tasks = getTasks()
    const records = getRecords()
    const notes = getNotes()
    const reminders = getReminders()
    const preferences = getPreferences()
    const currentWeekStats = calculateWeekStats(tasks, records, preferences.currentWeekKey)
    
    set({ userId, tasks, records, notes, reminders, preferences, hydrated: true, currentWeekStats })
  },

  refreshStats: () => {
    const { tasks, records, preferences } = get()
    set({ currentWeekStats: calculateWeekStats(tasks, records, preferences.currentWeekKey) })
  },

  setTaskStatus: async (taskId, status, note) => {
    const { records, preferences, userId, tasks } = get()
    const weekKey = preferences.currentWeekKey
    const existing = records.findIndex(r => r.taskId === taskId && r.weekKey === weekKey)
    const record: TaskRecord = { taskId, weekKey, status, note, validatedAt: new Date().toISOString() }
    
    const newRecords = existing >= 0 ? records.map((r, i) => i === existing ? record : r) : [...records, record]
    saveRecords(newRecords)
    set({ records: newRecords, currentWeekStats: calculateWeekStats(tasks, newRecords, weekKey) })

    if (userId) {
      await supabase.from('records').upsert({
        task_id: taskId, user_id: userId, week_key: weekKey, status, note, validated_at: record.validatedAt
      })
    }
  },

  addTask: async (taskData) => {
    const { userId, tasks } = get()
    const task: ScheduleTask = {
      ...taskData,
      id: crypto.randomUUID(),
      color: taskData.color || CATEGORY_COLORS[taskData.category],
    }
    const newTasks = [...tasks, task]
    saveTasks(newTasks)
    set({ tasks: newTasks })
    get().refreshStats()

    if (userId) {
      await supabase.from('tasks').insert({
        id: task.id, user_id: userId, title: task.title, subtitle: task.subtitle,
        category: task.category, day: task.day, start_time: task.startTime, end_time: task.endTime,
        description: task.description, color: task.color, week_key: task.weekKey,
        recurring_type: task.recurring?.type, recurring_days: task.recurring?.days
      })
    }
  },

  updateTask: async (id, updates) => {
    const { userId, tasks } = get()
    const newTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    saveTasks(newTasks)
    set({ tasks: newTasks })
    get().refreshStats()

    if (userId) {
      const task = newTasks.find(t => t.id === id)
      if (task) {
        await supabase.from('tasks').update({
          title: task.title, subtitle: task.subtitle, category: task.category, day: task.day,
          start_time: task.startTime, end_time: task.endTime, description: task.description,
          color: task.color, week_key: task.weekKey, recurring_type: task.recurring?.type, recurring_days: task.recurring?.days
        }).eq('id', id)
      }
    }
  },

  deleteTask: async (id) => {
    const { userId, tasks, records } = get()
    const newTasks = tasks.filter(t => t.id !== id)
    const newRecords = records.filter(r => r.taskId !== id)
    saveTasks(newTasks)
    saveRecords(newRecords)
    set({ tasks: newTasks, records: newRecords })
    get().refreshStats()

    if (userId) {
      await supabase.from('tasks').delete().eq('id', id)
    }
  },

  navigateWeek: async (direction) => {
    const { preferences, userId, tasks, records } = get()
    let newWeekKey = direction === 'today' ? getWeekKey() : direction === 'next' ? nextWeekKey(preferences.currentWeekKey) : prevWeekKey(preferences.currentWeekKey)
    
    const newPrefs = { ...preferences, currentWeekKey: newWeekKey }
    savePreferences(newPrefs)
    set({ preferences: newPrefs, currentWeekStats: calculateWeekStats(tasks, records, newWeekKey) })

    if (userId) {
      await supabase.from('preferences').upsert({
        user_id: userId, current_week_key: newWeekKey, start_hour: newPrefs.startHour,
        end_hour: newPrefs.endHour, first_day_of_week: newPrefs.firstDayOfWeek
      })
    }
  },

  addNote: async (title, content) => {
    const { userId, notes } = get()
    const newNote: Note = { id: crypto.randomUUID(), title, content, updatedAt: new Date().toISOString() }
    const newNotes = [newNote, ...notes]
    saveNotes(newNotes)
    set({ notes: newNotes })

    if (userId) {
      await supabase.from('notes').insert({
        id: newNote.id, user_id: userId, title, content, updated_at: newNote.updatedAt
      })
    }
  },

  updateNote: async (id, title, content) => {
    const { userId, notes } = get()
    const updatedAt = new Date().toISOString()
    const newNotes = notes.map(n => n.id === id ? { ...n, title, content, updatedAt } : n)
    saveNotes(newNotes)
    set({ notes: newNotes })

    if (userId) {
      await supabase.from('notes').update({ title, content, updated_at: updatedAt }).eq('id', id)
    }
  },

  deleteNote: async (id) => {
    const { userId, notes } = get()
    const newNotes = notes.filter(n => n.id !== id)
    saveNotes(newNotes)
    set({ notes: newNotes })

    if (userId) {
      await supabase.from('notes').delete().eq('id', id)
    }
  },

  toggleReminder: async (id) => {
    const { userId, reminders } = get()
    const newReminders = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r)
    saveReminders(newReminders)
    set({ reminders: newReminders })

    if (userId) {
      const rem = newReminders.find(r => r.id === id)
      if (rem) {
        await supabase.from('reminders').update({ done: rem.done }).eq('id', id)
      }
    }
  },

  addReminder: async (text) => {
    const { userId, reminders } = get()
    const reminder: Reminder = { id: crypto.randomUUID(), text, done: false, date: new Date().toISOString().split('T')[0] }
    const newReminders = [...reminders, reminder]
    saveReminders(newReminders)
    set({ reminders: newReminders })

    if (userId) {
      await supabase.from('reminders').insert({
        id: reminder.id, user_id: userId, text, done: false, date: reminder.date
      })
    }
  },
}))
