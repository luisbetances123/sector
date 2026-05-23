'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Property = {
  id: string
  title: string
  price: string
  location: string
  type: string
  sector: string
  estado: string
  m2?: number
  recamaras?: number
  banos?: number
  estacionamientos?: number
  descripcion?: string
  imagen_url?: string
  moneda: string
  created_at: string
}

const ESTADO_STYLES: Record<string, string> = {
  disponible: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  reservada:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
  en_proceso: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  rentada:    'text-purple-400 bg-purple-400/10 border-purple-400/20',
  vendida:    'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
}
const ESTADO_LABELS: Record<string, string> = {
  disponible: 'Disponible', reservada: 'Reservada',
  en_proceso: 'En proceso', rentada: 'Rentada', vendida: 'Vendida',
}
const ESTADO_DOTS: Record<string, string> = {
  disponible: 'bg-emerald-400', reservada: 'bg-amber-400',
  en_proceso: 'bg-blue-400',   rentada: 'bg-purple-400', vendida: 'bg-zinc-400',
}

function formatPrice(price: string, moneda = 'USD') {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return price || '—'
  return new Intl.NumberFormat('es-DO', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0,
  }).format(num)
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('properties').select('*').eq('id', params.id).single()
      if (!error && data) setProperty(data)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="p-8 max-w-2xl animate-pulse space-y-4">
        <div className="h-64 bg-zinc-800 rounded-2xl" />
        <div className="h-8 bg-zinc-800 rounded-xl w-2/3" />
        <div className="h-4 bg-zinc-800 rounded-xl w-1/2" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500 mb-4">Propiedad no encontrada.</p>
        <button onClick={() => router.push('/properties')}
          className="text-amber-500 font-bold text-sm hover:underline">← Volver</button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <button onClick={() => router.push('/properties')}
        className="flex items-center gap-2 text-zinc-500 hover:text-amber-400 text-sm font-bold uppercase tracking-wider mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Propiedades
      </button>

      {property.imagen_url ? (
        <div className="h-64 md:h-80 rounded-2xl overflow-hidden mb-6 border border-zinc-800">
          <img src={property.imagen_url} alt={property.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-48 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
          <svg className="w-14 h-14 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21V12h6v9" />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{property.title}</h1>
          {(property.location || property.sector) && (
            <p className="text-zinc-400 flex items-center gap-1.5 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {[property.location, property.sector].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${ESTADO_STYLES[property.estado] ?? ESTADO_STYLES.disponible}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ESTADO_DOTS[property.estado] ?? 'bg-zinc-400'}`} />
          {ESTADO_LABELS[property.estado] ?? property.estado}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-3xl font-black text-amber-400">
          {formatPrice(property.price, property.moneda)}
        </span>
        <span className="text-zinc-500 text-xs uppercase tracking-wider bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-lg font-bold">
          {property.type}
        </span>
      </div>

      {(property.recamaras || property.banos || property.estacionamientos || property.m2) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { value: property.recamaras, label: 'Recámaras', icon: '🛏' },
            { value: property.banos, label: 'Baños', icon: '🚿' },
            { value: property.estacionamientos, label: 'Estacionamientos', icon: '🚗' },
            { value: property.m2 ? `${property.m2} m²` : null, label: 'Superficie', icon: '📐' },
          ].filter(m => m.value != null).map(m => (
            <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-white font-black text-lg">{m.value}</div>
              <div className="text-zinc-500 text-xs uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {property.descripcion && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Descripción</h2>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{property.descripcion}</p>
        </div>
      )}

      {property.created_at && (
        <p className="text-zinc-600 text-xs uppercase tracking-widest">
          Agregada el {new Date(property.created_at).toLocaleDateString('es-DO', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      )}
    </div>
  )
}