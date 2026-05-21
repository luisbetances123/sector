'use client'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  const publicRoutes = ['/login', '/register', '/landing', '/listings']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  const isLanding = pathname === '/landing' || pathname === '/'

  useEffect(() => {
    if (isPublic) {
      setChecking(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else setChecking(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.push('/login')
    })
    return () => listener.subscription.unsubscribe()
  }, [pathname])

  if (!isPublic && checking) return (
    <div className="bg-black flex items-center justify-center min-h-screen">
      <p className="text-amber-500 font-black text-xl animate-pulse">HOMVI</p>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {!isLanding && !isPublic && <Sidebar />}
      <main className={`flex-1 bg-[#050505] min-h-screen ${!isLanding && !isPublic ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {!isLanding && !isPublic && <MobileNav />}
    </div>
  )
}