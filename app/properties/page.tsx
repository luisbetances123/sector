'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Property = {
  id: string
  title: string
  type: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  status: string
  initial: string
}

const statusColors: Record<string, string> = {
  DISPONIBLE: 'bg-green-900 text-green-300',
  RESERVADA: 'bg-amber-900 text-amber-300',
  VENDIDA: 'bg-zinc-700 text-zinc-400',
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Property | null>(null)
  const [form, setForm] = useState({ title: '', type: '', price: '', location: '', bedrooms: '', bathrooms: '', status: 'DISPONIBLE' })

  useEffect(() => { fetchProperties() }, [])

  async function fetchProperties() {
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (!error && data) setProperties(data)
    setLoading(false)
  }

  async function saveProperty() {
    if (!form.title.trim()) return
    setSaving(true)
    const initial = form.title.trim()[0].toUpperCase()
    const { error } = await supabase.from('properties').insert([{
      ...form,
      initial,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
    }])
    if (!error) {
      setForm({ title: '', type: '', price: '', location: '', bedrooms: '', bathrooms: '', status: 'DISPONIBLE' })
      setShowForm(false)
      fetchProperties()
    }
    setSaving(false)
  }

  async function deleteProperty(id: string) {
    if (!confirm('¿Eliminar esta propiedad?')) return
    await supabase.from('properties').delete().eq('id', id)
    setSelected(null)
    fetchProperties()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">PROPIEDADES</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{properties.length} REGISTROS</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">
          + Nueva Propiedad
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-black text-amber-500 uppercase mb-6">Nueva Propiedad</h2>
            <div className="flex flex-col gap-4">
              <input placeholder="Título *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Tipo (Casa, Apto, Penthouse...)" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Precio (ej: $120,000)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Ubicación" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <div className="flex gap-3">
                <input placeholder="Habitaciones" type="number" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none flex-1" />
                <input placeholder="Baños" type="number" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none flex-1" />
              </div>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                <option>DISPONIBLE</option>
                <option>RESERVADA</option>
                <option>VENDIDA</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">Cancelar</button>
              <button onClick={saveProperty} disabled={saving} className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div className={`grid gap-6 transition-all ${selected ? 'grid-cols-1 md:grid-cols-2 flex-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full'}`}>
          {loading ? (
            <div className="text-zinc-500 text-center py-20 col-span-3">Cargando propiedades...</div>
          ) : properties.length === 0 ? (
            <div className="text-zinc-500 text-center py-20 col-span-3">No hay propiedades aún. ¡Agrega la primera!</div>
          ) : (
            properties.map((p) => (
              <div key={p.id} onClick={() => setSelected(p)} className={`bg-zinc-900/40 border p-6 rounded-2xl hover:border-amber-500 transition-all cursor-pointer ${selected?.id === p.id ? 'border-amber-500' : 'border-zinc-800'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold text-lg">{p.initial}</div>
                    <div>
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-zinc-500 text-xs">{p.type}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[p.status] || 'bg-zinc-700 text-zinc-300'}`}>{p.status}</span>
                </div>
                {p.location && <div className="text-zinc-400 text-xs mb-3">📍 {p.location}</div>}
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 text-zinc-500 text-xs">
                    {p.bedrooms > 0 && <span>🛏 {p.bedrooms}</span>}
                    {p.bathrooms > 0 && <span>🚿 {p.bathrooms}</span>}
                  </div>
                  <span className="text-amber-500 font-bold">{p.price}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="w-80 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 h-fit sticky top-8">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500 text-black flex items-center justify-center text-2xl font-black">{selected.initial}</div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>
            <h2 className="text-xl font-black text-white mb-1">{selected.title}</h2>
            <span className={`text-xs px-2 py-1 rounded ${statusColors[selected.status]}`}>{selected.status}</span>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {selected.type && <div><span className="text-zinc-500">Tipo</span><div className="text-white">{selected.type}</div></div>}
              {selected.location && <div><span className="text-zinc-500">Ubicación</span><div className="text-white">{selected.location}</div></div>}
              {selected.price && <div><span className="text-zinc-500">Precio</span><div className="text-amber-500 font-bold text-lg">{selected.price}</div></div>}
              <div className="flex gap-4">
                {selected.bedrooms > 0 && <div><span className="text-zinc-500">Hab.</span><div className="text-white font-bold">{selected.bedrooms}</div></div>}
                {selected.bathrooms > 0 && <div><span className="text-zinc-500">Baños</span><div className="text-white font-bold">{selected.bathrooms}</div></div>}
              </div>
            </div>
            <button onClick={() => deleteProperty(selected.id)} className="w-full mt-6 bg-red-900 text-red-300 py-2 rounded-xl text-xs hover:bg-red-800 transition-all">Eliminar Propiedad</button>
          </div>
        )}
      </div>
    </div>
  )
}
