'use client'
import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase } from '../lib/supabase'

type Client = {
  id: string
  name: string
  email: string
  status: string
  type: string
  price: string
  initial: string
}

const COLUMNS = ['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']

const colColors: Record<string, string> = {
  LEAD: 'border-zinc-600',
  BUSCANDO: 'border-blue-700',
  'EN OFERTA': 'border-amber-600',
  CIERRE: 'border-green-600',
}

const badgeColors: Record<string, string> = {
  LEAD: 'bg-zinc-700 text-zinc-300',
  BUSCANDO: 'bg-blue-900 text-blue-300',
  'EN OFERTA': 'bg-amber-900 text-amber-300',
  CIERRE: 'bg-green-900 text-green-300',
}

const emptyForm = { name: '', email: '', phone: '', type: '', price: '', initial: '', status: 'LEAD' }

export default function PipelinePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (!error && data) setClients(data)
    setLoading(false)
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    const newStatus = destination.droppableId
    setClients(prev => prev.map(c => c.id === draggableId ? { ...c, status: newStatus } : c))
    await supabase.from('clients').update({ status: newStatus }).eq('id', draggableId)
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setFormError(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('clients').insert({
      name: form.name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      type: form.type || null,
      price: form.price || null,
      initial: form.initial || form.name.slice(0, 2).toUpperCase(),
      status: form.status,
      owner_id: user?.id,
    }).select().single()
    setSaving(false)
    if (error) { setFormError(error.message); return }
    if (data) setClients(prev => [data, ...prev])
    setForm(emptyForm)
    setShowForm(false)
  }

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const byStatus = (status: string) => clients.filter(c => c.status === status)

  if (loading) return <div className="p-4 text-zinc-500">Cargando pipeline...</div>

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-amber-500 tracking-tighter uppercase">PIPELINE</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{clients.length} CLIENTES EN TOTAL</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all uppercase">
          {showForm ? 'X' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddClient} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 mb-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Nuevo cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">Nombre *</label>
              <input required value={form.name} onChange={set('name')} placeholder="Juan Garcia" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="juan@email.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">Telefono</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+1 809 000 0000" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">Tipo</label>
              <input value={form.type} onChange={set('type')} placeholder="Comprador..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">Precio</label>
              <input value={form.price} onChange={set('price')} placeholder="$80,000" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-zinc-400 text-xs uppercase tracking-wider block mb-1">Etapa</label>
              <select value={form.status} onChange={set('status')} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
          </div>
          {formError && <p className="text-red-400 text-xs mb-3">{formError}</p>}
          <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl uppercase transition-all">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(col => (
            <div key={col} className={`bg-zinc-900/50 border ${colColors[col]} rounded-2xl p-4`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`text-xs font-black px-2 py-1 rounded ${badgeColors[col]}`}>{col}</span>
                <span className="text-zinc-500 text-xs">{byStatus(col).length}</span>
              </div>
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`min-h-32 rounded-xl transition-all ${snapshot.isDraggingOver ? 'bg-zinc-800/50' : ''}`}>
                    {byStatus(col).map((c, index) => (
                      <Draggable key={c.id} draggableId={c.id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 cursor-grab transition-all ${snapshot.isDragging ? 'shadow-lg shadow-amber-500/20 border-amber-500' : 'hover:border-zinc-600'}`}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-sm">{c.initial}</div>
                              <div className="font-bold text-white text-sm">{c.name}</div>
                            </div>
                            {c.type && <div className="text-zinc-500 text-xs mb-1">{c.type}</div>}
                            {c.price && <div className="text-amber-500 font-bold text-sm">{c.price}</div>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
