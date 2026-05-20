'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Client = {
  id: string
  name: string
  email: string
  phone: string
  status: string
  type: string
  price: string
  initial: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'LEAD', type: '', price: '' })

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (!error && data) setClients(data)
    setLoading(false)
  }

  async function saveClient() {
    if (!form.name.trim()) return
    setSaving(true)
    const initial = form.name.trim()[0].toUpperCase()
    const { error } = await supabase.from('clients').insert([{ ...form, initial }])
    if (!error) {
      setForm({ name: '', email: '', phone: '', status: 'LEAD', type: '', price: '' })
      setShowForm(false)
      fetchClients()
    } else {
      alert('Error: ' + error.message)
    }
    setSaving(false)
  }

  async function updateClient() {
    if (!editForm) return
    setSaving(true)
    const initial = editForm.name.trim()[0].toUpperCase()
    const { error } = await supabase.from('clients').update({ ...editForm, initial }).eq('id', editForm.id)
    if (!error) {
      setEditing(false)
      setSelected({ ...editForm, initial })
      fetchClients()
    }
    setSaving(false)
  }

  async function deleteClient(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clients').delete().eq('id', id)
    setSelected(null)
    fetchClients()
  }

  const statusColors: Record<string, string> = {
    LEAD: 'bg-zinc-700 text-zinc-300',
    BUSCANDO: 'bg-blue-900 text-blue-300',
    'EN OFERTA': 'bg-amber-900 text-amber-300',
    CIERRE: 'bg-green-900 text-green-300',
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-amber-500 tracking-tighter uppercase">MIS CLIENTES</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{clients.length} REGISTROS</p>
        </div>
        <div className="flex gap-2">
          <button className="hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-amber-500 transition-all">
            Importar Excel
          </button>
          <button onClick={() => setShowForm(true)} className="bg-amber-500 text-black px-3 py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">
            + Nuevo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black text-amber-500 uppercase mb-6">Nuevo Cliente</h2>
            <div className="flex flex-col gap-4">
              <input placeholder="Nombre *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Tipo de propiedad (Casa, Apto...)" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Precio (ej: $80,000)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                <option>LEAD</option>
                <option>BUSCANDO</option>
                <option>EN OFERTA</option>
                <option>CIERRE</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">Cancelar</button>
              <button onClick={saveClient} disabled={saving} className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div className={`grid gap-4 transition-all ${selected ? 'grid-cols-1 flex-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full'}`}>
          {loading ? (
            <div className="text-zinc-500 text-center py-20">Cargando clientes...</div>
          ) : (
            clients.map((c) => (
              <div key={c.id} onClick={() => { setSelected(c); setEditing(false) }} className={`bg-zinc-900/40 border p-4 rounded-2xl hover:border-amber-500 transition-all cursor-pointer ${selected?.id === c.id ? 'border-amber-500' : 'border-zinc-800'}`}>
                <div className="flex items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold mr-3 flex-shrink-0">{c.initial}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{c.name}</div>
                    <div className="text-zinc-500 text-xs truncate">{c.email}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[c.status] || 'bg-zinc-700 text-zinc-300'}`}>{c.status}</span>
                  <span className="text-amber-500 font-bold text-sm">{c.price}</span>
                </div>
                {c.type && <div className="text-zinc-500 text-xs mt-2">{c.type}</div>}
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="hidden md:block w-80 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 h-fit sticky top-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center text-xl font-black">{selected.initial}</div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl">✕</button>
            </div>
            {!editing ? (
              <>
                <h2 className="text-xl font-black text-white mb-1">{selected.name}</h2>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[selected.status] || 'bg-zinc-700 text-zinc-300'}`}>{selected.status}</span>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  {selected.email && <div><span className="text-zinc-500">Email</span><div className="text-white">{selected.email}</div></div>}
                  {selected.phone && <div><span className="text-zinc-500">Teléfono</span><div className="text-white">{selected.phone}</div></div>}
                  {selected.type && <div><span className="text-zinc-500">Propiedad</span><div className="text-white">{selected.type}</div></div>}
                  {selected.price && <div><span className="text-zinc-500">Precio</span><div className="text-amber-500 font-bold">{selected.price}</div></div>}
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => { setEditing(true); setEditForm(selected) }} className="flex-1 bg-amber-500 text-black py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">Editar</button>
                  <button onClick={() => deleteClient(selected.id)} className="bg-red-900 text-red-300 px-3 py-2 rounded-xl text-xs hover:bg-red-800 transition-all">Eliminar</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-amber-500 uppercase mb-4">Editar Cliente</h2>
                <div className="flex flex-col gap-3">
                  <input value={editForm?.name} onChange={e => setEditForm({...editForm!, name: e.target.value})} className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <input placeholder="Email" value={editForm?.email} onChange={e => setEditForm({...editForm!, email: e.target.value})} className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <input placeholder="Teléfono" value={editForm?.phone} onChange={e => setEditForm({...editForm!, phone: e.target.value})} className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <input placeholder="Tipo" value={editForm?.type} onChange={e => setEditForm({...editForm!, type: e.target.value})} className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <input placeholder="Precio" value={editForm?.price} onChange={e => setEditForm({...editForm!, price: e.target.value})} className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm" />
                  <select value={editForm?.status} onChange={e => setEditForm({...editForm!, status: e.target.value})} className="bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none text-sm">
                    <option>LEAD</option>
                    <option>BUSCANDO</option>
                    <option>EN OFERTA</option>
                    <option>CIERRE</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditing(false)} className="flex-1 bg-zinc-800 text-white py-2 rounded-xl font-bold text-xs hover:bg-zinc-700 transition-all">Cancelar</button>
                  <button onClick={updateClient} disabled={saving} className="flex-1 bg-amber-500 text-black py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all disabled:opacity-50">{saving ? '...' : 'Guardar'}</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
