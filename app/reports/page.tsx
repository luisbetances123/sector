'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ReportsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [c, p, f] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('properties').select('*'),
        supabase.from('followups').select('*'),
      ])
      if (c.data) setClients(c.data)
      if (p.data) setProperties(p.data)
      if (f.data) setFollowups(f.data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <div className="p-8 text-zinc-500">Cargando reportes...</div>

  const clientesPorEtapa = ['LEAD','BUSCANDO','EN OFERTA','CIERRE'].map(e => ({ etapa: e, total: clients.filter(c => c.status === e).length }))
  const propiedadesPorEstado = ['DISPONIBLE','RESERVADA','VENDIDA'].map(e => ({ estado: e, total: properties.filter(p => p.status === e).length }))
  const propiedadesPorTipo = [...new Set(properties.map(p => p.type))].map(t => ({ tipo: t, total: properties.filter(p => p.type === t).length }))
  const followupsPendientes = followups.filter(f => !f.hecho).length
  const followupsHechos = followups.filter(f => f.hecho).length
  const followupsPorTipo = ['llamada','visita','documento','otro'].map(t => ({ tipo: t, total: followups.filter(f => f.tipo === t).length }))
  const progreso = followups.length > 0 ? Math.round((followupsHechos / followups.length) * 100) : 0

  const etapaColors: Record<string, string> = {
    LEAD: 'bg-zinc-700', BUSCANDO: 'bg-blue-700', 'EN OFERTA': 'bg-amber-600', CIERRE: 'bg-green-600'
  }
  const estadoColors: Record<string, string> = {
    DISPONIBLE: 'bg-green-600', RESERVADA: 'bg-amber-600', VENDIDA: 'bg-zinc-600'
  }
  const tipoColors: Record<string, string> = {
    llamada: 'bg-blue-600', visita: 'bg-purple-600', documento: 'bg-green-600', otro: 'bg-zinc-600'
  }

  const maxClientes = Math.max(...clientesPorEtapa.map(e => e.total), 1)
  const maxFollowups = Math.max(...followupsPorTipo.map(t => t.total), 1)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">REPORTES</h1>
        <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Resumen general de HOMVI</p>
      </div>

      {/* STATS PRINCIPALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clientes', value: clients.length, color: 'text-amber-500' },
          { label: 'Propiedades', value: properties.length, color: 'text-blue-400' },
          { label: 'Follow-ups', value: followups.length, color: 'text-purple-400' },
          { label: 'Completados', value: followupsHechos, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* CLIENTES POR ETAPA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-5">Clientes por etapa</h2>
          <div className="flex flex-col gap-3">
            {clientesPorEtapa.map(e => (
              <div key={e.etapa}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400 text-xs uppercase tracking-wide">{e.etapa}</span>
                  <span className="text-white font-black text-sm">{e.total}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${etapaColors[e.etapa]}`} style={{ width: `${(e.total / maxClientes) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROPIEDADES POR ESTADO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-5">Propiedades por estado</h2>
          <div className="flex flex-col gap-4">
            {propiedadesPorEstado.map(e => (
              <div key={e.estado} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${estadoColors[e.estado]}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-zinc-400 text-xs uppercase tracking-wide">{e.estado}</span>
                    <span className="text-white font-black text-sm">{e.total}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${estadoColors[e.estado]}`} style={{ width: `${properties.length > 0 ? (e.total / properties.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Por tipo</h3>
            <div className="flex flex-wrap gap-2">
              {propiedadesPorTipo.map(t => (
                <span key={t.tipo} className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full font-bold">
                  {t.tipo} <span className="text-amber-500">{t.total}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FOLLOW-UPS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-5">Follow-ups</h2>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400 text-xs uppercase tracking-wide">Progreso general</span>
              <span className="text-amber-500 font-black text-sm">{progreso}%</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progreso}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-zinc-500 text-xs">{followupsPendientes} pendientes</span>
              <span className="text-green-400 text-xs">{followupsHechos} completados</span>
            </div>
          </div>
          <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3 mt-5">Por tipo</h3>
          <div className="flex flex-col gap-3">
            {followupsPorTipo.map(t => (
              <div key={t.tipo}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400 text-xs uppercase tracking-wide">{t.tipo}</span>
                  <span className="text-white font-black text-sm">{t.total}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${tipoColors[t.tipo]}`} style={{ width: `${(t.total / maxFollowups) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RESUMEN GENERAL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-5">Resumen ejecutivo</h2>
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Pipeline activo</p>
              <p className="text-white font-bold text-lg">{clients.filter(c => c.status !== 'CIERRE').length} clientes en proceso</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Propiedades disponibles</p>
              <p className="text-white font-bold text-lg">{properties.filter(p => p.status === 'DISPONIBLE').length} de {properties.length} unidades</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Tasa de completado</p>
              <p className="text-white font-bold text-lg">{progreso}% de follow-ups resueltos</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Clientes en cierre</p>
              <p className="text-green-400 font-bold text-lg">{clients.filter(c => c.status === 'CIERRE').length} negocio(s) cerrado(s)</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
