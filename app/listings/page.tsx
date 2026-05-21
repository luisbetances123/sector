'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Propiedad {
  id: string
  title: string
  price: string
  location: string
  sector?: string
  type: string
  bedrooms?: number
  bathrooms?: number
  image_url?: string
  status?: string
}

const SECTORES = ['Todos', 'Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos', 'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millón', 'Mirador Norte', 'Mirador Sur']
const TIPOS = ['Todos', 'Apartamento', 'Casa', 'Villa', 'Local', 'Solar', 'Penthouse']
const WHATSAPP = '19293056500'

export default function ListingsPage() {
  const [properties, setProperties] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('Todos')
  const [tipo, setTipo] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    supabase.from('properties').select('*').then(({ data }) => {
      if (data) setProperties(data)
      setLoading(false)
    })
  }, [])

  const filtradas = properties.filter(p => {
    const matchSector = sector === 'Todos' || (p.sector || '').toLowerCase() === sector.toLowerCase()
    const matchTipo = tipo === 'Todos' || (p.type || '').toLowerCase().includes(tipo.toLowerCase())
    const matchBusqueda = p.title.toLowerCase().includes(busqueda.toLowerCase()) || (p.sector || '').toLowerCase().includes(busqueda.toLowerCase())
    return matchSector && matchTipo && matchBusqueda
  })

  const contactarWhatsApp = (propiedad: Propiedad) => {
    const msg = encodeURIComponent(`Hola, estoy interesado en: ${propiedad.title} en ${propiedad.sector || propiedad.location} a ${propiedad.price}. ¿Podría darme más información?`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">HOMVI</h1>
            <p className="text-xs text-gray-500">Propiedades en Santo Domingo</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contactar
          </a>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o sector..."
              className="flex-1 bg-gray-100 text-gray-800 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400" />
            <select value={sector} onChange={e => setSector(e.target.value)}
              className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400">
              {SECTORES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400">
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-2">{filtradas.length} propiedades encontradas</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando propiedades...</div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hay propiedades disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map(p => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-900 font-bold text-base leading-tight flex-1">{p.title}</h3>
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex-shrink-0">{p.type}</span>
                  </div>
                  {p.sector && (
                    <p className="text-gray-500 text-sm mb-2">📍 {p.sector}</p>
                  )}
                  <div className="flex items-center gap-3 mb-4 text-gray-500 text-sm">
                    {p.bedrooms && <span>🛏 {p.bedrooms} hab.</span>}
                    {p.bathrooms && <span>🚿 {p.bathrooms} baños</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-amber-600 font-black text-xl">{p.price}</p>
                    <button onClick={() => contactarWhatsApp(p)}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white mt-8 py-6 text-center">
        <p className="text-gray-400 text-sm">© 2026 HOMVI · Santo Domingo, RD</p>
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" className="text-green-500 text-sm font-bold mt-1 block hover:underline">
          Contactar agente: +1 (929) 305-6500
        </a>
      </div>
    </div>
  )
}
