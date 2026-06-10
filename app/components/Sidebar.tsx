'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/clients', label: 'Clientes' },
  { href: '/dashboard/properties', label: 'Propiedades' },
  { href: '/dashboard/pipeline', label: 'Pipeline' },
  { href: '/dashboard/calendar', label: 'Calendario' },
  { href: '/dashboard/reports', label: 'Reportes' },
  { href: '/dashboard/reminders', label: 'Recordatorios' },
  { href: '/dashboard/usuarios', label: 'Usuarios' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="hidden md:flex w-56 bg-zinc-950 border-r border-zinc-800 flex-col h-screen p-4 sticky top-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
        <span className="text-white font-black text-lg tracking-tighter">SEC<span className="text-[#CCFF00]">TOR</span></span>
      </div>
      <nav className="flex flex-col space-y-1 flex-1">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={"block px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all " +
              (pathname === item.href || pathname?.startsWith(item.href + '/')
                ? 'bg-[#CCFF00] text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900')}>
            {item.label}
          </Link>
        ))}
      </nav>
      <button onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-all text-xs font-bold uppercase tracking-wider mt-auto">
        ← Cerrar sesión
      </button>
    </div>
  )
}
