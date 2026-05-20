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
  const leadsSimResponder = clients.filter(c => c.status === 'LEAD')
  const clientesActivos = clients.filter(c => c.status === 'BUSCANDO' || c.status === 'EN OFERTA')

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

  if (loading) return <div className="p-8 text-zinc-500">Cargando...</div>

  const AlertasSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* LEADS SIN RESPONDER */}
      <div className="bg-red-950 border border-red-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🔴</span>
            <span className="text-red-300 font-black text-xs uppercase tracking-wider">Leads sin responder</span>
          </div>
          <span className="bg-red-800 text-red-300 text-xs font-black px-2 py-1 rounded-full">{leadsSimResponder.length}</span>
        </div>
        {leadsSimResponder.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-2">Sin leads pendientes</p>
        ) : (
          <div className="flex flex-col gap-2">
            {leadsSimResponder.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between bg-red-900/30 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-xs">{c.initial}</div>
                  <div>
                    <p className="text-white text-xs font-bold">{c.name}</p>
                    {c.type && <p className="text-zinc-400 text-[10px]">{c.type}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {c.phone && <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="bg-green-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold">💬</a>}
                  {c.phone && <a href={`tel:${c.phone}`} className="bg-blue-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold">📞</a>}
                </div>
              </div>
            ))}
          </div>
        )}
        {leadsSimResponder.length > 3 && <Link href="/clients" className="block text-center text-red-400 text-xs mt-2">Ver {leadsSimResponder.length - 3} mas →</Link>}
      </div>

      {/* SEGUIMIENTOS HOY */}
      <div className="bg-amber-950/50 border border-amber-800/50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🟡</span>
            <span className="text-amber-300 font-black text-xs uppercase tracking-wider">Seguimientos hoy</span>
          </div>
          <span className="bg-amber-800/50 text-amber-300 text-xs font-black px-2 py-1 rounded-full">{followupsHoy.length}</span>
        </div>
        {followupsHoy.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-2">Sin seguimientos para hoy</p>
        ) : (
          <div className="flex flex-col gap-2">
            {followupsHoy.slice(0, 3).map(f => (
              <div key={f.id} className="flex items-center justify-between bg-amber-900/20 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{tipoIcono[f.tipo] || '📌'}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{f.titulo}</p>
                    <p className="text-amber-400 text-[10px] font-mono">{f.hora}</p>
                  </div>
                </div>
                <Link href="/calendar" className="bg-amber-700/50 text-amber-300 px-2 py-1 rounded-lg text-[10px] font-bold">Ver</Link>
              </div>
            ))}
          </div>
        )}
        {followupsHoy.length > 3 && <Link href="/calendar" className="block text-center text-amber-400 text-xs mt-2">Ver {followupsHoy.length - 3} mas →</Link>}
      </div>

      {/* CLIENTES ACTIVOS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span className="text-green-300 font-black text-xs uppercase tracking-wider">Clientes activos</span>
          </div>
          <span className="bg-zinc-800 text-zinc-300 text-xs font-black px-2 py-1 rounded-full">{clientesActivos.length}</span>
        </div>
        {clientesActivos.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-2">Sin clientes activos</p>
        ) : (
          <div className="flex flex-col gap-2">
            {clientesActivos.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between bg-zinc-800/50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-xs">{c.initial}</div>
                  <div>
                    <p className="text-white text-xs font-bold">{c.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${etapaColor[c.status]}`}>{c.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.phone && <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="bg-green-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold">💬</a>}
                  {c.price && <span className="text-amber-500 text-xs font-black">{c.price}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/pipeline" className="block text-center text-zinc-400 text-xs mt-2">Ver pipeline →</Link>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* VISTA MOVIL */}
      <div className="md:hidden">
        <header className="mb-6">
          <h1 className="text-2xl font-black text-white">Hola, <span className="text-amber-500 italic">Luis</span> 👋</h1>
          <p className="text-zinc-400 text-xs mt-1">{new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </header>
        <AlertasSection />
        <div className="grid grid-cols-2 gap-3">
          <Link href="/clients" className="bg-amber-500 text-black py-3 rounded-2xl font-black text-xs uppercase text-center">+ Nuevo cliente</Link>
          <Link href="/calendar" className="bg-zinc-800 text-white py-3 rounded-2xl font-black text-xs uppercase text-center">+ Evento</Link>
          <Link href="/properties" className="bg-zinc-800 text-white py-3 rounded-2xl font-black text-xs uppercase text-center">Propiedades</Link>
          <Link href="/reports" className="bg-zinc-800 text-white py-3 rounded-2xl font-black text-xs uppercase text-center">Reportes</Link>
        </div>
      </div>

      {/* VISTA DESKTOP */}
      <div className="hidden md:block">
        <header className="mb-8">
          <h1 className="text-4xl font-light tracking-tight text-white">Bienvenido, <span className="text-amber-500 italic font-black">Luis</span></h1>
          <p className="text-zinc-400 text-sm mt-2">Este es el estado actual de tu portafolio hoy.</p>
        </header>

        <AlertasSection />

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Clientes totales</p>
            <h2 className="text-4xl font-black text-amber-500">{clients.length}</h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Propiedades disponibles</p>
            <h2 className="text-4xl font-black text-blue-400">{propiedadesDisponibles} <span className="text-zinc-500 text-lg font-normal">de {properties.length}</span></h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Follow-ups pendientes</p>
            <h2 className="text-4xl font-black text-purple-400">{followupsPendientes}</h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-black uppercase text-sm tracking-wider">Pipeline de clientes</h3>
              <Link href="/pipeline" className="text-amber-500 text-xs hover:text-white transition-colors uppercase tracking-wider">Ver todo →</Link>
            </div>
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
          </div>
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
            <Link href="/calendar" className="mt-4 block text-center text-xs text-amber-500 hover:text-white transition-colors uppercase tracking-wider">Ver agenda completa →</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
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
            <Link href="/properties" className="mt-4 block text-center text-xs text-amber-500 hover:text-white transition-colors uppercase tracking-wider">Ver propiedades →</Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">Acciones rapidas</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/clients" className="px-6 py-3 bg-amber-500 text-black rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white transition-all">+ Nuevo cliente</Link>
            <Link href="/properties" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">+ Nueva propiedad</Link>
            <Link href="/calendar" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">+ Nuevo evento</Link>
            <Link href="/pipeline" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">Ver pipeline</Link>
            <Link href="/reports" className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all">Ver reportes</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
