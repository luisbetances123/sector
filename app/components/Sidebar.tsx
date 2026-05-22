'use client'
import React from 'react'
import NotificationBell from './NotificationBell'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { LogOut } from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="hidden md:flex w-56 bg-zinc-950 border-r border-zinc-800 flex-col h-screen p-4 sticky top-0">
      <div className="flex items-center justify-between mb-8 px-2">
        <span className="text-amber-500 font-bold text-xl">HOMVI</span>
        <NotificationBell />
      </div>
      <nav className="flex flex-col space-y-1 flex-1">
        <Link href="/dashboard" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Dashboard</Link>
        <Link href="/hoy" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Hoy</Link>
        <Link href="/clients" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Clientes</Link>
        <Link href="/properties" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Propiedades</Link>
        <Link href="/pipeline" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Pipeline</Link>
        <Link href="/calendar" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Calendario</Link>
        <Link href="/reports" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Reportes</Link>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 p-2 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-all text-sm font-medium mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
    </div>
  )
}