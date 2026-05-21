'use client'
import { useEffect, useState, useRef } from 'react'
import { Bell, X, AlertCircle, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Notificacion {
  id: string
  tipo: 'vencido' | 'hoy'
  titulo: string
  cliente: string
  fecha: string
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const cargarNotificaciones = async () => {
    const hoy = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('followups')
      .select('id, titulo, fecha, clientes(nombre)')
      .eq('hecho', false)
      .lte('fecha', hoy)
      .order('fecha', { ascending: true })

    if (!data) return
    const lista: Notificacion[] = data.map((f: any) => ({
      id: f.id,
      tipo: f.fecha < hoy ? 'vencido' : 'hoy',
      titulo: f.titulo,
      cliente: f.clientes?.nombre || 'Cliente',
      fecha: f.fecha,
    }))
    setNotifs(lista)
  }

  const marcarHecho = async (id: string) => {
    await supabase.from('followups').update({ hecho: true }).eq('id', id)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  const vencidos = notifs.filter(n => n.tipo === 'vencido').length
  const hoy = notifs.filter(n => n.tipo === 'hoy').length

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors">
        <Bell size={18} className={notifs.length > 0 ? 'text-amber-500' : 'text-zinc-500'} />
        {notifs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {notifs.length > 9 ? '9+' : notifs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-8 top-0 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Notificaciones</h3>
            <div className="flex items-center gap-3">
              {notifs.length > 0 && (
                <span className="text-zinc-500 text-xs">{notifs.length} pendientes</span>
              )}
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">Sin notificaciones pendientes</p>
              </div>
            ) : (
              <>
                {vencidos > 0 && (
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle size={12} /> Vencidos ({vencidos})
                    </p>
                  </div>
                )}
                {notifs.filter(n => n.tipo === 'vencido').map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-zinc-800 transition-colors border-l-2 border-red-500 ml-4 mb-1 rounded-r-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{n.titulo}</p>
                        <p className="text-zinc-400 text-xs">{n.cliente}</p>
                        <p className="text-red-400 text-xs mt-0.5">{n.fecha}</p>
                      </div>
                      <button onClick={() => marcarHecho(n.id)} className="text-zinc-600 hover:text-green-400 transition-colors flex-shrink-0 mt-0.5">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {hoy > 0 && (
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> Hoy ({hoy})
                    </p>
                  </div>
                )}
                {notifs.filter(n => n.tipo === 'hoy').map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-zinc-800 transition-colors border-l-2 border-amber-500 ml-4 mb-1 rounded-r-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{n.titulo}</p>
                        <p className="text-zinc-400 text-xs">{n.cliente}</p>
                        <p className="text-amber-400 text-xs mt-0.5">Vence hoy</p>
                      </div>
                      <button onClick={() => marcarHecho(n.id)} className="text-zinc-600 hover:text-green-400 transition-colors flex-shrink-0 mt-0.5">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
