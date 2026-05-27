'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Definimos de forma estricta las rutas que NO deben llevar menús de la app
  const isLanding = pathname === '/landing' || pathname === '/'
  const isLoginOrRegister = pathname.startsWith('/login') || pathname.startsWith('/register')

  // Si es la pantalla de Login o Registro, dejamos la página 100% limpia 
  // para que el iPhone no colapse intentando cargar menús del CRM
  if (isLoginOrRegister) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen max-w-[100vw] overflow-x-hidden bg-black">
      {/* Solo mostramos la barra lateral en PC si no es el landing */}
      {!isLanding && <Sidebar />}
      
      <main className={`flex-1 min-w-0 bg-[#050505] min-h-screen ${!isLanding ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </main>
      
      {/* Solo mostramos el menú móvil abajo en celulares si no es el landing */}
      {!isLanding && <MobileNav />}
    </div>
  )
}