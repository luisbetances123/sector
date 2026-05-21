'use client'
import './globals.css'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const publicRoutes = ['/login', '/register', '/landing', '/listings']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isPublic) {
        router.push('/login')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !isPublic) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  if (loading && !isPublic) return (
    <html lang="es">
      <body className="bg-black text-white flex items-center justify-center min-h-screen">
        <p className="text-zinc-500 text-sm uppercase tracking-widest animate-pulse">Cargando...</p>
      </body>
    </html>
  )

  return (
    <html lang="es">
      <body className="bg-black antialiased text-white overflow-x-hidden">
        <div className="flex min-h-screen">
          {!isPublic && <Sidebar />}
          <main className={`flex-1 bg-[#050505] min-h-screen ${!isPublic ? 'pb-16 md:pb-0' : ''}`}>
            {children}
          </main>
        </div>
        {!isPublic && <MobileNav />}
      </body>
    </html>
  )
}
