'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Rutas que van sin menús (landing o pantallas de login sueltas)
  const isLanding = pathname === '/landing' || pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isLanding) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen max-w-[100vw] overflow-x-hidden bg-black">
      <Sidebar />
      <main className="flex-1 min-w-0 bg-[#050505] min-h-screen pb-24 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}