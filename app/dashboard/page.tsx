'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SECTORES = ['Piantini','Naco','Bella Vista','Evaristo Morales','Serralles','Los Cacicazgos','Arroyo Hondo','Viejo Arroyo Hondo','La Esperilla','El Millon','Mirador Norte','Mirador Sur']

export default function Dashboard() {
  const [clientes, setClientes] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [c, p, f] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('properties').select('*'),
        supabase.from('followups').select('*'),
      ])
      if (c.data) setClientes(c.data)
      if (p.data) setProperties(p.data)
      if (f.data) setFollowups(f.data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const hoyStr = new Date().toISOString().split('T')[0]
  const followupsHoy = followups.filter(f => f.fecha === hoyStr && !f.hecho)
  const followupsPendientes = followups.filter(f => !f.hecho).length
  const propiedadesDisponibles = properties.filter(p => p.estado === 'disponible').length
  const leads = clientes.filter(c => c.etapa === 'Lead')
  const clientesActivos = clientes.filter(c => c.etapa === 'Buscando' || c.etapa === 'En Oferta')

  const etapaColor: Record<string, string> = {
    'Lead': 'bg-zinc-700 text-zinc-300',
    'Buscando': 'bg-blue-900 text-blue-300',
    'En Oferta': 'bg-amber-900 text-amber-300',
    'Cierre': 'bg-green-900 text-green-300',
  }
  const etapaBarColor: Record<string, string> = {
    'Lead': 'bg-zinc-500',
    'Buscando': 'bg-blue-500',
    'En Oferta': 'bg-amber-500',
    'Cierre': 'bg-green-500',
  }
  const tipoIcono: Record<string, string> = {
    llamada: '📞', visita: '🏠', documento: '📄', otro: '📌'
  }
  const clientesPorEtapa = ['Lead','Buscando','En Oferta','Cierre'].map(e => ({
    etapa: e, total: clientes.filter(c => c.etapa === e).length
  }))
  const maxEtapa = Math.max(...clientesPorEtapa.map(e => e.total), 1)

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <p className="text-amber-500 font-black text-xl animate-pulse">HOMVI</p>
    </div>
  )

  const LeadsSection = () => (
    <div className="bg-red-950 border-2 border-red-700 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔴</span>
          <span className="text-red-300 font-black text-sm uppercase tracking-wider">Leads sin responder</span>
          {leads.length > 0 && (
            <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
              {leads.length}
            </span>
          )}
        </div>
        <Link href="/clients" className="text-red-400 text-xs hover:text-white transition-colors uppercase tracking-wider font-bold">
          Ver todos →
        </Link>
      </div>
      {leads.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-3">✅ Sin leads pendientes</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {leads.slice(0, 6).map(c => (
            <div key={c.id} className="flex items-center justify-between bg-red-900/30 border border-red-800/30 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm">
                  {c.nombre?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{c.nombre}</p>
                  <p className="text-zinc-400 text-[10px]">{c.telefono || c.email}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {c.telefono && (
                  <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors">
                    💬
                  </a>
                )}
                {c.telefono && (
                  <a href={`tel:${c.telefono}`}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors">
                    📞
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {leads.length > 6 && (
        <Link href="/clients" className="block text-center text-red-400 text-xs mt-3 hover:text-white transition-colors">
          Ver {leads.length - 6} leads más →
        </Link>
      )}
    </div>
  )

  const AgendaHoy = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-white font-black text-sm uppercase tracking-wider">Agenda de hoy</span>
          {followupsHoy.length > 0 && (
            <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
              {followupsHoy.length}
            </span>
          )}
        </div>
        <Link href="/calendar" className="text-amber-500 text-xs hover:text-white transition-colors uppercase tracking-wider font-bold">
          Ver agenda →
        </Link>
      </div>
      {followupsHoy.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-3">Sin eventos para hoy</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {followupsHoy.map(f => (
            <div key={f.id} className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2.5">
              <span className="text-xl">{tipoIcono[f.tipo] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{f.titulo}</p>
                <p className="text-amber-400 text-[10px] font-mono">{f.hora}</p>
              </div>
              <Link href="/calendar" className="shrink-0 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-amber-500 hover:text-black transition-all">
                Ver
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const SectoresWidget = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span>🏘️</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider">Buscar por sector</h3>
        </div>
        <Link href="/properties" className="text-amber-500 text-xs hover:text-white transition-colors uppercase tracking-wider font-bold">
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {SECTORES.map(s => (
          <Link key={s} href={`/properties?sector=${encodeURIComponent(s)}`}
            className="bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-center py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all">
            {s}
          </Link>
        ))}
      </div>
    </div>
  )

  const ActividadReciente = () => {
    const actividades = [
      ...leads.slice(0, 2).map(c => ({
        id: 'lead-' + c.id, icon: '🟠', texto: `Nuevo lead: ${c.nombre}`, tiempo: 'hoy', color: 'text-amber-400'
      })),
      ...followupsHoy.slice(0, 2).map(f => ({
        id: 'fu-' + f.id, icon: '📞', texto: `Follow-up: ${f.titulo}`, tiempo: f.hora, color: 'text-blue-400'
      })),
      ...properties.filter(p => p.estado === 'disponible').slice(0, 2).map(p => ({
        id: 'prop-' + p.id, icon: '🏠', texto: `Propiedad disponible: ${p.title}`, tiempo: 'activa', color: 'text-green-400'
      })),
    ].slice(0, 5)

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span>⚡</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider">Actividad reciente</h3>
        </div>
        {actividades.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-3">Sin actividad reciente</p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800">
            {actividades.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                <span className="text-base">{a.icon}</span>
                <p className={`text-xs font-medium flex-1 ${a.color}`}>{a.texto}</p>
                <span className="text-zinc-600 text-[10px] uppercase">{a.tiempo}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-4xl font-black text-white">
          Hola, <span className="text-amber-500 italic">Luis</span> 👋
        </h1>
        <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">
          {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Clientes', value: clientes.length, color: 'text-white', href: '/clients' },
          { label: 'Leads', value: leads.length, color: leads.length > 0 ? 'text-red-400' : 'text-white', href: '/clients' },
          { label: 'Propiedades', value: propiedadesDisponibles, color: 'text-green-400', href: '/properties' },
          { label: 'Seguimientos', value: followupsPendientes, color: followupsPendientes > 0 ? 'text-amber-400' : 'text-white', href: '/calendar' },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-600 transition-colors">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* 1. Leads — más dominante */}
      <LeadsSection />

      {/* 2. Agenda de hoy */}
      <AgendaHoy />

      {/* 3. Seguimientos + Clientes activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Clientes activos</h3>
            </div>
            <Link href="/pipeline" className="text-amber-500 text-xs font-bold uppercase">Ver →</Link>
          </div>
          {clientesActivos.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-3">Sin clientes activos</p>
          ) : (
            <div className="flex flex-col gap-2">
              {clientesActivos.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-xs">
                      {c.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">{c.nombre}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${etapaColor[c.etapa] || 'bg-zinc-700 text-zinc-300'}`}>
                        {c.etapa}
                      </span>
                    </div>
                  </div>
                  {c.telefono && (
                    <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                      className="bg-green-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold">
                      💬
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span>📊</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Pipeline</h3>
          </div>
          <div className="flex flex-col gap-3">
            {clientesPorEtapa.map(e => (
              <div key={e.etapa}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400 text-xs uppercase tracking-wide">{e.etapa}</span>
                  <span className="text-white font-black text-sm">{e.total}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${etapaBarColor[e.etapa]}`}
                    style={{ width: `${(e.total / maxEtapa) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/pipeline" className="block text-center text-amber-500 text-xs mt-4 font-bold uppercase hover:text-white transition-colors">
            Ver pipeline completo →
          </Link>
        </div>
      </div>

      {/* 4. Actividad reciente */}
      <ActividadReciente />

      {/* 5. Sectores — más abajo */}
      <SectoresWidget />

      {/* Acciones rápidas desktop */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/clients" className="px-5 py-2.5 bg-amber-500 text-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white transition-all">
            + Nuevo cliente
          </Link>
          <Link href="/properties" className="px-5 py-2.5 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">
            + Nueva propiedad
          </Link>
          <Link href="/calendar" className="px-5 py-2.5 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">
            + Nuevo evento
          </Link>
          <Link href="/pipeline" className="px-5 py-2.5 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">
            Ver pipeline
          </Link>
        </div>
      </div>

      {/* Botón flotante + Nuevo Lead */}
      <Link href="/clients"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 bg-amber-500 hover:bg-white text-black px-5 py-3 rounded-2xl font-black text-sm uppercase shadow-2xl shadow-amber-500/30 transition-all flex items-center gap-2">
        <span className="text-lg">+</span>
        <span>Nuevo Lead</span>
      </Link>
    </div>
  )
}