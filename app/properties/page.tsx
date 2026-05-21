'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Property = {
  id: string
  title: string
  price: string
  location: string
  type: string
  sector: string
}

const emptyForm = { title: '', price: '', location: '', type: 'APARTAMENTO', sector: '' }

const SECTORES = ['Piantini','Naco','Bella Vista','Evaristo Morales','Serralles','Los Cacicazgos','Arroyo Hondo','Viejo Arroyo Hondo','La Esperilla','El Millon','Mirador Norte','Mirador Sur']

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectorFiltro = searchParams.get('sector') || ''
  const [sectorActivo, setSectorActivo] = useState(sectorFiltro)

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

  async function deleteProperty(id: string) {
    if (!confirm('Eliminar esta propiedad?')) return
    await supabase.from('properties').delete().eq('id', id)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  const propiedadesFiltradas = sectorActivo
    ? properties.filter(p => p.sector === sectorActivo)
    : properties

  if (loading) return <div className="p-4 text-zinc-500">Cargando propiedades...</div>

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-amber-500 tracking-tighter uppercase">PROPIEDADES</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">
            {sectorActivo ? `${propiedadesFiltradas.length} en ${sectorActivo}` : `${properties.length} UNIDADES EN TOTAL`}
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="bg-amber-500 text-black px-3 py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">
          {showForm ? 'X' : '+ Nueva'}
        </button>
      </div>

      {/* FILTRO DE SECTORES */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setSectorActivo('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${!sectorActivo ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          Todos
        </button>
        {SECTORES.map(s => (
          <button key={s} onClick={() => setSectorActivo(sectorActivo === s ? '' : s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${sectorActivo === s ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black text-amber-500 uppercase mb-6">Nueva Propiedad</h2>
            <div className="flex flex-col gap-4">
              <input placeholder="Titulo" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Ubicacion" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <input placeholder="Precio" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                <option>APARTAMENTO</option>
                <option>CASA</option>
                <option>LOCAL</option>
                <option>TERRENO</option>
                <option>OFICINA</option>
              </select>
              <select value={form.sector} onChange={e => setForm({...form, sector: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                <option value="">Sin sector</option>
                {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">Cancelar</button>
              <button onClick={saveProperty} disabled={saving} className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {propiedadesFiltradas.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 col-span-3">
            {sectorActivo ? `No hay propiedades en ${sectorActivo}.` : 'No hay propiedades registradas.'}
          </div>
        ) : (
          propiedadesFiltradas.map((p) => (
            <div key={p.id} onClick={() => router.push('/properties/' + p.id)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-amber-500 transition-all">
              <h3 className="text-white font-bold text-base mb-1">{p.title}</h3>
              <p className="text-zinc-400 text-xs mb-1">{p.location}</p>
              {p.sector && <span className="text-amber-500 text-[10px] uppercase font-bold">{p.sector}</span>}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
                <span className="text-amber-500 font-black">{p.price}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-wider bg-zinc-800 px-2 py-1 rounded">{p.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
