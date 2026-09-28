import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { StoreProvider } from '@/components/providers/StoreProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { BottomNav } from '@/components/layout/BottomNav'
import { Toaster } from '@/components/ui/sonner'
import { AuthWrapper } from '@/components/auth/AuthWrapper'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mon Planning — Spiderghost | L3 Physique Fondamentale',
  description: 'Tableau de bord personnel de discipline et de suivi du planning hebdomadaire.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${inter.variable} dark h-full`}>
      <body className="min-h-full bg-[#090d1a] text-slate-200 antialiased">
        <StoreProvider>
          <AuthWrapper>
            <TooltipProvider delay={300}>
              <div className="flex h-screen w-full overflow-hidden flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#090d1a]">
                  {children}
                </main>
                <RightPanel />
                <BottomNav />
              </div>
            </TooltipProvider>
          </AuthWrapper>
        </StoreProvider>
        <Toaster theme="dark" />
      </body>
    </html>
  )
}
