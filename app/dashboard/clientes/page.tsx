'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { UserCircle, Plus, Phone, Mail, Trash2 } from 'lucide-react'

interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  presupuesto: number | null
  zona_interes: string | null
  notas: string | null
  temperatura: string
  origen: string | null
  created_at: string
}

const TEMPERATURAS = ['nuevo', 'activo', 'estancado']
const ORIGENES = ['Instagram', 'WhatsApp', 'Referido', 'Portal web', 'Otro']

const badgeTemp = (t: string) => {
  if (t === 'activo') return 'bg-[#CCFF00]/20 text-[#CCFF00]'
  if (t === 'estancado') return 'bg-zinc-700 text-zinc-400'
  return 'bg-amber-500/20 text-amber-400'
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '', presupuesto: '',
    zona_interes: '', notas: '', temperatura: 'nuevo', origen: ''
  })

  useEffect(() => { cargarClientes() }, [])

  async function cargarClientes() {
    setLoading(true)
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    setClientes(data || [])
    setLoading(false)
  }

  async function handleGuardar() {
    if (!form.nombre.trim()) return
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }
    await supabase.from('clientes').insert({
      broker_id: user.id,
      nombre: form.nombre,
      telefono: form.telefono || null,
      email: form.email || null,
      presupuesto: form.presupuesto ? Number(form.presupuesto) : null,
      zona_interes: form.zona_interes || null,
      notas: form.notas || null,
      temperatura: form.temperatura,
      origen: form.origen || null,
    })
    setForm({ nombre: '', telefono: '', email: '', presupuesto: '', zona_interes: '', notas: '', temperatura: 'nuevo', origen: '' })
    setMostrarForm(false)
    setGuardando(false)
    cargarClientes()
  }

  async function handleEliminar(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    cargarClientes()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen text-zinc-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#CCFF00] font-mono uppercase tracking-widest mb-1">Privado</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Mis Clientes</h1>
          <p className="text-sm text-zinc-500 mt-1">Solo tú puedes ver esta información.</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 bg-[#CCFF00] text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#b8e600] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-white">Nuevo cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nombre *</label>
              <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]"
                placeholder="Ej. María Rodríguez" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]"
                placeholder="809-000-0000" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]"
                placeholder="email@ejemplo.com" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Presupuesto (USD)</label>
              <input type="number" value={form.presupuesto} onChange={e => setForm({...form, presupuesto: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]"
                placeholder="150000" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Zona de interés</label>
              <input value={form.zona_interes} onChange={e => setForm({...form, zona_interes: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]"
                placeholder="Piantini, Naco, Punta Cana..." />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Origen</label>
              <select value={form.origen} onChange={e => setForm({...form, origen: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]">
                <option value="">Seleccionar...</option>
                {ORIGENES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Temperatura</label>
              <select value={form.temperatura} onChange={e => setForm({...form, temperatura: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]">
                {TEMPERATURAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Notas</label>
              <input value={form.notas} onChange={e => setForm({...form, notas: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#CCFF00]"
                placeholder="Busca 3 habitaciones, zona este..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setMostrarForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancelar</button>
            <button onClick={handleGuardar} disabled={guardando || !form.nombre.trim()}
              className="px-4 py-2 text-sm bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500 text-sm">Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tienes clientes registrados todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientes.map(c => (
            <div key={c.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-white font-semibold text-sm">{c.nombre}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeTemp(c.temperatura)}`}>{c.temperatura}</span>
                  {c.origen && <span className="text-[10px] text-zinc-500 uppercase">{c.origen}</span>}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {c.telefono && (
                    <a href={`tel:${c.telefono}`} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                      <Phone className="w-3 h-3" />{c.telefono}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                      <Mail className="w-3 h-3" />{c.email}
                    </a>
                  )}
                  {c.presupuesto && <span className="text-xs text-[#CCFF00]">US$ {c.presupuesto.toLocaleString()}</span>}
                  {c.zona_interes && <span className="text-xs text-zinc-500">{c.zona_interes}</span>}
                </div>
                {c.notas && <p className="text-xs text-zinc-600 mt-1 truncate">{c.notas}</p>}
              </div>
              <button onClick={() => handleEliminar(c.id)} className="text-zinc-700 hover:text-red-400 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
