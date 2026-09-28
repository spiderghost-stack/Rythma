'use client'

import { useEffect } from 'react'
import { usePlanningStore } from '@/lib/store/planningStore'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = usePlanningStore(s => s.hydrate)
  const hydrated = usePlanningStore(s => s.hydrated)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090d1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Chargement du planning...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
