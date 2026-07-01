'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  BarChart2,
  LogOut,
  Menu,
  X,
  HardHat,
  UserCircle,
  TrendingUp
} from 'lucide-react'
import NotificationBell from '@/app/components/NotificationBell'
import MobileNav from '@/app/components/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAutorizado(true)
      } else {
        router.push('/login')
      }
      setChecking(false)
    })
  }, [router])

  if (checking || !autorizado) return <div className="min-h-screen bg-[#09090b]" />

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mi Empresa', href: '/dashboard/constructoras', icon: HardHat },
{ name: 'Brokers', href: '/dashboard/brokers', icon: Users },
{ name: 'Finanzas', href: '/dashboard/finanzas', icon: BarChart2 },
  { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart2 },
    { name: 'Inbox', href: '/dashboard/inbox', icon: Building2 },
    { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Calculadora', href: '/dashboard/calculadora', icon: TrendingUp },
    { name: 'Mercado', href: '/dashboard/mercado', icon: TrendingUp },
    { name: 'Recordatorios', href: '/dashboard/reminders', icon: Calendar },
    { name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCircle },
    { name: 'Precios', href: '/dashboard/precios', icon: TrendingUp },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-white antialiased selection:bg-[#CCFF00] selection:text-black">
      
      <header className="md:hidden w-full border-b border-zinc-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard"><Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '28px', width: 'auto' }} /></Link>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:text-white transition-colors"
            aria-label="Abrir menú"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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
                      : 'text-white hover:text-white hover:bg-zinc-900/40'
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
          <div className="flex items-center justify-between px-2">
            <Link href="/dashboard"><Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '32px', width: 'auto' }} /></Link>
            <NotificationBell />
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
                      : 'text-white hover:text-white hover:bg-zinc-900/40'
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

      <MobileNav />

    </div>
  )
}// deploy Tue Jun 16 04:55:56 UTC 2026
// reconnect Tue Jun 16 13:53:23 UTC 2026
