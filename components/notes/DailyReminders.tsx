'use client'

import { useState } from 'react'
import { usePlanningStore } from '@/lib/store/planningStore'
import { cn } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'

export function DailyReminders() {
  const { reminders, toggleReminder, addReminder } = usePlanningStore()
  const today = new Date().toISOString().split('T')[0]
  const todayReminders = reminders.filter(r => r.date === today)
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')

  function handleAdd() {
    if (!newText.trim()) return
    addReminder(newText.trim())
    setNewText('')
    setAdding(false)
  }

  return (
    <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Rappels du jour
        </p>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded p-0.5 text-slate-600 hover:text-blue-400 transition-colors"
          title="Ajouter un rappel"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {adding && (
        <div className="mb-2 flex gap-1">
          <input
            autoFocus
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Nouveau rappel..."
            className="flex-1 rounded border border-[#1a2540] bg-[#141e35] px-2 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500"
          >
            OK
          </button>
        </div>
      )}

      <ul className="space-y-1.5">
        {todayReminders.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => toggleReminder(r.id)}
              className="flex w-full items-start gap-2 text-left"
            >
              <div className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                r.done
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-[#2a3a55] bg-transparent'
              )}>
                {r.done && <Check className="h-2.5 w-2.5 text-green-400" />}
              </div>
              <span className={cn(
                'text-xs leading-relaxed',
                r.done ? 'text-slate-600 line-through' : 'text-slate-400'
              )}>
                {r.text}
              </span>
            </button>
          </li>
        ))}
        {todayReminders.length === 0 && (
          <p className="text-xs text-slate-600">Aucun rappel pour aujourd&apos;hui.</p>
        )}
      </ul>
    </div>
  )
}
