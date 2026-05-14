'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../app/lib/supabase'

interface Cliente {
  id: string
  nombre: string
  etapa: string
  tipoPropiedad: string[]
  presupuestoMin: string
  proximaAccion?: string
}

interface Recordatorio {
  id: string
  cliente_id: string
  texto: string
  fecha: string
  completado: boolean
  clienteNombre?: string
}

interface Metricas {
  clientesPorEtapa: Record<string, number>
  actividadMes: { tipo: string; total: number }[]
  recordatoriosPendientes: number
  recordatoriosCompletadosMes: number
  totalComunicacionesMes: number
}

const etapaColor: Record<string, string> = {
  'LEAD': 'text-gray-300 bg-white/5',
  'BUSCANDO': 'text-blue-400 bg-blue-400/10',
  'EN OFERTA': 'text-[#d4af37] bg-[#d4af37]/10',
  'CIERRE': 'text-green-400 bg-green-400/10',
}

const etapaBarColor: Record<string, string> = {
  'LEAD': 'bg-gray-400',
  'BUSCANDO': 'bg-blue-400',
  'EN OFERTA': 'bg-[#d4af37]',
  'CIERRE': 'bg-green-400',
}

const tipoIcono: Record<string, string> = {
  whatsapp: '💬',
  email: '✉️',
  llamada: '📞',
  nota: '📝',
}

const tipoLabel: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  llamada: 'Llamadas',
  nota: 'Notas',
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('clientes')
        .select('id, nombre, etapa, tipo_propiedad, presupuesto_min, proxima_accion')
        

      if (data) {
        const mapped = data.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          etapa: c.etapa,
          tipoPropiedad: c.tipo_propiedad || [],
          presupuestoMin: c.presupuesto_min || '',
          proximaAccion: c.proxima_accion || '',
        }))
        setClientes(mapped)

        // Clientes por etapa
        const porEtapa: Record<string, number> = { LEAD: 0, BUSCANDO: 0, 'EN OFERTA': 0, CIERRE: 0 }
        mapped.forEach((c) => { if (porEtapa[c.etapa] !== undefined) porEtapa[c.etapa]++ })

        // Actividad del mes
        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)

        const { data: historial } = await supabase
          .from('historial')
          .select('tipo')
          .gte('fecha', inicioMes.toISOString())

        const conteo: Record<string, number> = {}
        historial?.forEach((h) => { conteo[h.tipo] = (conteo[h.tipo] || 0) + 1 })
        const actividadMes = Object.entries(conteo).map(([tipo, total]) => ({ tipo, total }))
        const totalComunicaciones = historial?.length || 0

        // Recordatorios completados este mes
        const { data: recCompletados } = await supabase
          .from('recordatorios')
          .select('id')
          .eq('completado', true)
          .gte('created_at', inicioMes.toISOString())

        // Recordatorios pendientes
        const { data: recPendientes } = await supabase
          .from('recordatorios')
          .select('id')
          .eq('completado', false)

        setMetricas({
          clientesPorEtapa: porEtapa,
          actividadMes,
          recordatoriosPendientes: recPendientes?.length || 0,
          recordatoriosCompletadosMes: recCompletados?.length || 0,
          totalComunicacionesMes: totalComunicaciones,
        })
      }
    }

    const cargarRecordatorios = async () => {
      const en7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data } = await supabase
        .from('recordatorios')
        .select('*, clientes(nombre)')
        .eq('completado', false)
        .lte('fecha', en7dias)
        .order('fecha', { ascending: true })

      if (data) {
        setRecordatorios(data.map((r) => ({
          id: r.id,
          cliente_id: r.cliente_id,
          texto: r.texto,
          fecha: r.fecha,
          completado: r.completado,
          clienteNombre: r.clientes?.nombre || '',
        })))
      }
    }

    cargar()
    cargarRecordatorios()
  }, [])

  const completarRecordatorio = async (id: string) => {
    await supabase.from('recordatorios').update({ completado: true }).eq('id', id)
    setRecordatorios((prev) => prev.filter((r) => r.id !== id))
    if (metricas) {
      setMetricas({
        ...metricas,
        recordatoriosPendientes: Math.max(0, metricas.recordatoriosPendientes - 1),
        recordatoriosCompletadosMes: metricas.recordatoriosCompletadosMes + 1,
      })
    }
  }

  function formatFechaRecordatorio(fecha: string) {
    const hoy = new Date().toISOString().split('T')[0]
    const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (fecha === hoy) return { label: 'Hoy', color: 'text-red-400' }
    if (fecha === manana) return { label: 'Mañana', color: 'text-[#d4af37]' }
    const d = new Date(fecha + 'T12:00:00')
    return { label: d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' }), color: 'text-gray-300' }
  }

  const totalClientes = clientes.length
  const maxEtapa = metricas ? Math.max(...Object.values(metricas.clientesPorEtapa), 1) : 1

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <nav className="flex justify-between items-center p-6 border-b border-white/5">
        <div className="text-[#d4af37] text-xl font-bold tracking-tighter uppercase italic">Homvi</div>
        <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black text-xs font-bold">LB</div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-light tracking-tight">Bienvenido, <span className="text-[#d4af37] italic">Luis</span></h1>
          <p className="text-gray-300 text-sm mt-2 font-light">Este es el estado actual de tu portafolio hoy.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <p className="text-gray-300 text-xs uppercase tracking-[0.2em] mb-2">Ventas del Mes</p>
            <h2 className="text-3xl font-bold text-[#d4af37]">$4.2M</h2>
          </div>
          <Link href="/properties" className="group">
            <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 group-hover:border-[#d4af37]/50 transition-all cursor-pointer relative overflow-hidden">
              <p className="text-gray-300 text-xs uppercase tracking-[0.2em] mb-2">Propiedades Activas</p>
              <h2 className="text-3xl font-bold group-hover:text-[#d4af37] transition-colors">24 Unidades</h2>
              <div className="absolute right-8 bottom-8 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity">Ver catálogo →</div>
            </div>
          </Link>
          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <p className="text-gray-300 text-xs uppercase tracking-[0.2em] mb-2">Clientes Activos</p>
            <h2 className="text-3xl font-bold">{totalClientes > 0 ? `+${totalClientes}` : '0'}</h2>
          </div>
        </div>

        {/* Recordatorios pendientes */}
        {recordatorios.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold">
                Recordatorios Pendientes
                <span className="ml-2 bg-red-400/10 text-red-400 border border-red-400/30 px-2 py-0.5 rounded-full text-xs">
                  {recordatorios.length}
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recordatorios.map((r) => {
                const { label, color } = formatFechaRecordatorio(r.fecha)
                return (
                  <div key={r.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex items-start gap-3 hover:border-[#d4af37]/20 transition-all group">
                    <button
                      onClick={() => completarRecordatorio(r.id)}
                      className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 mt-0.5 hover:border-green-400 hover:bg-green-400/10 transition-all"
                      title="Marcar como completado"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">{r.texto}</p>
                      {r.clienteNombre && (
                        <Link href={`/clients/${r.cliente_id}`} className="text-xs text-[#d4af37] hover:underline mt-0.5 block truncate">
                          {r.clienteNombre.split(' ').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')}
                        </Link>
                      )}
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${color}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pipeline + Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-6">Pipeline de Clientes</h3>
            {clientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 text-sm">No hay clientes aún.</p>
                <Link href="/clients/new" className="mt-4 inline-block text-xs text-[#d4af37] uppercase tracking-widest hover:text-white transition-colors">
                  + Registrar primer cliente
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {clientes.map((c) => (
                  <Link key={c.id} href={`/clients/${c.id}`}>
                    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xs font-bold">
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium group-hover:text-[#d4af37] transition-colors">
                            {c.nombre.split(' ').map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')}
                          </p>
                          <p className="text-gray-300 text-xs">{c.tipoPropiedad?.[0] || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${etapaColor[c.etapa] || 'text-gray-300 bg-white/5'}`}>
                          {c.etapa}
                        </span>
                        <span className="text-sm font-bold text-[#d4af37]">
                          {c.presupuestoMin ? `$${Number(c.presupuestoMin.replace(/\D/g, '')).toLocaleString()}` : '—'}
                        </span>
                      </div>
                      {c.proximaAccion && (
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-xs">⏰</span>
                          <span className="text-xs text-[#d4af37] truncate">{c.proximaAccion}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-6">Agenda de Hoy</h3>
            <div className="space-y-5">
              {[
                { hora: '10:00 AM', cliente: 'María González', tipo: 'Firma de contrato' },
                { hora: '2:00 PM', cliente: 'Carlos Reyes', tipo: 'Segunda visita' },
                { hora: '4:30 PM', cliente: 'Pedro Núñez', tipo: 'Llamada de seguimiento' },
              ].map((c, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-[#d4af37] text-xs font-bold w-16 pt-0.5">{c.hora}</div>
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-sm font-medium">{c.cliente}</p>
                    <p className="text-gray-300 text-xs mt-0.5">{c.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/today" className="mt-8 block text-center text-xs text-[#d4af37] hover:text-white transition-colors uppercase tracking-widest">
              Ver agenda completa →
            </Link>
          </div>
        </div>

        {/* ── REPORTES Y MÉTRICAS ── */}
        {metricas && (
          <div className="mb-10">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-6">Reportes del Mes</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Clientes por etapa */}
              <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-6">
                <h4 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-5">Clientes por Etapa</h4>
                <div className="space-y-4">
                  {['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE'].map((etapa) => {
                    const count = metricas.clientesPorEtapa[etapa] || 0
                    const pct = totalClientes > 0 ? Math.round((count / totalClientes) * 100) : 0
                    return (
                      <div key={etapa}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-300 font-bold">{etapa}</span>
                          <span className="text-xs text-gray-300">{count} cliente{count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${etapaBarColor[etapa]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between">
                  <span className="text-xs text-gray-300">Total</span>
                  <span className="text-xs font-bold text-white">{totalClientes} clientes</span>
                </div>
              </div>

              {/* Actividad del mes */}
              <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-6">
                <h4 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-5">Actividad del Mes</h4>
                {metricas.actividadMes.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-gray-300 text-sm text-center">Sin actividad registrada este mes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metricas.actividadMes.map(({ tipo, total }) => {
                      const maxTotal = Math.max(...metricas.actividadMes.map(a => a.total), 1)
                      const pct = Math.round((total / maxTotal) * 100)
                      return (
                        <div key={tipo} className="flex items-center gap-3">
                          <span className="text-lg w-7 flex-shrink-0">{tipoIcono[tipo] || '📌'}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-300">{tipoLabel[tipo] || tipo}</span>
                              <span className="text-xs font-bold text-white">{total}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#d4af37] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between">
                  <span className="text-xs text-gray-300">Total interacciones</span>
                  <span className="text-xs font-bold text-[#d4af37]">{metricas.totalComunicacionesMes}</span>
                </div>
              </div>

              {/* Recordatorios */}
              <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-6">
                <h4 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-5">Recordatorios</h4>
                <div className="space-y-4">
                  {/* Donut visual simple */}
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff08" strokeWidth="3.5" />
                        {(() => {
                          const total = metricas.recordatoriosPendientes + metricas.recordatoriosCompletadosMes
                          const pct = total > 0 ? (metricas.recordatoriosCompletadosMes / total) * 100 : 0
                          const dash = (pct / 100) * 100
                          return (
                            <circle
                              cx="18" cy="18" r="15.9"
                              fill="none"
                              stroke="#d4af37"
                              strokeWidth="3.5"
                              strokeDasharray={`${dash} ${100 - dash}`}
                              strokeLinecap="round"
                            />
                          )
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{metricas.recordatoriosCompletadosMes}</span>
                        <span className="text-[10px] text-gray-300 uppercase tracking-wider">completados</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/3 rounded-2xl p-3 text-center border border-white/5">
                      <p className="text-2xl font-bold text-green-400">{metricas.recordatoriosCompletadosMes}</p>
                      <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">Completados</p>
                    </div>
                    <div className="bg-white/3 rounded-2xl p-3 text-center border border-white/5">
                      <p className="text-2xl font-bold text-red-400">{metricas.recordatoriosPendientes}</p>
                      <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <section>
          <h3 className="text-gray-300 text-xs uppercase tracking-[0.2em] mb-6 font-bold">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/today" className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-colors">
              Ver Agenda de Hoy
            </Link>
            <Link href="/clients/new" className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
              Nuevo Cliente
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
