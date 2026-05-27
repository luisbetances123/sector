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
    async function checkUser() {
      // 1. Obtenemos la sesión actual de forma directa y asíncrona para evitar bucles
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Si no hay sesión y no está en ruta pública, al login obligado
        if (!isPublic && !isLanding) {
          window.location.href = '/login'
        } else {
          setChecking(false)
        }
      } else {
        // Si ya hay sesión e intenta ir a login/landing, al dashboard directo
        if (isLanding || pathname === '/login' || pathname === '/register') {
          window.location.href = '/dashboard'
        } else {
          setChecking(false)
        }
      }
    }

    checkUser()

    // 2. Mantenemos el listener por si el usuario desloguea explícitamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login'
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, isPublic, isLanding])

  if (checking && !isPublic && !isLanding) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <p className="text-amber-500 font-black text-xl animate-pulse tracking-widest">HOMVI</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen max-w-[100vw] overflow-x-hidden bg-black">
      {!isLanding && !isPublic && <Sidebar />}
      <main className={`flex-1 min-w-0 bg-[#050505] min-h-screen ${!isLanding && !isPublic ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </main>
      {!isLanding && !isPublic && <MobileNav />}
    </div>
  )
}