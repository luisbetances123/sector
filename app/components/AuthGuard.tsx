'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { supabase } from '../lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  const publicRoutes = ['/login', '/register', '/listing']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  const isLanding = pathname === '/landing' || pathname === '/'

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        if (!isPublic && !isLanding) {
          router.push('/login')
        } else {
          setChecking(false)
        }
      } else {
        if (isLanding || pathname === '/login' || pathname === '/register') {
          router.push('/dashboard')
        } else {
          setChecking(false)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  if (checking && !isPublic && !isLanding) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-500 text-sm">Cargando HOMVI...</p>
      </div>
    )
  }

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
