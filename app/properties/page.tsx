'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../app/lib/supabase'

interface Propiedad {
  id: string
  nombre: string
  ubicacion: string
  precio: string
  area: string
  tipo: string
  imagen: string
}

const tiposDisponibles = ['Villa', 'Penthouse', 'Apartamento', 'Casa', 'Local', 'Terreno']

export default function PropertiesPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Propiedad | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [precio, setPrecio] = useState('')
  const [area, setArea] = useState('')
  const [tipo, setTipo] = useState('Apartamento')
  const [imagen, setImagen] = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    const { data } = await supabase.from('propiedades').select('*').order('nombre')
    if (data) setPropiedades(data)
  }

  const abrirNueva = () => {
    setEditando(null)
    setNombre(''); setUbicacion(''); setPrecio(''); setArea(''); setTipo('Apartamento'); setImagen('')
    setModal(true)
  }

  const abrirEditar = (prop: Propiedad) => {
    setEditando(prop)
    setNombre(prop.nombre); setUbicacion(prop.ubicacion); setPrecio(prop.precio)
    setArea(prop.area); setTipo(prop.tipo); setImagen(prop.imagen)
    setModal(true)
  }

  const guardar = async () => {
    if (!nombre.trim() || !ubicacion.trim() || !precio.trim()) return
    setGuardando(true)
    const datos = { nombre, ubicacion, precio, area, tipo, imagen }
    if (editando) {
      await supabase.from('propiedades').update(datos).eq('id', editando.id)
    } else {
      await supabase.from('propiedades').insert({ ...datos, id: Date.now().toString() })
    }
    await cargar()
    setModal(false)
    setGuardando(false)
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta propiedad?')) return
    await supabase.from('propiedades').delete().eq('id', id)
    setPropiedades(prev => prev.filter(p => p.id !== id))
  }

  const filtradas = propiedades.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.ubicacion.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Todos' || p.tipo === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-light italic">Catálogo <span className="text-[#d4af37] not-italic font-bold">Homvi</span></h1>
        <div className="flex items-center gap-4">
          <button onClick={abrirNueva}
            className="bg-[#d4af37] text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/90 transition-all">
            + Nueva Propiedad
          </button>
          <Link href="/dashboard" className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-all">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input type="text" placeholder="Buscar propiedad o ubicación..."
          className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex-1 outline-none focus:border-[#d4af37] transition-all text-white"
          onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {['Todos', 'Villa', 'Penthouse', 'Apartamento', 'Casa', 'Terreno'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs uppercase font-bold border transition-all ${
                filter === cat ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-sm mb-4">No hay propiedades aún</p>
          <button onClick={abrirNueva} className="text-[#d4af37] text-xs hover:underline">
            + Agregar primera propiedad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtradas.map(prop => (
            <div key={prop.id} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[2.5rem] hover:border-[#d4af37]/30 transition-all group flex flex-col">
              <div className="h-64 w-full mb-6 overflow-hidden rounded-[2rem] relative">
                {prop.imagen ? (
                  <img src={prop.imagen} alt={prop.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-600 text-sm">Sin imagen</div>
                )}
                <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  {prop.tipo}
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => abrirEditar(prop)}
                    className="w-8 h-8 bg-black/60 hover:bg-[#d4af37]/80 rounded-full flex items-center justify-center text-white text-xs transition-all">
                    ✏️
                  </button>
                  <button onClick={() => eliminar(prop.id)}
                    className="w-8 h-8 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs transition-all">
                    ✕
                  </button>
                </div>
              </div>
              <div className="px-2 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold uppercase tracking-tighter text-sm">{prop.nombre}</h3>
                  <span className="text-[#d4af37] font-mono text-sm">{prop.precio}</span>
                </div>
                <p className="text-gray-300 text-xs italic mb-6">{prop.ubicacion} • {prop.area}</p>
                <Link href={`/properties/${prop.id}`} className="mt-auto">
                  <button className="w-full py-4 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#d4af37] hover:text-black transition-all">
                    Ver Detalles
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editando ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
              <button onClick={() => setModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-2 block">Nombre *</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej: Penthouse Bella Vista"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" autoFocus />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Ubicación *</label>
                <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="ej: Piantini, Santo Domingo"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Precio *</label>
                  <input type="text" value={precio} onChange={(e) => setPrecio(e.target.value)}
                    placeholder="ej: $1.2M"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Área</label>
                  <input type="text" value={area} onChange={(e) => setArea(e.target.value)}
                    placeholder="ej: 450m²"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Tipo</label>
                <div className="flex gap-2 flex-wrap">
                  {tiposDisponibles.map(t => (
                    <button key={t} onClick={() => setTipo(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        tipo === t ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-400'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">URL de imagen</label>
                <input type="text" value={imagen} onChange={(e) => setImagen(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
              </div>
              {imagen && (
                <img src={imagen} alt="preview" className="w-full h-32 object-cover rounded-xl"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              )}
              <button onClick={guardar}
                disabled={!nombre.trim() || !ubicacion.trim() || !precio.trim() || guardando}
                className="w-full py-3 rounded-2xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                {guardando ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Agregar Propiedad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
