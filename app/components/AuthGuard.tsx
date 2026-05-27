'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Definimos qué rutas no llevan menú (el landing o la raíz si fuera una presentación)
  const isLanding = pathname === '/landing' || pathname === '/'
  // El login y register ya no se usarán, pero si se entra por error, actúan como rutas públicas
  const publicRoutes = ['/login', '/register', '/listing']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  return (
    <div className="flex min-h-screen max-w-[100vw] overflow-x-hidden bg-black">
      {/* Si no es el landing, mostramos la barra lateral en PC */}
      {!isLanding && <Sidebar />}
      
      <main className={`flex-1 min-w-0 bg-[#050505] min-h-screen ${!isLanding ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </main>
      
      {/* Si no es el landing, mostramos el menú de botones abajo en el celular */}
      {!isLanding && <MobileNav />}
    </div>
  )
}