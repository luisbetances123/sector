'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Propiedad {
  id: string
  title: string
  price: number
  location: string
  image_url: string | null
  bedrooms: number
  bathrooms: number
  m2: number
  descripcion: string
}

export default function PortalPublico() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [sector, setSector] = useState('')

  useEffect(() => { fetchPropiedades() }, [])

  async function fetchPropiedades() {
    const { data } = await supabase.from('properties').select('*').eq('public', true).order('created_at', { ascending: false })
    if (data) setPropiedades(data)
    setLoading(false)
  }

  const sectores = [...new Set(propiedades.map(p => p.location).filter(Boolean))]
  const filtradas = propiedades.filter(p => {
    const matchBusqueda = !busqueda || p.title?.toLowerCase().includes(busqueda.toLowerCase()) || p.location?.toLowerCase().includes(busqueda.toLowerCase())
    const matchSector = !sector || p.location === sector
    return matchBusqueda && matchSector
  })

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="border-b border-zinc-900 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-white tracking-tighter">SECTOR</span>
          <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full uppercase">Portal</span>
        </div>
        <a href="/landing" className="text-xs text-zinc-500 hover:text-[#CCFF00] font-mono transition-colors">¿Eres realtor? →</a>
      </header>

      <div className="px-6 py-12 max-w-6xl mx-auto">
        <p className="text-xs font-mono text-[#CCFF00] uppercase tracking-widest mb-2">Propiedades disponibles</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-8">Encuentra tu próxima<br />propiedad en RD</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o sector..."
            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-zinc-600 transition-colors" />
          <select value={sector} onChange={e => setSector(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 outline-none min-w-[180px]">
            <option value="">Todos los sectores</option>
            {sectores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {!loading && <p className="text-xs font-mono text-zinc-500 mb-6">{filtradas.length} {filtradas.length === 1 ? 'propiedad' : 'propiedades'} disponibles</p>}

        {loading ? (
          <div className="text-zinc-500 text-sm text-center py-20 font-mono animate-pulse">Cargando propiedades...</div>
        ) : filtradas.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-20">No hay propiedades disponibles.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtradas.map(p => (
              <div key={p.id} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all group">
                <div className="relative h-72 bg-zinc-900 overflow-hidden">
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'} alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.location && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-[#CCFF00] text-[10px] font-mono px-2.5 py-1 rounded-md border border-zinc-800 uppercase tracking-wider">
                      {p.location}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-white text-lg tracking-tight">{p.title}</h3>
                  <p className="text-2xl font-black text-[#CCFF00] font-mono mt-1">US$ {Number(p.price).toLocaleString()}</p>
                  <div className="grid grid-cols-3 gap-2 mt-5 py-4 border-y border-zinc-800 text-center">
                    <div>
                      <span className="block text-white font-mono text-sm font-bold">{p.bedrooms}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">Hab.</span>
                    </div>
                    <div className="border-x border-zinc-800">
                      <span className="block text-white font-mono text-sm font-bold">{p.bathrooms}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">Baños</span>
                    </div>
                    <div>
                      <span className="block text-white font-mono text-sm font-bold">{p.m2}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">m²</span>
                    </div>
                  </div>
                  {p.descripcion && <p className="text-xs text-zinc-400 mt-4 leading-relaxed line-clamp-3">{p.descripcion}</p>}
                  <a href={`/propiedades/${p.id}`}
                    className="mt-5 w-full bg-zinc-900 hover:bg-[#CCFF00] border border-zinc-700 hover:border-[#CCFF00] text-zinc-300 hover:text-black text-xs font-bold py-3 rounded-xl transition-all text-center block">
                    Ver detalles →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-zinc-900 px-6 py-6 mt-12 text-center">
        <p className="text-xs text-zinc-600 font-mono"><span className="text-[#CCFF00]">SECTOR.DO</span> — CRM Inmobiliario para Realtors en República Dominicana</p>
      </footer>
    </div>
  )
}
