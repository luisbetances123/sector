'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  GitFork, 
  Calendar, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Propiedades', href: '/dashboard/properties', icon: Building2 },
    { name: 'Pipeline', href: '/dashboard/pipeline', icon: GitFork },
    { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-white antialiased selection:bg-[#CCFF00] selection:text-black">
      
      <header className="md:hidden w-full border-b border-zinc-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-base font-black tracking-tighter uppercase">SECTOR</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-[#09090b] z-40 p-6 flex flex-col justify-between animate-fadeIn">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
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
          <div className="border-t border-zinc-900/60 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 rounded-xl w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 border-r border-zinc-900 bg-black/40 backdrop-blur-md flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-lg font-black tracking-tighter uppercase">SECTOR</span>
          </div>
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
        <div className="border-t border-zinc-900/60 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 rounded-xl w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-[calc(100vh-57px)] md:h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}