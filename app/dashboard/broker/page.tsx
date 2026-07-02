'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { TrendingUp, Home, DollarSign, Clock } from 'lucide-react'

interface UnidadBroker {
  id: string
  numero: string
  estado: string
  precio: number | null
  proyecto_id: string
  reservado_por: string | null
  cliente_nombre: string | null
  fecha_reserva: string | null
  fecha_venta: string | null
  proyecto_nombre?: string
}

export default function BrokerDashboard() {
  const router = useRouter()
  const [unidades, setUnidades] = useState<UnidadBroker[]>([])
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('')

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre, rol')
      .eq('id', user.id)
      .single()

    if (profile?.rol !== 'broker') { router.push('/dashboard'); return }
    setNombre(profile?.nombre || 'Broker')

    const { data: unidadesData } = await supabase
      .from('unidades')
      .select('id, numero, estado, precio, proyecto_id, reservado_por, cliente_nombre, fecha_reserva, fecha_venta')
      .eq('broker_id', user.id)

    const proyectoIds = [...new Set((unidadesData || []).map(u => u.proyecto_id))]
    let proyectoMap: Record<string, string> = {}
    if (proyectoIds.length > 0) {
      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('id, nombre')
        .in('id', proyectoIds)
      proyectoMap = Object.fromEntries((proyectos || []).map(p => [p.id, p.nombre]))
    }

    const unidadesConProyecto = (unidadesData || []).map(u => ({
      ...u,
      proyecto_nombre: proyectoMap[u.proyecto_id] || '—'
    }))

    setUnidades(unidadesConProyecto)
    setLoading(false)
  }

  const reservadas = unidades.filter(u => u.estado === 'reservada')
  const vendidas = unidades.filter(u => u.estado === 'vendida')
  const volumen = vendidas.reduce((s, u) => s + (u.precio || 0), 0)
  const pipeline = reservadas.reduce((s, u) => s + (u.precio || 0), 0)

  if (loading) return <div className="p-8 text-zinc-500 text-sm">Cargando...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen text-zinc-100">
      <div className="mb-8">
        <p className="text-xs text-[#CCFF00] font-mono uppercase tracking-widest mb-1">Mi Panel</p>
        <h1 className="text-3xl font-black tracking-tight text-white">{nombre}</h1>
        <p className="text-sm text-zinc-500 mt-1">Resumen de tu actividad en SECTOR</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-4 h-4 text-[#CCFF00]" />
            <p className="text-xs text-zinc-400 uppercase">Reservadas</p>
          </div>
          <p className="text-3xl font-black text-white">{reservadas.length}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#CCFF00]" />
            <p className="text-xs text-zinc-400 uppercase">Vendidas</p>
          </div>
          <p className="text-3xl font-black text-[#CCFF00]">{vendidas.length}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-zinc-400 uppercase">Volumen</p>
          </div>
          <p className="text-2xl font-black text-amber-400">US$ {volumen.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <p className="text-xs text-zinc-400 uppercase">Pipeline</p>
          </div>
          <p className="text-2xl font-black text-zinc-300">US$ {pipeline.toLocaleString()}</p>
        </div>
      </div>

      {unidades.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tienes unidades asignadas todavía.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4">Mis Unidades</h2>
          <div className="space-y-2">
            {unidades.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="w-12 text-center shrink-0">
                  <span className="text-white font-bold text-sm">{u.numero}</span>
                  <p className="text-zinc-500 text-[10px]">{u.proyecto_nombre}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.estado === 'vendida' ? 'bg-zinc-600/40 text-zinc-400' :
                      u.estado === 'reservada' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-[#CCFF00]/20 text-[#CCFF00]'
                    }`}>{u.estado}</span>
                    {u.precio && <span className="text-xs text-zinc-400">US$ {u.precio.toLocaleString()}</span>}
                  </div>
                  {(u.reservado_por || u.cliente_nombre) && (
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {u.estado === 'reservada' ? `Broker: ${u.reservado_por}` : `Cliente: ${u.cliente_nombre}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
