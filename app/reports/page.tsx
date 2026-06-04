'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ReportsPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [contactos, setContactos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [c, p, ct] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('properties').select('*'),
        supabase.from('contactos_whatsapp').select('*').order('fecha', { ascending: true }),
      ])
      if (c.data) setClientes(c.data)
      if (p.data) setProperties(p.data)
      if (ct.data) setContactos(ct.data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-amber-500 font-black text-2xl animate-pulse">HOMVI</p>
    </div>
  )

  // Helper para convertir el string de precio de la DB a un número limpio
  const limpiarPrecio = (priceStr: string): number => {
    if (!priceStr) return 0
    let limpio = priceStr.replace(/[US$RD,\s]/g, '').trim()
    if (/\.\d{3}$/.test(limpio)) {
      limpio = limpio.replace(/\./g, '')
    }
    let num = parseFloat(limpio)
    if (isNaN(num)) return 0
    if (num > 0 && num < 1000) num = num * 1000
    return num
  }

  // ── Métricas base ────────────────────────────────────────────────────────────
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)

  const leadsEsteMes = clientes.filter(c => new Date(c.created_at) >= inicioMes).length
  const leadsMesAnterior = clientes.filter(c => {
    const fecha = new Date(c.created_at)
    return fecha >= inicioMesAnterior && fecha < inicioMes
  }).length
  const crecimientoLeads = leadsMesAnterior > 0
    ? Math.round(((leadsEsteMes - leadsMesAnterior) / leadsMesAnterior) * 100)
    : leadsEsteMes > 0 ? 100 : 0

  // Sector más buscado por clientes
  const sectorCount: Record<string, number> = {}
  clientes.forEach(c => {
    (c.zonas_interes || []).forEach((z: string) => {
      sectorCount[z] = (sectorCount[z] || 0) + 1
    })
  })
  const sectorTop = Object.entries(sectorCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxSectorBusqueda = sectorTop[0]?.[1] || 1

  // Tiempo promedio de respuesta
  const tiemposRespuesta = clientes
    .filter(c => c.etapa !== 'Lead')
    .map(c => {
      const primerContacto = contactos
        .filter(ct => ct.cliente_id === c.id)
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0]
      if (!primerContacto) return null
      const creado = new Date(c.created_at).getTime()
      const contactado = new Date(primerContacto.fecha).getTime()
      return (contactado - creado) / (1000 * 60 * 60)
    })
    .filter((t): t is number => t !== null && t >= 0)

  const tiempoPromedio = tiemposRespuesta.length > 0
    ? Math.round(tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length)
    : null

  const formatTiempo = (horas: number) => {
    if (horas < 1) return `${Math.round(horas * 60)} min`
    if (horas < 24) return `${Math.round(horas)} hrs`
    return `${Math.round(horas / 24)} días`
  }

  // Pipeline
  const etapas = ['Lead', 'Buscando', 'En Oferta', 'Cierre']
  const etapaColors: Record<string, string> = {
    'Lead': 'bg-zinc-600', 'Buscando': 'bg-blue-600', 'En Oferta': 'bg-amber-500', 'Cierre': 'bg-green-500'
  }
  const etapaDots: Record<string, string> = {
    'Lead': 'bg-zinc-400', 'Buscando': 'bg-blue-400', 'En Oferta': 'bg-amber-400', 'Cierre': 'bg-green-400'
  }
  const clientesPorEtapa = etapas.map(e => ({
    etapa: e, total: clientes.filter(c => (c.etapa || '').toLowerCase() === e.toLowerCase()).length
  }))
  const maxClientes = Math.max(...clientesPorEtapa.map(e => e.total), 1)

  // ── Volúmenes Financieros por Sector ───────────────────────────────────────
  const sectores = ['Piantini','Naco','Bella Vista','Evaristo Morales','Serralles','Los Cacicazgos','Arroyo Hondo','Viejo Arroyo Hondo','La Esperilla','El Millón','Mirador Norte','Mirador Sur']
  const sectorColors = ['bg-amber-500','bg-blue-500','bg-purple-500','bg-green-500','bg-pink-500','bg-cyan-500','bg-orange-500','bg-teal-500','bg-red-500','bg-indigo-500','bg-yellow-500','bg-emerald-500']
  
  const propsPorSector = sectores.map((s, i) => {
    const propsDelSector = properties.filter(p => (p.sector || '').toLowerCase() === s.toLowerCase())
    const volumenDinero = propsDelSector.reduce((acc, p) => acc + limpiarPrecio(p.price), 0)
    return {
      sector: s,
      total: propsDelSector.length,
      volumen: volumenDinero,
      color: sectorColors[i]
    }
  }).filter(s => s.total > 0).sort((a, b) => b.volumen - a.volumen)

  const maxVolumen = Math.max(...propsPorSector.map(s => s.volumen), 1)
  const granVolumenTotal = propsPorSector.reduce((acc, s) => acc + s.volumen, 0)

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0
    }).format(monto)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">REPORTES FINANCIALS</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">
            {ahora.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ══ MÉTRICAS CLAVE ══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Clientes totales', value: clientes.length, color: 'text-amber-500', sub: `${leadsEsteMes} este mes` },
            { label: 'En cierre', value: clientes.filter(c => (c.etapa || '').toLowerCase() === 'cierre').length, color: 'text-green-400', sub: 'activos' },
            { label: 'Valor Inventario', value: formatMonto(granVolumenTotal), color: 'text-blue-400', sub: `${properties.length} propiedades` },
            { label: 'Contactos log.', value: contactos.length, color: 'text-purple-400', sub: 'registrados' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-2xl md:text-3xl font-black truncate ${s.color}`}>{s.value}</p>
              <p className="text-zinc-600 text-xs mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ══ CARD METRICS ══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Leads */}
          <div className="bg-gradient-to-br from-red-950/60 to-zinc-900 border border-red-800/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📈</span>
              <h3 className="text-white font-black uppercase text-xs tracking-wider">Leads este mes</h3>
            </div>
            <p className="text-5xl font-black text-red-400 mb-2">{leadsEsteMes}</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${crecimientoLeads >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
              {crecimientoLeads >= 0 ? '↑' : '↓'} {Math.abs(crecimientoLeads)}% vs mes anterior
            </div>
            <p className="text-zinc-600 text-xs mt-3">{leadsMesAnterior} leads el mes pasado</p>
          </div>

          {/* Sectores más buscados */}
          <div className="bg-gradient-to-br from-amber-950/60 to-zinc-900 border border-amber-800/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏘️</span>
              <h3 className="text-white font-black uppercase text-xs tracking-wider">Sectores más buscados</h3>
            </div>
            {sectorTop.length === 0 ? (
              <p className="text-zinc-500 text-sm">Sin datos aún</p>
            ) : (
              <div className="flex flex-col gap-2">
                {sectorTop.map(([sector, count], i) => (
                  <div key={sector}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-300 text-xs truncate">{i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : ''}{sector}</span>
                      <span className="text-amber-400 text-xs font-black ml-2">{count} max</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / maxSectorBusqueda) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tiempo de respuesta */}
          <div className="bg-gradient-to-br from-blue-950/60 to-zinc-900 border border-blue-800/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h3 className="text-white font-black uppercase text-xs tracking-wider">Tiempo de respuesta</h3>
            </div>
            {tiempoPromedio === null ? (
              <p className="text-zinc-500 text-sm">Sin datos suficientes</p>
            ) : (
              <>
                <p className="text-5xl font-black text-blue-400 mb-2">{formatTiempo(tiempoPromedio)}</p>
                <p className="text-zinc-500 text-xs">promedio para contactar un lead</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-3 ${tiempoPromedio <= 2 ? 'bg-green-900/50 text-green-400' : tiempoPromedio <= 24 ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'}`}>
                  {tiempoPromedio <= 2 ? '🟢 Excelente' : tiempoPromedio <= 24 ? '🟡 Aceptable' : '🔴 Mejorar'}
                </div>
              </>
            )}
            <p className="text-zinc-600 text-xs mt-3">{tiemposRespuesta.length} clientes analizados</p>
          </div>
        </div>

        {/* ══ GRÁFICAS ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pipeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-white font-black uppercase text-sm tracking-wider mb-6">Pipeline — Clientes por etapa</h2>
            <div className="flex flex-col gap-4">
              {clientesPorEtapa.map(e => (
                <div key={e.etapa}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${etapaDots[e.etapa]}`} />
                      <span className="text-zinc-400 text-xs uppercase tracking-wider">{e.etapa}</span>
                    </div>
                    <span className="text-white font-black">{e.total}</span>
                  </div>
                  <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${etapaColors[e.etapa]}`}
                      style={{ width: `${(e.total / maxClientes) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volumen de Dinero por Sector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-white font-black uppercase text-sm tracking-wider mb-6">Volumen Financiero por Sector (US$)</h2>
            {propsPorSector.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No hay propiedades con sector asignado</p>
            ) : (
              <div className="flex flex-col gap-3">
                {propsPorSector.map(s => (
                  <div key={s.sector}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                        <span className="text-zinc-400 text-xs">{s.sector} <span className="text-zinc-600 font-bold">({s.total} u.)</span></span>
                      </div>
                      <span className="text-amber-400 font-black text-sm">{formatMonto(s.volumen)}</span>
                    </div>
                    <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.color}`}
                        style={{ width: `${(s.volumen / maxVolumen) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
              <span>{propsPorSector.length} sectores monetizados</span>
              <span className="font-bold text-white">Total Carterizado: {formatMonto(granVolumenTotal)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}