import { supabase } from '../../lib/supabase'
import { notFound } from 'next/navigation'

const WHATSAPP = '19293056500'

interface Propiedad {
  id: string
  title: string
  type: string
  price: string
  location: string
  sector?: string
  bedrooms?: number
  bathrooms?: number
  estacionamientos?: number
  m2?: number
  descripcion?: string
  image_url?: string
  imagen_url?: string
  moneda?: string
  estado?: string
  status?: string
}

function formatPrice(price: string, moneda = 'USD') {
  const num = parseFloat(price?.replace(/[^0-9.]/g, '') || '0')
  if (isNaN(num) || num === 0) return price || '—'
  return new Intl.NumberFormat('es-DO', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0
  }).format(num)
}

export default async function FichaTecnica({ params }: { params: { id: string } }) {
  const { data: p, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !p) return notFound()

  const precio = formatPrice(p.price, p.moneda || 'USD')
  const foto = p.image_url || p.imagen_url
  const whatsappMsg = encodeURIComponent(
    `Hola, estoy interesado en la propiedad: *${p.title}* en ${p.sector || p.location} a ${precio}. ¿Podría darme más información?`
  )
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-amber-500 font-black text-xl tracking-tight">HOMVI</span>
          <a href={whatsappUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-black transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultar
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Foto principal */}
        {foto ? (
          <img src={foto} alt={p.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl mb-6" />
        ) : (
          <div className="w-full h-64 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-5xl">🏠</span>
          </div>
        )}

        {/* Título y precio */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{p.title}</h1>
            <span className="shrink-0 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase">
              {p.type}
            </span>
          </div>
          {(p.sector || p.location) && (
            <p className="text-zinc-400 text-sm mb-3">📍 {p.sector || p.location}</p>
          )}
          <p className="text-3xl font-black text-amber-400">{precio}</p>
          {(p.estado || p.status) && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
              (p.estado || p.status) === 'disponible' ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {p.estado || p.status}
            </span>
          )}
        </div>

        {/* Características */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {p.recamaras && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">🛏</p>
              <p className="text-white font-black text-lg">{p.recamaras}</p>
              <p className="text-zinc-500 text-xs uppercase">Recámaras</p>
            </div>
          )}
          {p.banos && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">🚿</p>
              <p className="text-white font-black text-lg">{p.banos}</p>
              <p className="text-zinc-500 text-xs uppercase">Baños</p>
            </div>
          )}
          {p.estacionamientos && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">🚗</p>
              <p className="text-white font-black text-lg">{p.estacionamientos}</p>
              <p className="text-zinc-500 text-xs uppercase">Parqueos</p>
            </div>
          )}
          {p.m2 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">📐</p>
              <p className="text-white font-black text-lg">{p.m2}</p>
              <p className="text-zinc-500 text-xs uppercase">m²</p>
            </div>
          )}
        </div>

        {/* Descripción */}
        {p.descripcion && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <h2 className="text-white font-black uppercase text-sm tracking-wider mb-3">Descripción</h2>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{p.descripcion}</p>
          </div>
        )}

        {/* CTA WhatsApp */}
        <a href={whatsappUrl} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Consultar por WhatsApp
        </a>

        <a href="/listings"
          className="block text-center text-zinc-500 hover:text-amber-400 text-xs uppercase tracking-wider transition-colors py-2">
          ← Ver todas las propiedades
        </a>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 mt-8 py-6 text-center">
        <p className="text-zinc-600 text-xs">© 2026 HOMVI · Santo Domingo, RD</p>
      </div>
    </div>
  )
}