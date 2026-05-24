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
  const [contactos, setContactos] = useState<any[]>([])

  useEffect(() => {
    async function fetchAll() {
      const [c, p, f, ct] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('properties').select('*'),
        supabase.from('followups').select('*'),
        supabase.from('contactos_whatsapp').select('*').order('fecha', { ascending: false }),
      ])
      if (c.data) setClientes(c.data)
      if (p.data) setProperties(p.data)
      if (f.data) setFollowups(f.data)
      if (ct.data) setContactos(ct.data)
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
  const sinContactar = clientes.filter(c => {
    if (c.etapa === 'Cierre') return false
    const delCliente = contactos.filter(ct => ct.cliente_id === c.id)
    if (delCliente.length === 0) return true
    const ultimo = delCliente.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
    const dias = (Date.now() - new Date(ultimo.fecha).getTime()) / (1000 * 60 * 60 * 24)
    return dias >= 3
  })
  const clientesPorEtapa = ['Lead','Buscando','En Oferta','Cierre'].map(e => ({
    etapa: e, total: clientes.filter(c => c.etapa === e).length
  }))
  const maxEtapa = Math.max(...clientesPorEtapa.map(e => e.total), 1)
  const tipoIcono: Record<string, string> = { llamada: '📞', visita: '🏠', documento: '📄', otro: '📌' }
  const etapaColor: Record<string, string> = {
    'Lead': 'bg-zinc-700 text-zinc-300',
    'Buscando': 'bg-blue-900/80 text-blue-300',
    'En Oferta': 'bg-amber-900/80 text-amber-300',
    'Cierre': 'bg-green-900/80 text-green-300',
  }
  const etapaBarColor: Record<string, string> = {
    'Lead': 'bg-zinc-500', 'Buscando': 'bg-blue-500',
    'En Oferta': 'bg-amber-500', 'Cierre': 'bg-green-500',
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-amber-500 font-black text-2xl animate-pulse">HOMVI</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 pb-40 overflow-x-hidden w-full">
      <div className="max-w-5xl mx-auto w-full">

        {/* Header */}
        <header className="mb-8">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Hola, <span className="text-amber-500 italic">Luis</span> 👋
          </h1>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { label: 'Clientes', icon: '👥', value: clientes.length, color: 'text-white', href: '/clients' },
            { label: 'Leads', icon: '🔴', value: leads.length, color: leads.length > 0 ? 'text-red-400' : 'text-zinc-400', href: '/clients' },
            { label: 'Propied.', icon: '🏠', value: propiedadesDisponibles, color: 'text-green-400', href: '/properties' },
            { label: 'Seguim.', icon: '📅', value: followupsPendientes, color: followupsPendientes > 0 ? 'text-amber-400' : 'text-zinc-400', href: '/hoy' },
          ].map(s => (
            <Link key={s.label} href={s.href}
              className="bg-zinc-800/60 border border-zinc-700 rounded-2xl px-3 py-3 hover:border-amber-500/50 transition-all">
              <p className="text-zinc-500 text-[9px] uppercase tracking-widest truncate">{s.icon} {s.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
            </Link>
          ))}
        </div>

        {/* ══ 1. LEADS ══ */}
        <section className="mb-6">
          <div className={`rounded-3xl p-6 border-2 ${leads.length > 0 ? 'bg-red-950/80 border-red-700/60' : 'bg-zinc-800/40 border-zinc-700/40'}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-3 h-3 rounded-full shrink-0 ${leads.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className={`font-black text-sm uppercase tracking-wider truncate ${leads.length > 0 ? 'text-red-300' : 'text-zinc-400'}`}>
                  Leads sin responder
                </span>
                <span className={`shrink-0 text-sm font-black px-2.5 py-0.5 rounded-full ${leads.length > 0 ? 'bg-red-600 text-white' : 'bg-zinc-700 text-zinc-400'}`}>
                  {leads.length}
                </span>
              </div>
              <Link href="/clients" className="shrink-0 text-zinc-400 hover:text-amber-400 text-xs uppercase tracking-wider transition-colors font-bold ml-2">
                Ver →
              </Link>
            </div>
            {leads.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">✅ Sin leads pendientes hoy</p>
            ) : (
              <div className="flex flex-col gap-2">
                {leads.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-black/30 border border-red-900/40 rounded-2xl px-4 py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm shrink-0">
                        {c.nombre?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">{c.nombre}</p>
                        <p className="text-zinc-500 text-xs truncate">{c.telefono || c.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {c.telefono && (
                        <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                          className="bg-green-600 hover:bg-green-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors">
                          💬
                        </a>
                      )}
                      {c.telefono && (
                        <a href={`tel:${c.telefono}`}
                          className="bg-zinc-700 hover:bg-zinc-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors">
                          📞
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {leads.length > 5 && (
                  <Link href="/clients" className="text-center text-red-400 text-xs py-2 hover:text-white transition-colors">
                    + {leads.length - 5} leads más
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ══ 2. CLIENTES SIN CONTACTAR ══ */}
        {sinContactar.length > 0 && (
          <section className="mb-6">
            <div className="bg-orange-950/60 border-2 border-orange-700/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-300 font-black text-sm uppercase tracking-wider">
                    Clientes sin contactar
                  </span>
                  <span className="bg-orange-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    {sinContactar.length}
                  </span>
                </div>
                <Link href="/clients" className="text-zinc-500 hover:text-amber-400 text-xs uppercase tracking-wider transition-colors">
                  Ver →
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {sinContactar.slice(0, 4).map((c: any) => {
                  const delCliente = contactos.filter((ct: any) => ct.cliente_id === c.id)
                  const dias = delCliente.length === 0 ? null : Math.floor(
                    (Date.now() - new Date(
                      delCliente.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
                    ).getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div key={c.id} className="flex items-center justify-between bg-black/30 border border-orange-900/40 rounded-2xl px-4 py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm shrink-0">
                          {c.nombre?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-bold truncate">{c.nombre}</p>
                          <p className="text-orange-400 text-xs">
                            {dias === null ? 'Sin contacto registrado' : `${dias} días sin contacto`}
                          </p>
                        </div>
                      </div>
                      {c.telefono && (
                        <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${c.nombre}, te contacto de HOMVI. ¿Tienes un momento?`)}`}
                          target="_blank" rel="noreferrer"
                          className="shrink-0 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-colors">
                          💬
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
              {sinContactar.length > 4 && (
                <Link href="/clients" className="block text-center text-orange-400 text-xs mt-3 hover:text-white transition-colors">
                  + {sinContactar.length - 4} más sin contactar
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ══ 3. AGENDA DE HOY ══ */}
        <section className="mb-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <span className="text-white font-black text-sm uppercase tracking-wider">Agenda de hoy</span>
                {followupsHoy.length > 0 && (
                  <span className="bg-amber-500 text-black text-xs font-black px-2.5 py-0.5 rounded-full">
                    {followupsHoy.length}
                  </span>
                )}
              </div>
              <Link href="/hoy" className="text-zinc-500 hover:text-amber-400 text-xs uppercase tracking-wider transition-colors shrink-0">
                Ver →
              </Link>
            </div>
            {followupsHoy.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">Sin eventos programados para hoy</p>
            ) : (
              <div className="flex flex-col gap-2">
                {followupsHoy.map(f => (
                  <div key={f.id} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-700 rounded-2xl px-4 py-3">
                    <span className="text-xl shrink-0">{tipoIcono[f.tipo] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{f.titulo}</p>
                      <p className="text-amber-400 text-xs font-mono">{f.hora}</p>
                    </div>
                    <Link href="/hoy" className="shrink-0 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black px-3 py-1.5 rounded-xl text-xs font-black transition-all">
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══ 4. CLIENTES ACTIVOS + PIPELINE ══ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span>👥</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Clientes activos</h3>
              </div>
              <Link href="/pipeline" className="text-zinc-500 hover:text-amber-400 text-xs uppercase transition-colors shrink-0">Ver →</Link>
            </div>
            {clientesActivos.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">Sin clientes activos</p>
            ) : (
              <div className="flex flex-col gap-2">
                {clientesActivos.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-zinc-900/60 rounded-2xl px-3 py-2.5 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm shrink-0">
                        {c.nombre?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate">{c.nombre}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${etapaColor[c.etapa] || 'bg-zinc-700 text-zinc-300'}`}>
                          {c.etapa}
                        </span>
                      </div>
                    </div>
                    {c.telefono && (
                      <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                        className="shrink-0 bg-green-700 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-colors">
                        💬
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <span>📊</span>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Pipeline</h3>
            </div>
            <div className="flex flex-col gap-4">
              {clientesPorEtapa.map(e => (
                <div key={e.etapa}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-zinc-400 text-xs uppercase tracking-wide">{e.etapa}</span>
                    <span className="text-white font-black">{e.total}</span>
                  </div>
                  <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${etapaBarColor[e.etapa]}`}
                      style={{ width: `${(e.total / maxEtapa) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/pipeline" className="block text-center text-amber-500 text-xs mt-5 font-bold uppercase hover:text-white transition-colors">
              Ver pipeline completo →
            </Link>
          </div>
        </section>

        {/* ══ 5. ACTIVIDAD RECIENTE ══ */}
        <section className="mb-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <span>⚡</span>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Actividad reciente</h3>
            </div>
            <div className="flex flex-col divide-y divide-zinc-700/50">
              {[
                ...leads.slice(0, 2).map(c => ({
                  id: 'lead-' + c.id, icon: '🟠',
                  texto: `Nuevo lead: ${c.nombre}`,
                  sub: c.telefono || c.email || '',
                  tiempo: 'pendiente', color: 'text-amber-400'
                })),
                ...followupsHoy.slice(0, 2).map(f => ({
                  id: 'fu-' + f.id, icon: '📞',
                  texto: f.titulo,
                  sub: `Follow-up · ${f.hora}`,
                  tiempo: f.hora, color: 'text-blue-400'
                })),
                ...properties.filter(p => p.estado === 'disponible').slice(0, 1).map(p => ({
                  id: 'prop-' + p.id, icon: '🏠',
                  texto: p.title,
                  sub: `${p.sector || p.location || ''} · disponible`,
                  tiempo: 'activa', color: 'text-green-400'
                })),
              ].slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-3 py-3 min-w-0">
                  <span className="text-xl shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{a.texto}</p>
                    {a.sub && <p className="text-zinc-500 text-xs truncate">{a.sub}</p>}
                  </div>
                  <span className={`text-[10px] uppercase font-bold shrink-0 ${a.color}`}>{a.tiempo}</span>
                </div>
              ))}
              {leads.length === 0 && followupsHoy.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">Sin actividad reciente</p>
              )}
            </div>
          </div>
        </section>

        {/* ══ 6. SECTORES ══ */}
        <section className="mb-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span>🏘️</span>
                <h3 className="text-white font-black text-sm uppercase tracking-wider">Buscar por sector</h3>
              </div>
              <Link href="/properties" className="text-zinc-500 hover:text-amber-400 text-xs uppercase tracking-wider transition-colors shrink-0">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {SECTORES.map(s => (
                <Link key={s} href={`/properties?sector=${encodeURIComponent(s)}`}
                  className="bg-zinc-700/50 hover:bg-amber-500 hover:text-black text-zinc-300 text-center py-2.5 px-1 rounded-xl text-xs font-black uppercase tracking-wide transition-all truncate">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Acciones rápidas — solo desktop */}
        <section className="hidden md:block mb-6">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-6">
            <h3 className="text-zinc-500 font-black uppercase text-xs tracking-widest mb-4">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '+ Nueva propiedad', href: '/properties', style: 'bg-zinc-700/80 text-white hover:bg-zinc-600' },
                { label: '+ Nuevo evento', href: '/hoy', style: 'bg-zinc-700/80 text-white hover:bg-zinc-600' },
                { label: 'Ver pipeline', href: '/pipeline', style: 'bg-zinc-700/80 text-white hover:bg-zinc-600' },
                { label: 'Reportes', href: '/reports', style: 'bg-zinc-700/80 text-white hover:bg-zinc-600' },
              ].map(a => (
                <Link key={a.label} href={a.href}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${a.style}`}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Botón flotante */}
      <Link href="/clients"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 bg-amber-500 hover:bg-white text-black px-5 py-3.5 rounded-2xl font-black text-sm uppercase shadow-2xl shadow-amber-500/40 transition-all flex items-center gap-2">
        <span className="text-base font-black">+</span>
        Nuevo Lead
      </Link>
    </div>
  )
}