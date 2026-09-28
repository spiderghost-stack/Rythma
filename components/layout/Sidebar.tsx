'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Calendar, BarChart2, Target, FileText, Settings,
  Zap, CheckCircle2, Circle, XCircle,
} from 'lucide-react'
import { usePlanningStore } from '@/lib/store/planningStore'
import { calculateWeeklyGoals, getTasksForWeek } from '@/lib/calculations/stats'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/planning', label: 'Planning',   icon: Calendar   },
  { href: '/suivi',    label: 'Suivi',      icon: BarChart2  },
  { href: '/objectifs',label: 'Objectifs',  icon: Target     },
  { href: '/notes',    label: 'Notes',      icon: FileText   },
  { href: '/parametres',label: 'Paramètres',icon: Settings   },
]

const SUMMARY_ITEMS = [
  { label: 'Cours PF',       categories: ['physique'], filter: (s: string) => s !== 'Exercices' },
  { label: 'Groupe PF',      categories: ['groupe'],   filter: null },
  { label: 'Python',         categories: ['python'],   filter: null },
  { label: 'Cybersécurité',  categories: ['cybersec'], filter: null },
  { label: 'Espagnol',       categories: ['espagnol'], filter: null },
  { label: 'Basket',         categories: ['basket'],   filter: null },
]

export function Sidebar() {
  const pathname = usePathname()
  const { tasks, records, preferences } = usePlanningStore()
  const weekKey = preferences.currentWeekKey
  const weekTasks = getTasksForWeek(tasks, weekKey)

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#1a2540] bg-[#0a0e1a]">
      {/* Header */}
      <div className="border-b border-[#1a2540] px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-sm font-bold text-transparent">
              SpiderGhost
            </p>
            <p className="text-[10px] text-slate-500">Physique Fondamentale</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'border-l-2 border-blue-500 bg-blue-500/10 pl-[10px] text-blue-400 font-medium'
                      : 'text-slate-400 hover:bg-[#141e35] hover:text-slate-200'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue-400' : 'text-slate-500')} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Résumé de la semaine */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Ma semaine
          </p>
          <div className="rounded-lg border border-[#1a2540] bg-[#0f1629] p-3">
            <ul className="space-y-1.5">
              {SUMMARY_ITEMS.map((item) => {
                const itemTasks = weekTasks.filter(t =>
                  item.categories.includes(t.category) &&
                  (item.filter ? item.filter(t.subtitle ?? '') : true)
                )
                const done = itemTasks.filter(t => {
                  const r = records.find(r => r.taskId === t.id && r.weekKey === weekKey)
                  return r?.status === 'done'
                }).length
                const total = itemTasks.length
                const allDone = total > 0 && done === total
                const noneDone = done === 0

                return (
                  <li key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'text-[11px] font-mono',
                        allDone ? 'text-green-400' : noneDone ? 'text-slate-600' : 'text-orange-400'
                      )}>
                        {done}/{total}
                      </span>
                      {allDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                      ) : noneDone ? (
                        <Circle className="h-3.5 w-3.5 text-slate-600" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-orange-400 border-r-transparent" />
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1a2540] px-5 py-3">
        <p className="text-[10px] text-slate-600">
          Discipline aujourd&apos;hui, liberté demain.
        </p>
      </div>
    </aside>
  )
}
