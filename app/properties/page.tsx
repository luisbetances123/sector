cat > /Users/luisbetances/homvi/app/properties/page.tsx << 'ENDOFFILE'
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Property = {
  id: string
  title: string
  price: string
  location: string
  type: string
}

const emptyForm = { title: '', price: '', location: '', type: 'APARTAMENTO' }

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Property | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Property | null>(null)
  const router = useRouter()

  useEffect(() => { fetchProperties() }, [])

  async function fetchProperties() {
    const { data, error } = await supabase.from('properties').select('*')
    if (!error && data) setProperties(data)
    setLoading(false)
  }

  async function saveProperty() {
    if (!form.title.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('properties').insert([{ ...form }]).select().single()
    if (!error && data) {
      setProperties(prev => [data, ...prev])
      setForm(emptyForm)
      setShowForm(false)
    } else {
      alert('Error: ' + error?.message)
    }
    setSaving(false)
  }

  async function updateProperty() {
    if (!editForm) return
    setSaving(true)
    const { error } = await supabase.from('properties').update({ ...editForm }).eq('id', editForm.id)
    if (!error) {
      setProperties(prev => prev.map(p => p.id === editForm.id ? editForm : p))
      setSelected(editForm)
      setEditing(false)
    }
    setSaving(false)
  }

  async function deleteProperty(id: string) {
    if (!confirm('¿Eliminar esta propiedad?')) return
    await supabase.from('properties').delete().eq('id', id)
    setProperties(prev => prev.filter(p => p.id !== id))
    setSelected(null)
  }

  if (loading) return <div className="p-4 text-zinc-500">Cargando propiedades...</div>

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-amber-500 tracking-tighter uppercase">PROPIEDADES</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{properties.length} UNIDADES EN TOTAL</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-amber-500 text-black px-3 py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">
          {showForm ? '✕' : '+ Nueva'}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black text-amber-500 uppercase mb-6">Nueva Propiedad</h2>
            <div className="flex flex-col gap-4">
              <input placeholder="Título *" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Ubicación" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Precio (ej: $120,000)" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                <option>APARTAMENTO</option>
                <option>CASA</option>
                <option>LOCAL</option>
                <option>TERRENO</option>
                <option>OFICINA</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">Cancelar</button>
              <button onClick={saveProperty} disabled={saving}
                className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div className={`grid gap-4 transition-all ${selected ? 'grid-cols-1 flex-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full'}`}>
          {properties.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
              No hay propiedades registradas aún.
            </div>
          ) : (
            properties.map((p) => (
              <div key={p.id} onClick={() => { setSelected(p); setEditing(false) }}
                className={`bg-zinc-900 border rounded-2xl p-4 cursor-pointer transition-all ${selected?.id === p.id ? 'border-amber-500' : 'border-zinc-800 hover:border-zinc-600'}`}>
                <h3 className="text-white font-bold text-base mb-1">{p.title}</h3>
                <p className="text-zinc-400 text-xs mb-3">{p.location}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
                  <span className="text-amber-500 font-black">{p.price}</span>
                  <span className="text-zinc-500 text-xs uppercase tracking-wider bg-zinc-800 px-2 py-1 rounded">{p.type}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="hidden md:block w-80 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 h-fit sticky top-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-black text-amber-500 uppercase">Detalle</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>
            {!editing ? (
              <>
                <h3 className="text-xl font-black text-white mb-1">{selected.title}</h3>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase">{selected.type}</span>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  {selected.location && <div><span className="text-zinc-500">Ubicación</span><div className="text-white">{selected.location}</div></div>}
                  {selected.price && <div><span className="text-zinc-500">Precio</span><div className="text-amber-500 font-bold">{selected.price}</div></div>}
                </div>
                <div className="flex flex-col gap-2 mt-6">
                  <button onClick={() => router.push(`/properties/${selected.id}`)}
                    className="w-full bg-zinc-700 text-white py-2 rounded-xl font-black text-xs uppercase hover:bg-zinc-600 transition-all">
                    Ver detalle + fotos
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(true); setEditForm(selected) }}
                      className="flex-1 bg-amber-500 text-black py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">Editar</button>
                    <button onClick={() => deleteProperty(selected.id)}
                      className="bg-red-900 text-red-300 px-3 py-2 rounded-xl text-xs hover:bg-red-800 transition-all">Eliminar</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-amber-500 uppercase mb-4">Editar</h2>
                <div className="flex flex-col gap-3">
                  <input value={editForm?.title} onChange={e => setEditForm({...editForm!, title: e.target.value})}
                    className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <input placeholder="Ubicación" value={editForm?.location} onChange={e => setEditForm({...editForm!, location: e.target.value})}
                    className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <input placeholder="Precio" value={editForm?.price} onChange={e => setEditForm({...editForm!, price: e.target.value})}
                    className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <select value={editForm?.type} onChange={e => setEditForm({...editForm!, type: e.target.value})}
                    className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm">
                    <option>APARTAMENTO</option>
                    <option>CASA</option>
                    <option>LOCAL</option>
                    <option>TERRENO</option>
                    <option>OFICINA</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditing(false)}
                    className="flex-1 bg-zinc-800 text-white py-2 rounded-xl font-bold text-xs hover:bg-zinc-700 transition-all">Cancelar</button>
                  <button onClick={updateProperty} disabled={saving}
                    className="flex-1 bg-amber-500 text-black py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all disabled:opacity-50">
                    {saving ? '...' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
ENDOFFILE