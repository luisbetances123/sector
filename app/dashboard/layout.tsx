'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  GitFork, 
  Calendar, 
  BarChart3, 
  LogOut 
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Propiedades', href: '/dashboard/properties', icon: Building2 },
    { name: 'Pipeline', href: '/dashboard/pipeline', icon: GitFork },
    { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
  ]

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white antialiased selection:bg-[#CCFF00] selection:text-black">
      
      {/* Sidebar Fijo Lateral */}
      <aside className="w-64 border-r border-zinc-900 bg-black/40 backdrop-blur-md flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          
          {/* Logo Premium */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-lg font-black tracking-tighter uppercase">HOMVI</span>
          </div>

          {/* Lista de Navegación */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.15)] font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer del Sidebar / Cerrar Sesión */}
        <div className="border-t border-zinc-900/60 pt-4">
          <button className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 rounded-xl w-full transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenedor Principal del Contenido */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}