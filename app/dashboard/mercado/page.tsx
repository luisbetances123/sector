'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Propiedad {
  id: string
  title: string
  price: number
  location: string
  type: string
  bedrooms: number
  m2: number
  precio_m2_usd: number
}

export default function MercadoPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, title, price, location, type, bedrooms, m2, precio_m2_usd')
      .not('price', 'is', null)
      .then(({ data }) => {
        if (data) setPropiedades(data)
        setLoading(false)
      })
  }, [])

  const zonas = Array.from(new Set(propiedades.map(p => p.location).filter(Boolean))).sort()

  const analisisPorZona = zonas.map(zona => {
    const props = propiedades.filter(p => p.location === zona)
    const precios = props.map(p => Number(p.price)).filter(p => p > 0)
    const preciosM2 = props.map(p => Number(p.precio_m2_usd)).filter(p => p > 0)

    const promedio = precios.length ? precios.reduce((a, b) => a + b, 0) / precios.length : 0
    const minimo = precios.length ? Math.min(...precios) : 0
    const maximo = precios.length ? Math.max(...precios) : 0
    const promedioM2 = preciosM2.length ? preciosM2.reduce((a, b) => a + b, 0) / preciosM2.length : 0

    return { zona, total: props.length, promedio, minimo, maximo, promedioM2 }
  }).filter(z => z.total > 0).sort((a, b) => b.promedio - a.promedio)

  const totalPropiedades = propiedades.length
  const precioPromedioCRM = propiedades.length
    ? propiedades.reduce((a, p) => a + Number(p.price), 0) / propiedades.length
    : 0

  const fmt = (n: number) => n > 0
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    : '-'

  const maxPromedio = Math.max(...analisisPorZona.map(z => z.promedio), 1)

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6">
        <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Análisis de Mercado</h1>
        <p className="text-white text-sm mt-1">Precios por zona basados en tu inventario</p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Propiedades</p>
          <p className="text-3xl font-black text-white mt-1">{totalPropiedades}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Precio Promedio</p>
          <p className="text-2xl font-black text-[#CCFF00] mt-1">{fmt(precioPromedioCRM)}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Zonas Activas</p>
          <p className="text-3xl font-black text-white mt-1">{analisisPorZona.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-sm text-center py-20 font-mono animate-pulse">Cargando datos del mercado...</div>
      ) : analisisPorZona.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-white text-sm">No hay suficientes datos para el análisis.</p>
          <p className="text-white text-xs">Agrega más propiedades con ubicación y precio para ver el análisis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-mono text-white uppercase tracking-wider">Precios por Zona</h2>
          {analisisPorZona.map((z, i) => (
            <div key={z.zona} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-600">#{i + 1}</span>
                    <h3 className="font-black text-white">{z.zona}</h3>
                    <span className="text-[10px] font-mono bg-zinc-900 text-white px-2 py-0.5 rounded-full">{z.total} prop.</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white uppercase">Precio Promedio</p>
                  <p className="text-xl font-black text-[#CCFF00] font-mono">{fmt(z.promedio)}</p>
                </div>
              </div>

              {/* BARRA */}
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-[#CCFF00] rounded-full transition-all duration-700"
                  style={{ width: `${(z.promedio / maxPromedio) * 100}%` }} />
              </div>

              {/* DETALLES */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-mono text-white uppercase">Mínimo</p>
                  <p className="text-sm font-black text-white mt-1">{fmt(z.minimo)}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-mono text-white uppercase">Máximo</p>
                  <p className="text-sm font-black text-white mt-1">{fmt(z.maximo)}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-mono text-white uppercase">Precio/m²</p>
                  <p className="text-sm font-black text-white mt-1">{z.promedioM2 > 0 ? fmt(z.promedioM2) : '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
