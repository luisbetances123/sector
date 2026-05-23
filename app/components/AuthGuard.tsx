'use client'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { supabase } from '../lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const publicRoutes = ['/login', '/register', '/landing', '/listings']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  const isLanding = pathname === '/landing' || pathname === '/'

  return (
    <div className="flex min-h-screen max-w-[100vw] overflow-x-hidden">
      {!isLanding && !isPublic && <Sidebar />}
      <main className={`flex-1 min-w-0 bg-[#050505] min-h-screen ${!isLanding && !isPublic ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {!isLanding && !isPublic && <MobileNav />}
    </div>
  )
}