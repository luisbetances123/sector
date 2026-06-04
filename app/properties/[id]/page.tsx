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
  imagenes?: string[]
  moneda: string
  created_at?: string
}

const ESTADOS: Record<string, { label: string; color: string; dot: string }> = {
  disponible: { label: 'Disponible', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  reservada:  { label: 'Reservada',  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',    dot: 'bg-amber-400' },
  en_proceso: { label: 'En proceso', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       dot: 'bg-blue-400' },
  rentada:    { label: 'Rentada',    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  vendida:    { label: 'Vendida',    color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',       dot: 'bg-zinc-400' },
}

function formatPrice(price: string, moneda = 'USD') {
  if (!price) return '—'
  
  if (price.includes('US$') || price.includes('RD$')) return price

  let limpio = price.replace(/,/g, '')
  
  if (/\.\d{3}$/.test(limpio)) {
    limpio = limpio.replace(/\./g, '')
  }

  const num = parseFloat(limpio)
  if (isNaN(num)) return price
  
  return new Intl.NumberFormat('es-DO', {
    style: 'currency', 
    currency: moneda === 'DOP' ? 'DOP' : 'USD', 
    maximumFractionDigits: 0,
  }).format(num)
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [propertyId, setPropertyId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params)
      setPropertyId(resolved.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!propertyId) return

    async function fetchProperty() {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (!error && data) {
        setProperty(data)
      } else {
        console.error('Error fetching property:', error)
      }
      setLoading(false)
    }

    fetchProperty()
  }, [propertyId])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Propiedad no encontrada</p>
          <button onClick={() => router.push('/properties')}
            className="px-4 py-2 bg-amber-500 text-black rounded-xl font-bold text-sm">
            Volver
          </button>
        </div>
      </div>
    )
  }

  const imagenes: string[] = (
    property.imagenes && property.imagenes.length > 0
      ? property.imagenes
      : property.imagen_url
      ? [property.imagen_url]
      : []
  ).filter(Boolean)

  const estado = ESTADOS[property.estado] ?? ESTADOS.disponible

  // Construimos el query de búsqueda del mapa según lo que tengamos en base de datos
  const direccionCompleta = [property.location, property.sector, 'Santo Domingo, Republica Dominicana']
    .filter(Boolean)
    .join(', ')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        <button onClick={() => router.push('/properties')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a propiedades
        </button>

        {imagenes.length > 0 ? (
          <div className="space-y-3">
            <div className="relative h-72 md:h-[420px] rounded-2xl overflow-hidden bg-zinc-900">
              <img src={imagenes[activeImg]} alt={property.title}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }} />
              {imagenes.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {activeImg + 1} / {imagenes.length}
                </div>
              )}
              {imagenes.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + imagenes.length) % imagenes.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={() => setActiveImg(i => (i + 1) % imagenes.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagenes.map((url, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-amber-500' : 'border-zinc-800 hover:border-zinc-600'
                    }`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-72 bg-zinc-900 rounded-2xl flex items-center justify-center">
            <svg className="w-16 h-16 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
            </svg>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${estado.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                  {estado.label}
                </span>
                <span className="text-zinc-500 text-xs uppercase tracking-wider bg-zinc-800 px-2.5 py-1 rounded-full font-bold">
                  {property.type}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{property.title}</h1>
              {(property.location || property.sector) && (
                <p className="text-zinc-500 text-sm mt-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[property.location, property.sector].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {(property.recamaras || property.banos || property.estacionamientos || property.m2) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: '🛏', label: 'Recámaras', value: property.recamaras },
                  { icon: '🚿', label: 'Baños', value: property.banos },
                  { icon: '🚗', label: 'Estac.', value: property.estacionamientos },
                  { icon: '📐', label: 'm²', value: property.m2 },
                ].filter(s => s.value != null).map(s => (
                  <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-white font-black text-lg">{s.value}</div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {property.descripcion && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Descripción</h2>
                <p className="text-zinc-300 text-sm leading-relaxed">{property.descripcion}</p>
              </div>
            )}

            {/* SECCIÓN DE GOOGLE MAPS REINCORPORADA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Ubicación en Mapa</h2>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} // Modo oscuro elegante para el mapa
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>

          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sticky top-6">
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Precio</p>
              <p className="text-amber-400 font-black text-3xl mb-1">
                {formatPrice(property.price, property.moneda)}
              </p>
              {property.m2 && property.price && (
                <p className="text-zinc-600 text-xs mb-5">
                  ≈ {formatPrice(
                    String(parseFloat(property.price.replace(/[^0-9.]/g, '')) / property.m2),
                    property.moneda
                  )} / m²
                </p>
              )}
              <button onClick={() => router.push('/properties')}
                className="w-full bg-zinc-800 text-zinc-300 py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">
                ← Volver al listado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}