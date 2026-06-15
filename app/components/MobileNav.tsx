'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Notificacion {
  id: string
  tipo: 'vencido' | 'hoy'
  titulo: string
  cliente: string
  fecha: string
}

export default function MobileNav() {
  const pathname = usePathname()
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    cargarNotifs()
  }, [])

  const cargarNotifs = async () => {
    const hoy = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('followups')
      .select('id, titulo, fecha, clientes(nombre)')
      .eq('hecho', false)
      .lte('fecha', hoy)
      .order('fecha', { ascending: true })
    if (!data) return
    setNotifs(data.map((f: any) => ({
      id: f.id,
      tipo: f.fecha < hoy ? 'vencido' : 'hoy',
      titulo: f.titulo,
      cliente: f.clientes?.nombre || 'Cliente',
      fecha: f.fecha,
    })))
  }

  const marcarHecho = async (id: string) => {
    await supabase.from('followups').update({ hecho: true }).eq('id', id)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Mi Empresa', href: '/dashboard/constructoras', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Calendario', href: '/dashboard/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Perfil', href: '/dashboard/perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ]

  return (
    <>
      {/* Panel de notificaciones */}
      {showPanel && (
        <div className="fixed inset-0 z-[200]" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-16 left-0 right-0 bg-zinc-900 border-t border-zinc-700 rounded-t-2xl max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Notificaciones</h3>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-xs">{notifs.length} pendientes</span>
                <button onClick={() => setShowPanel(false)} className="text-zinc-400 text-xl">✕</button>
              </div>
            </div>
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-zinc-500 text-sm">Sin notificaciones pendientes ✓</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {notifs.filter(n => n.tipo === 'vencido').length > 0 && (
                  <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">⚠ Vencidos</p>
                )}
                {notifs.filter(n => n.tipo === 'vencido').map(n => (
                  <div key={n.id} className="flex items-center gap-3 bg-zinc-800 border-l-2 border-red-500 rounded-r-xl px-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{n.titulo}</p>
                      <p className="text-zinc-400 text-xs">{n.cliente} · <span className="text-red-400">{n.fecha}</span></p>
                    </div>
                    <button onClick={() => marcarHecho(n.id)} className="text-zinc-500 hover:text-green-400 text-lg">✓</button>
                  </div>
                ))}
                {notifs.filter(n => n.tipo === 'hoy').length > 0 && (
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mt-3 mb-2">🕐 Hoy</p>
                )}
                {notifs.filter(n => n.tipo === 'hoy').map(n => (
                  <div key={n.id} className="flex items-center gap-3 bg-zinc-800 border-l-2 border-amber-500 rounded-r-xl px-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{n.titulo}</p>
                      <p className="text-zinc-400 text-xs">{n.cliente} · <span className="text-amber-400">Vence hoy</span></p>
                    </div>
                    <button onClick={() => marcarHecho(n.id)} className="text-zinc-500 hover:text-green-400 text-lg">✓</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 z-[100]">
        <div className="flex justify-around items-center px-1 py-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span className="text-[9px] uppercase tracking-tight font-bold">{item.name}</span>
              </Link>
            )
          })}
          <button onClick={() => setShowPanel(true)} className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all text-gray-500">
            <div className="relative">
              <svg className={`w-5 h-5 ${notifs.length > 0 ? 'text-amber-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifs.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {notifs.length > 9 ? '9+' : notifs.length}
                </span>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-tight font-bold">Alertas</span>
          </button>
        </div>
      </nav>
    </>
  )
}
