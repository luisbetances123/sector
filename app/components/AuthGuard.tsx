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

  const publicRoutes = ['/login', '/register', '/landing', '/listings']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  const isLanding = pathname === '/landing' || pathname === '/'

  useEffect(() => {
    if (isPublic || isLanding) {
      setChecking(false)
      return
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
      }
      setChecking(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !isPublic && !isLanding) {
        router.replace('/login')
      }
      if (session && (pathname === '/login' || pathname === '/register')) {
        router.replace('/dashboard')
      }
    })
    return () => subscription.unsubscribe()
  }, [pathname])

  if (checking) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Cargando...</div>
    </div>
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
