'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams } from 'next/navigation'

const WHATSAPP = '19293056500'

function formatPrice(price: string, moneda = 'USD') {
  const num = parseFloat(price?.replace(/[^0-9.]/g, '') || '0')
  if (isNaN(num) || num === 0) return price || '—'
  return new Intl.NumberFormat('es-DO', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0
  }).format(num)
}

export default function FichaTecnica() {
  const params = useParams()
  const [p, setP] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    supabase.from('properties').select('*').eq('id', params.id).single()
      .then(({ data }) => {
        setP(data)
        setLoading(false)
      })
  }, [params?.id])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-amber-500 font-black text-2xl animate-pulse">SECTOR</p>
    </div>
  )

  if (!p) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Propiedad no encontrada</p>
    </div>
  )

  const precio = formatPrice(p.price, p.moneda || 'USD')
  const foto = p.imagen_url || p.image_url
  const whatsappMsg = encodeURIComponent(
    `Hola, estoy interesado en: *${p.title}* en ${p.sector || p.location} a ${precio}. ¿Podría darme más información?`
  )
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-amber-500 font-black text-xl tracking-tight">SECTOR</span>
          <a href={whatsappUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-black transition-all">
            💬 Consultar
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {foto ? (
          <img src={foto} alt={p.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-6" />
        ) : (
          <div className="w-full h-64 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-5xl">🏠</span>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-black text-white leading-tight">{p.title}</h1>
            <span className="shrink-0 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase">{p.type}</span>
          </div>
          {(p.sector || p.location) && <p className="text-zinc-400 text-sm mb-3">📍 {p.sector || p.location}</p>}
          <p className="text-3xl font-black text-amber-400">{precio}</p>
          {(p.estado || p.status) && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${(p.estado || p.status) === 'disponible' ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {p.estado || p.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {p.recamaras && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"><p className="text-2xl mb-1">🛏</p><p className="text-white font-black text-lg">{p.recamaras}</p><p className="text-zinc-500 text-xs uppercase">Recámaras</p></div>}
          {p.banos && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"><p className="text-2xl mb-1">🚿</p><p className="text-white font-black text-lg">{p.banos}</p><p className="text-zinc-500 text-xs uppercase">Baños</p></div>}
          {p.estacionamientos && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"><p className="text-2xl mb-1">🚗</p><p className="text-white font-black text-lg">{p.estacionamientos}</p><p className="text-zinc-500 text-xs uppercase">Parqueos</p></div>}
          {p.m2 && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"><p className="text-2xl mb-1">📐</p><p className="text-white font-black text-lg">{p.m2}</p><p className="text-zinc-500 text-xs uppercase">m²</p></div>}
        </div>

        {p.descripcion && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <h2 className="text-white font-black uppercase text-sm tracking-wider mb-3">Descripción</h2>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{p.descripcion}</p>
          </div>
        )}

        <a href={whatsappUrl} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all mb-4">
          💬 Consultar por WhatsApp
        </a>
      </div>

      <div className="border-t border-zinc-800 mt-8 py-6 text-center">
        <p className="text-zinc-600 text-xs">© 2026 SECTOR · Santo Domingo, RD</p>
      </div>
    </div>
  )
}