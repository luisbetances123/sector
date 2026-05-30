'use client'
import { useEffect, useState, useRef } from 'react'
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

type PropertyImage = {
  id: string
  property_id: string
  url: string
  orden: number
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

export default function PropertyDetailPage({ params }: { params: any }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const id = typeof params.id === 'string' ? params.id : (await params).id
      const [{ data: prop }, { data: imgs }] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id).single(),
        supabase.from('property_images').select('*').eq('property_id', id).order('orden'),
      ])
      if (prop) setProperty(prop)
      if (imgs) setImages(imgs)
      setLoading(false)
    }
    load()
  }, [params])

  const allImages = images.length > 0
    ? images.map(i => i.url)
    : property?.imagen_url ? [property.imagen_url] : []

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !property) return
    setUploading(true)

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `${property.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploaded, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) { console.error(uploadError); continue }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(uploaded.path)

      const { data: imgRecord } = await supabase
        .from('property_images')
        .insert({ property_id: property.id, url: publicUrl, orden: images.length })
        .select()
        .single()

      if (imgRecord) {
        setImages(prev => {
          const updated = [...prev, imgRecord]
          // Si es la primera foto, guardarla como imagen_url principal
          if (updated.length === 1) {
            supabase
              .from('properties')
              .update({ imagen_url: publicUrl })
              .eq('id', property.id)
              .then(() => {
                setProperty(p => p ? { ...p, imagen_url: publicUrl } : p)
              })
          }
          return updated
        })
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  async function handleDeleteImage(img: PropertyImage) {
    if (!confirm('¿Eliminar esta foto?')) return
    setDeletingId(img.id)
    const path = img.url.split('/property-images/')[1]
    if (path) await supabase.storage.from('property-images').remove([path])
    await supabase.from('property_images').delete().eq('id', img.id)
    setImages(prev => prev.filter(i => i.id !== img.id))
    setActiveImg(0)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl animate-pulse space-y-4">
        <div className="h-80 bg-zinc-800 rounded-2xl" />
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

      {/* Galería */}
      <div className="mb-6">
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 mb-3">
          {allImages.length > 0 ? (
            <>
              <img src={allImages[activeImg]} alt={property.title} className="w-full h-full object-cover" />
              {images.length > 0 && images[activeImg] && (
                <button
                  onClick={() => handleDeleteImage(images[activeImg])}
                  disabled={deletingId === images[activeImg]?.id}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold uppercase rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deletingId === images[activeImg]?.id ? 'Eliminando...' : 'Eliminar foto'}
                </button>
              )}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="absolute bottom-3 right-3 text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg font-bold">
                    {activeImg + 1} / {allImages.length}
                  </span>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-14 h-14 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21V12h6v9" />
              </svg>
            </div>
          )}
        </div>

        {/* Thumbnails + subir */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveImg(i)}
              className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-amber-500' : 'border-zinc-700 hover:border-zinc-500'}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 w-20 h-16 rounded-xl border-2 border-dashed border-zinc-700 hover:border-amber-500 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50 group"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-zinc-500 group-hover:text-amber-500 text-[10px] uppercase font-bold transition-colors">Foto</span>
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Info */}
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

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <span className="text-3xl font-black text-amber-400">
          {formatPrice(property.price, property.moneda)}
        </span>
        <span className="text-zinc-500 text-xs uppercase tracking-wider bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-lg font-bold">
          {property.type}
        </span>
        <button
          onClick={() => {
            const url = `${window.location.origin}/listings/${property.id}`
            const msg = encodeURIComponent(`🏠 *${property.title}*\n📍 ${property.sector || property.location}\n💰 ${formatPrice(property.price, property.moneda)}\n\nVer ficha completa: ${url}`)
            window.open(`https://wa.me/?text=${msg}`, '_blank')
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-black uppercase transition-all"
        >
          💬 Compartir Ficha
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/listings/${property.id}`
            navigator.clipboard.writeText(url)
            alert('Enlace copiado!')
          }}
          className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase transition-all"
        >
          Copiar enlace
        </button>
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
{/* Google Maps */}
{(property.location || property.sector) && (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
    <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest p-5 pb-0">Ubicación</h2>
    <div className="p-5">
      <iframe
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: '12px' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(`${property.location || ''} ${property.sector || ''} Santo Domingo República Dominicana`)}`}
      />
    </div>
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