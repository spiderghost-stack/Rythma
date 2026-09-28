'use client'

import { useState } from 'react'
import { usePlanningStore } from '@/lib/store/planningStore'
import { Note } from '@/types/planning'
import { Plus, Trash2, Calendar, Edit2, X, Check } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = usePlanningStore()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  function handleCreate() {
    addNote('Nouvelle note', '')
    const newNoteId = `note-${Date.now()}` // Approximate, will be set in store
    // To auto-focus the new note, we could just edit the first note (since it's prepended)
    setTimeout(() => {
      const firstNote = usePlanningStore.getState().notes[0]
      if (firstNote) startEditing(firstNote)
    }, 10)
  }

  function startEditing(note: Note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  function saveEdit() {
    if (editingId) {
      updateNote(editingId, editTitle || 'Sans titre', editContent)
      setEditingId(null)
    }
  }

  return (
    <div className="flex h-full flex-col p-6 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">Mes Notes</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-slate-500">
          <p>Aucune note pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {notes.map(note => {
            const isEditing = editingId === note.id

            if (isEditing) {
              return (
                <div key={note.id} className="flex flex-col gap-3 rounded-lg border border-blue-500 bg-[#0f1629] p-4 shadow-lg shadow-blue-500/10">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-200 outline-none placeholder-slate-600"
                    placeholder="Titre de la note"
                    autoFocus
                  />
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="min-h-[150px] resize-none bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600"
                    placeholder="Contenu..."
                  />
                  <div className="mt-auto flex justify-end gap-2 pt-2 border-t border-[#1a2540]">
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded p-1.5 text-slate-500 hover:bg-[#141e35] hover:text-slate-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={saveEdit}
                      className="rounded bg-blue-600/20 p-1.5 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={note.id} className="group relative flex flex-col gap-2 rounded-lg border border-[#1a2540] bg-[#0f1629] p-4 transition-colors hover:border-[#2a3a55]">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">{note.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEditing(note)}
                      className="rounded p-1 text-slate-500 hover:bg-[#141e35] hover:text-blue-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setNoteToDelete(note.id)
                      }}
                      className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <p className="whitespace-pre-wrap text-xs text-slate-400 line-clamp-6">
                  {note.content || <span className="italic text-slate-600">Vide</span>}
                </p>

                <div className="mt-auto pt-3 flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(note.updatedAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!noteToDelete} onOpenChange={(o) => !o && setNoteToDelete(null)}>
        <AlertDialogContent className="border-[#1a2540] bg-[#0f1629] text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1a2540] bg-transparent text-slate-300 hover:bg-[#141e35] hover:text-slate-100">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (noteToDelete) {
                  deleteNote(noteToDelete)
                  toast.success('Note supprimée')
                  setNoteToDelete(null)
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
