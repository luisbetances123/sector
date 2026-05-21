'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ReportsPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const [c, p] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('properties').select('*'),
      ])
      if (c.data) setClientes(c.data)
      if (p.data) setProperties(p.data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <div className="p-8 text-zinc-500">Cargando reportes...</div>

  const etapas = ['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']
  const etapaColors: Record<string, string> = { LEAD: 'bg-zinc-600', BUSCANDO: 'bg-blue-600', 'EN OFERTA': 'bg-amber-500', CIERRE: 'bg-green-500' }
  const etapaDots: Record<string, string> = { LEAD: 'bg-zinc-400', BUSCANDO: 'bg-blue-400', 'EN OFERTA': 'bg-amber-400', CIERRE: 'bg-green-400' }
  const clientesPorEtapa = etapas.map(e => ({ etapa: e, total: clientes.filter(c => (c.etapa || '').toUpperCase() === e).length }))
  const maxClientes = Math.max(...clientesPorEtapa.map(e => e.total), 1)

  const sectores = ['Piantini','Naco','Bella Vista','Evaristo Morales','Serralles','Los Cacicazgos','Arroyo Hondo','Viejo Arroyo Hondo','La Esperilla','El Millón','Mirador Norte','Mirador Sur']
  const sectorColors = ['bg-amber-500','bg-blue-500','bg-purple-500','bg-green-500','bg-pink-500','bg-cyan-500','bg-orange-500','bg-teal-500','bg-red-500','bg-indigo-500','bg-yellow-500','bg-emerald-500']
  const propsPorSector = sectores.map((s, i) => ({ sector: s, total: properties.filter(p => (p.sector || '').toLowerCase() === s.toLowerCase()).length, color: sectorColors[i] })).filter(s => s.total > 0).sort((a, b) => b.total - a.total)
  const otrosSector = properties.filter(p => p.sector && !sectores.map(s => s.toLowerCase()).includes(p.sector.toLowerCase())).length
  if (otrosSector > 0) propsPorSector.push({ sector: 'Otros', total: otrosSector, color: 'bg-zinc-500' })
  const maxProps = Math.max(...propsPorSector.map(s => s.total), 1)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">REPORTES</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Resumen general de HOMVI</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Clientes totales', value: clientes.length, color: 'text-amber-500' },
            { label: 'En cierre', value: clientes.filter(c => (c.etapa || '').toUpperCase() === 'CIERRE').length, color: 'text-green-400' },
            { label: 'Propiedades', value: properties.length, color: 'text-blue-400' },
            { label: 'Disponibles', value: properties.filter(p => (p.status || '').toLowerCase() === 'disponible').length, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className={`h-full rounded-full transition-all duration-700 ${etapaColors[e.etapa]}`} style={{ width: `${(e.total / maxClientes) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Distribución</p>
              <div className="flex gap-3 flex-wrap">
                {clientesPorEtapa.filter(e => e.total > 0).map(e => (
                  <div key={e.etapa} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${etapaDots[e.etapa]}`} />
                    <span className="text-zinc-400 text-xs">{e.etapa}</span>
                    <span className="text-white text-xs font-bold">{clientes.length > 0 ? Math.round((e.total / clientes.length) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-white font-black uppercase text-sm tracking-wider mb-6">Propiedades por sector</h2>
            {propsPorSector.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No hay propiedades con sector asignado</p>
            ) : (
              <div className="flex flex-col gap-3">
                {propsPorSector.map(s => (
                  <div key={s.sector}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                        <span className="text-zinc-400 text-xs">{s.sector}</span>
                      </div>
                      <span className="text-white font-black text-sm">{s.total}</span>
                    </div>
                    <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.color}`} style={{ width: `${(s.total / maxProps) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
              <span>{propsPorSector.length} sectores activos</span>
              <span>{properties.length} propiedades en total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
