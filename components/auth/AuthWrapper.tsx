'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { usePlanningStore } from '@/lib/store/planningStore'
import { toast } from 'sonner'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { hydrate } = usePlanningStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        hydrate(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        hydrate(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [hydrate])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Connexion réussie')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Inscription réussie ! Vous êtes connecté.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#090d1a] text-slate-400">Chargement...</div>
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090d1a]">
        <div className="w-full max-w-sm rounded-lg border border-[#1a2540] bg-[#0f1629] p-6 shadow-xl">
          <h1 className="mb-6 text-center text-2xl font-bold text-slate-100">Rythma</h1>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border border-[#1a2540] bg-[#141e35] px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded border border-[#1a2540] bg-[#141e35] px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isLogin ? 'Se connecter' : 'Créer un compte'}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-400 hover:underline"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
