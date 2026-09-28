'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, BarChart2, Target, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/planning', label: 'Planning', icon: Calendar },
  { href: '/suivi',    label: 'Suivi',    icon: BarChart2 },
  { href: '/objectifs',label: 'Objectifs',icon: Target },
  { href: '/notes',    label: 'Notes',    icon: FileText },
  { href: '/parametres',label: 'Paramètres',icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden border-t border-[#1a2540] bg-[#0a0e1a] pb-safe">
      <ul className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-full h-full',
                  active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-blue-400' : 'text-slate-500')} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
