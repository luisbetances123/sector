'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface EtapaStats {
  etapa: string
  count: number
  volumen: number
  conversion: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<EtapaStats[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [clientesPorEtapa, setClientesPorEtapa] = useState<{etapa: string, count: number}[]>([])
  const [loading, setLoading] = useState(true)

  const ETAPAS_PIPELINE = ['Prospectos', 'Visitas', 'Negociacion', 'Cierre']

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [dealsRes, clientesRes] = await Promise.all([
      supabase.from('pipeline_deals').select('etapa, precio'),
      supabase.from('clients').select('etapa')
    ])

    if (dealsRes.data) {
      const etapaMap: Record<string, {count: number, volumen: number}> = {}
      ETAPAS_PIPELINE.forEach(e => { etapaMap[e] = { count: 0, volumen: 0 } })
      
      dealsRes.data.forEach((deal: any) => {
        if (etapaMap[deal.etapa]) {
          etapaMap[deal.etapa].count++
          etapaMap[deal.etapa].volumen += deal.precio || 0
        }
      })

      const totalDeals = dealsRes.data.length
      const statsArr: EtapaStats[] = ETAPAS_PIPELINE.map((etapa, idx) => {
        const prev = idx === 0 ? totalDeals : etapaMap[ETAPAS_PIPELINE[idx-1]].count
        const conversion = prev > 0 ? Math.round((etapaMap[etapa].count / (idx === 0 ? totalDeals : prev)) * 100) : 0
        return {
          etapa,
          count: etapaMap[etapa].count,
          volumen: etapaMap[etapa].volumen,
          conversion: idx === 0 ? 100 : conversion
        }
      })
      setStats(statsArr)
    }

    if (clientesRes.data) {
      setTotalClientes(clientesRes.data.length)
      const etapaCount: Record<string, number> = {}
      clientesRes.data.forEach((c: any) => {
        const e = c.etapa || 'Sin etapa'
        etapaCount[e] = (etapaCount[e] || 0) + 1
      })
      setClientesPorEtapa(Object.entries(etapaCount).map(([etapa, count]) => ({ etapa, count })))
    }

    setLoading(false)
  }

  const maxCount = Math.max(...stats.map(s => s.count), 1)
  const totalVolumen = stats.reduce((s, e) => s + e.volumen, 0)

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6">
        <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Analitica</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Reporte de Embudo</h1>
      </header>

      {loading ? (
        <div className="text-zinc-500 text-sm text-center py-20">Cargando datos...</div>
      ) : (
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-zinc-500 uppercase">Total Clientes</p>
              <p className="text-3xl font-black text-white mt-1">{totalClientes}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-zinc-500 uppercase">Deals Activos</p>
              <p className="text-3xl font-black text-[#CCFF00] mt-1">{stats.reduce((s,e) => s + e.count, 0)}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-zinc-500 uppercase">Volumen Total</p>
              <p className="text-2xl font-black text-white mt-1">US$ {totalVolumen.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
              <p className="text-xs font-mono text-zinc-500 uppercase">En Cierre</p>
              <p className="text-3xl font-black text-green-400 mt-1">
                {stats.find(s => s.etapa === 'Cierre')?.count || 0}
              </p>
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Embudo de Ventas</h2>
            {stats.map((s, idx) => (
              <div key={s.etapa} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400 w-4">{idx + 1}</span>
                    <span className="font-bold text-white uppercase tracking-wide">{s.etapa}</span>
                    <span className="text-zinc-500">{s.count} deals</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-500 font-mono">US$ {s.volumen.toLocaleString()}</span>
                    <span className={'font-black font-mono text-sm ' + (s.conversion >= 50 ? 'text-[#CCFF00]' : s.conversion >= 25 ? 'text-yellow-400' : 'text-red-400')}>
                      {s.conversion}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: maxCount > 0 ? (s.count / maxCount * 100) + "%" : "0%",
                      backgroundColor: idx === 0 ? "#CCFF00" : idx === 1 ? "#84cc16" : idx === 2 ? "#eab308" : "#22c55e"
                    }}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Clientes por Temperatura</h2>
            {clientesPorEtapa.map(item => (
              <div key={item.etapa} className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">{item.etapa}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-zinc-900 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[#CCFF00]"
                      style={{ width: totalClientes > 0 ? (item.count / totalClientes * 100) + "%" : "0%" }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 w-8 text-right">{item.count}</span>
                  <span className="text-xs font-mono text-zinc-600 w-8 text-right">
                    {Math.round(item.count / totalClientes * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
