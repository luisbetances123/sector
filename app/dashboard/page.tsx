'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
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

  const hoyStr = new Date().toISOString().split('T')[0]
  const followupsHoy = followups.filter(f => f.fecha === hoyStr && !f.hecho)
  const followupsPendientes = followups.filter(f => !f.hecho).length
  const propiedadesDisponibles = properties.filter(p => p.status === 'DISPONIBLE').length

  const etapaColor: Record<string, string> = {
    LEAD: 'bg-zinc-700 text-zinc-300',
    BUSCANDO: 'bg-blue-900 text-blue-300',
    'EN OFERTA': 'bg-amber-900 text-amber-300',
    CIERRE: 'bg-green-900 text-green-300',
  }
  const etapaBarColor: Record<string, string> = {
    LEAD: 'bg-zinc-500', BUSCANDO: 'bg-blue-500', 'EN OFERTA': 'bg-amber-500', CIERRE: 'bg-green-500'
  }
  const tipoIcono: Record<string, string> = { llamada: '📞', visita: '🏠', documento: '📄', otro: '📌' }

  const clientesPorEtapa = ['LEAD','BUSCANDO','EN OFERTA','CIERRE'].map(e => ({
    etapa: e, total: clients.filter(c => c.status === e).length
  }))
  const maxEtapa = Math.max(...clientesPorEtapa.map(e => e.total), 1)

  if (loading) return <div className="p-8 text-zinc-500">Cargando dashboard...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-tight text-white">Bienvenido, <span className="text-amber-500 italic font-black">Luis</span></h1>
        <p className="text-zinc-400 text-sm mt-2">Este es el estado actual de tu portafolio hoy.</p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Clientes activos</p>
          <h2 className="text-4xl font-black text-amber-500">{clients.length}</h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Propiedades disponibles</p>
          <h2 className="text-4xl font-black text-blue-400">{propiedadesDisponibles} <span className="text-zinc-500 text-lg font-normal">de {properties.length}</span></h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Follow-ups pendientes</p>
          <h2 className="text-4xl font-black text-purple-400">{followupsPendientes}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* PIPELINE */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black uppercase text-sm tracking-wider">Pipeline de clientes</h3>
            <Link href="/pipeline" className="text-amber-500 text-xs hover:text-white transition-colors uppercase tracking-wider">Ver todo →</Link>
          </div>
          {clients.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No hay clientes aún.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {clients.slice(0, 6).map(c => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm">{c.initial || c.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="text-white text-sm font-bold">{c.name}</p>
                      <p className="text-zinc-500 text-xs">{c.type || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${etapaColor[c.status] || 'bg-zinc-800 text-zinc-400'}`}>{c.status}</span>
                    {c.price && <span className="text-amber-500 font-black text-sm">{c.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AGENDA DE HOY */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-black uppercase text-sm tracking-wider">Agenda de hoy</h3>
            <Link href="/calendar" className="text-amber-500 text-xs hover:text-white transition-colors uppercase tracking-wider">Ver →</Link>
          </div>
          {followupsHoy.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">Sin eventos para hoy</p>
          ) : (
            <div className="flex flex-col gap-3">
              {followupsHoy.slice(0, 5).map(f => (
                <div key={f.id} className="flex gap-3 items-start border-b border-zinc-800 pb-3 last:border-0">
                  <span className="text-amber-500 text-xs font-mono w-12 pt-0.5">{f.hora}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{f.titulo}</p>
                    <p className="text-zinc-500 text-xs">{tipoIcono[f.tipo]} {f.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/calendar" className="mt-4 block text-center text-xs text-amber-500 hover:text-white transition-colors uppercase tracking-wider">
            Ver agenda completa →
          </Link>
        </div>
      </div>

      {/* PIPELINE POR ETAPA + PROPIEDADES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-black uppercase text-sm tracking-wider mb-5">Clientes por etapa</h3>
          <div className="flex flex-col gap-4">
            {clientesPorEtapa.map(e => (
              <div key={e.etapa}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400 text-xs uppercase tracking-wide">{e.etapa}</span>
                  <span className="text-white font-black text-sm">{e.total}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${etapaBarColor[e.etapa]}`} style={{ width: `${(e.total / maxEtapa) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-black uppercase text-sm tracking-wider mb-5">Resumen de propiedades</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Total', value: properties.length, color: 'text-white' },
              { label: 'Disponibles', value: propiedadesDisponibles, color: 'text-green-400' },
              { label: 'Reservadas', value: properties.filter(p => p.status === 'RESERVADA').length, color: 'text-amber-400' },
              { label: 'Vendidas', value: properties.filter(p => p.status === 'VENDIDA').length, color: 'text-zinc-400' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-400 text-sm">{s.label}</span>
                <span className={`font-black text-lg ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <Link href="/properties" className="mt-4 block text-center text-xs text-amber-500 hover:text-white transition-colors uppercase tracking-wider">
            Ver propiedades →
          </Link>
        </div>
      </div>

      {/* ACCIONES RAPIDAS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/clients" className="px-6 py-3 bg-amber-500 text-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white transition-all">+ Nuevo cliente</Link>
          <Link href="/properties" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">+ Nueva propiedad</Link>
          <Link href="/calendar" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">+ Nuevo evento</Link>
          <Link href="/pipeline" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">Ver pipeline</Link>
          <Link href="/reports" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">Ver reportes</Link>
        </div>
      </div>
    </div>
  )
}
