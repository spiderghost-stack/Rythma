'use client'

import { useState } from 'react'
import { usePlanningStore } from '@/lib/store/planningStore'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickNotes() {
  const { addNote } = usePlanningStore()
  const router = useRouter()
  
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!content.trim()) return
    addNote('Note rapide', content.trim())
    setSaved(true)
    setContent('')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Note rapide
        </p>
        <button
          onClick={() => router.push('/notes')}
          className="text-[10px] text-blue-400 hover:underline"
        >
          Voir tout
        </button>
      </div>
      
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Une idée à ne pas oublier ?"
        rows={3}
        className="w-full resize-none rounded border border-[#1a2540] bg-[#141e35] px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500 transition-colors"
      />
      <button
        onClick={handleSave}
        disabled={!content.trim()}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#1a2540] bg-[#141e35] py-1.5 text-xs text-slate-400 transition-colors hover:border-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:hover:border-[#1a2540] disabled:hover:text-slate-400"
      >
        <Plus className="h-3 w-3" />
        {saved ? 'Enregistré ✓' : 'Créer la note'}
      </button>
    </div>
  )
}
