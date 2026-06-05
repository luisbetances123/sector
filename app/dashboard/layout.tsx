'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  CheckSquare,
  LogOut, 
  Menu, 
  X, 
  User 
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Obtener el usuario actual (opcional por ahora, para mostrar en el perfil)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? 'Broker Premium')
      } else {
        setUserEmail('broker@homvi.com') // Fallback estético para desarrollo
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Lista oficial de las 7 herramientas de HOMVI con sus respectivas rutas
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Mis Tareas', icon: CheckSquare, href: '/dashboard/today' }, // apunta a la carpeta hoy/
    { name: 'Leads y Contactos', icon: Users, href: '/dashboard/clients' },
    { name: 'Inventario', icon: Building2, href: '/dashboard/properties' },
    { name: 'Pipeline', icon: TrendingUp, href: '/dashboard/pipeline' },
    { name: 'Calendario', icon: Calendar, href: '/dashboard/calendar' },
    { name: 'Métricas', icon: BarChart3, href: '/dashboard/reports' }, // apunta a reports/metricas
  ]

  return (
    <div className="min-h-screen bg-[#110E08] text-white font-sans flex">
      
      {/* ── SIDEBAR PARA ESCRITORIO (FIJO) ───────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#110E08] border-r border-zinc-800/80 flex-shrink-0 fixed h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-black tracking-tighter text-[#CCFF00]">
            HOMVI
          </Link>
          <span className="text-[9px] bg-[#CCFF00]/10 text-[#CCFF00] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
            BETA
          </span>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800'
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-[#CCFF00] transition-colors'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Perfil del Broker de Lujo & Logout */}
        <div className="p-4 border-t border-zinc-800/60 bg-black/20 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#CCFF00] to-white flex items-center justify-center text-black font-black text-xs shadow-md">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-black truncate text-zinc-200">Asesor Elite</p>
              <p className="text-[10px] text-zinc-500 truncate font-mono">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── SIDEBAR RESPONSIVO PARA MÓVILES (OVERLAY) ─────────────────────── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#110E08] border-r border-zinc-800 z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xl font-black tracking-tighter text-[#CCFF00]">HOMVI</span>
          <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive ? 'bg-[#CCFF00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800 bg-black/20">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENEDOR PRINCIPAL DE CONTENIDO ────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Navbar superior móvil */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#110E08] border-b border-zinc-800/80 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white p-1">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-black tracking-tighter text-[#CCFF00]">HOMVI</span>
          <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] font-bold text-xs">
            H
          </div>
        </header>

        {/* Espacio de Renderizado de las Sub-páginas */}
        <main className="flex-1 p-4 md:p-8 relative z-10 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  )
}