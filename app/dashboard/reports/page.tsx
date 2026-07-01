'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Unidad {
  estado: string
  precio: number | null
  reservado_por: string | null
  fecha_venta: string | null
}

interface BrokerStats {
  nombre: string
  vendidas: number
  reservadas: number
  volumen: number
}

interface MesStats {
  label: string
  count: number
}

export default function ReportsPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('constructora_id')
      .eq('id', user.id)
      .single()

    const constructoraId = profile?.constructora_id
    if (!constructoraId) { setLoading(false); return }

    const { data: proyectosPropios } = await supabase
      .from('proyectos')
      .select('id')
      .eq('constructora_id', constructoraId)

    const idsDeProyectosPropios = (proyectosPropios || []).map(p => p.id)
    if (idsDeProyectosPropios.length === 0) { setLoading(false); return }

    const { data } = await supabase
      .from('unidades')
      .select('estado, precio, reservado_por, fecha_venta')
      .in('proyecto_id', idsDeProyectosPropios)

    setUnidades(data || [])
    setLoading(false)
  }

  const total = unidades.length
  const libres = unidades.filter(u => u.estado === 'libre').length
  const reservadas = unidades.filter(u => u.estado === 'reservada').length
  const vendidas = unidades.filter(u => u.estado === 'vendida').length
  const volumenVendido = unidades
    .filter(u => u.estado === 'vendida')
    .reduce((s, u) => s + (u.precio || 0), 0)

  const pctVendido = total > 0 ? Math.round(vendidas / total * 100) : 0
  const pctReservado = total > 0 ? Math.round(reservadas / total * 100) : 0
  const pctLibre = 100 - pctVendido - pctReservado

  const ventasPorMes: Record<string, number> = {}
  unidades
    .filter(u => u.estado === 'vendida' && u.fecha_venta)
    .forEach(u => {
      const d = new Date(u.fecha_venta!)
      const label = d.toLocaleDateString('es', { month: 'short', year: 'numeric' })
      ventasPorMes[label] = (ventasPorMes[label] || 0) + 1
    })
  const meses: MesStats[] = Object.entries(ventasPorMes)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      const parse = (l: string) => new Date(l)
      return parse(a.label).getTime() - parse(b.label).getTime()
    })
  const maxMes = Math.max(...meses.map(m => m.count), 1)

  const mesesActivos = meses.length || 1
  const unidadesComprometidas = vendidas + reservadas
  const tasaAbsorcionMensual = mesesActivos > 0 ? Math.round((vendidas / mesesActivos) * 10) / 10 : 0
  const mesesParaAgotar = tasaAbsorcionMensual > 0 ? Math.ceil(libres / tasaAbsorcionMensual) : null

  const brokerMap: Record<string, BrokerStats> = {}
  unidades
    .filter(u => (u.estado === 'vendida' || u.estado === 'reservada') && u.reservado_por)
    .forEach(u => {
      const nombre = u.reservado_por!
      if (!brokerMap[nombre]) brokerMap[nombre] = { nombre, vendidas: 0, reservadas: 0, volumen: 0 }
      if (u.estado === 'vendida') {
        brokerMap[nombre].vendidas++
        brokerMap[nombre].volumen += u.precio || 0
      } else {
        brokerMap[nombre].reservadas++
        brokerMap[nombre].volumen += u.precio || 0
      }
    })
  const brokers = Object.values(brokerMap).sort((a, b) => b.volumen - a.volumen)

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6">
        <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Analitica</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Inventario y Absorción</h1>
      </header>

      {loading ? (
        <div className="text-white text-sm text-center py-20">Cargando datos...</div>
      ) : (
        <>
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-white uppercase">Total Unidades</p>
              <p className="text-3xl font-black text-white mt-1">{total}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-zinc-400 uppercase">Libres</p>
              <p className="text-3xl font-black text-zinc-400 mt-1">{libres}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-yellow-400 uppercase">Reservadas</p>
              <p className="text-3xl font-black text-yellow-400 mt-1">{reservadas}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-green-400 uppercase">Vendidas</p>
              <p className="text-3xl font-black text-green-400 mt-1">{vendidas}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-[#CCFF00] uppercase">Volumen Vendido</p>
              <p className="text-xl font-black text-[#CCFF00] mt-1">US$ {volumenVendido.toLocaleString()}</p>
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-mono text-white uppercase tracking-wider">Absorción del Proyecto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-xs font-mono text-zinc-400 uppercase">Tasa mensual</p>
                <p className="text-3xl font-black text-white mt-1">{tasaAbsorcionMensual}<span className="text-sm font-normal text-zinc-400 ml-1">unid/mes</span></p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-xs font-mono text-zinc-400 uppercase">Comprometido</p>
                <p className="text-3xl font-black text-[#CCFF00] mt-1">{unidadesComprometidas}<span className="text-sm font-normal text-zinc-400 ml-1">de {total}</span></p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-xs font-mono text-zinc-400 uppercase">Proyección cierre</p>
                <p className="text-3xl font-black text-white mt-1">
                  {mesesParaAgotar === null ? '—' : mesesParaAgotar === 0 ? 'Agotado' : `${mesesParaAgotar}`}
                  {mesesParaAgotar !== null && mesesParaAgotar > 0 && <span className="text-sm font-normal text-zinc-400 ml-1">meses</span>}
                </p>
                {mesesParaAgotar !== null && mesesParaAgotar > 0 && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(Date.now() + mesesParaAgotar * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-mono text-white uppercase tracking-wider">Absorción</h2>
            <div className="flex items-end gap-4">
              <span className="text-6xl font-black text-[#CCFF00]">{pctVendido}%</span>
              <span className="text-zinc-500 text-sm mb-2">vendido del total</span>
            </div>
            <div className="w-full h-5 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-400 transition-all duration-500"
                style={{ width: pctVendido + '%' }}
                title={`Vendido ${pctVendido}%`}
              />
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: pctReservado + '%' }}
                title={`Reservado ${pctReservado}%`}
              />
              <div
                className="h-full bg-zinc-700 transition-all duration-500"
                style={{ width: pctLibre + '%' }}
                title={`Libre ${pctLibre}%`}
              />
            </div>
            <div className="flex gap-6 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                Vendido {pctVendido}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                Reservado {pctReservado}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                Libre {pctLibre}%
              </span>
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-mono text-white uppercase tracking-wider">Velocidad de Venta · Ventas por Mes</h2>
            {meses.length === 0 ? (
              <p className="text-zinc-600 text-sm">Sin ventas registradas con fecha.</p>
            ) : (
              <div className="space-y-3">
                {meses.map(m => (
                  <div key={m.label} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-zinc-400 w-20 shrink-0 capitalize">{m.label}</span>
                    <div className="flex-1 bg-zinc-900 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 rounded-full bg-[#CCFF00] transition-all duration-500"
                        style={{ width: (m.count / maxMes * 100) + '%' }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white w-8 text-right">{m.count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-mono text-white uppercase tracking-wider">Desempeño por Broker</h2>
            {brokers.length === 0 ? (
              <p className="text-zinc-600 text-sm">Sin datos de broker.</p>
            ) : (
              <div className="space-y-1">
                {brokers.map(b => (
                  <div key={b.nombre} className="flex items-center justify-between gap-4 py-3 border-b border-zinc-900 last:border-0">
                    <span className="font-semibold text-white text-sm w-36 truncate">{b.nombre}</span>
                    <div className="flex items-center gap-5 text-xs font-mono">
                      <span className="text-green-400">{b.vendidas} vendidas</span>
                      <span className="text-yellow-400">{b.reservadas} reservadas</span>
                      <span className="text-[#CCFF00]">US$ {b.volumen.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
