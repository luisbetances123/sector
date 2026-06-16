'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Mensaje {
  id: string
  cliente_id: string | null
  canal: string
  direccion: string
  mensaje: string
  leido: boolean
  created_at: string
  cliente?: { name: string; phone: string }
}

interface Cliente {
  id: string
  name: string
  phone: string
}

const CANALES = ['whatsapp', 'instagram', 'facebook', 'email', 'llamada']
const CANAL_COLORS: Record<string, string> = {
  whatsapp: 'bg-green-500/10 text-green-400 border-green-500/20',
  instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  email: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  llamada: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function InboxPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filtroCanal, setFiltroCanal] = useState('todos')
  const [filtroLeido, setFiltroLeido] = useState('todos')
  const [form, setForm] = useState({
    cliente_id: '',
    canal: 'whatsapp',
    direccion: 'entrante',
    mensaje: ''
  })

  useEffect(() => {
    fetchMensajes()
    fetchClientes()
  }, [])

  async function fetchMensajes() {
    const { data } = await supabase
      .from('inbox')
      .select('*, cliente:clients(name, phone)')
      .order('created_at', { ascending: false })
    if (data) setMensajes(data)
    setLoading(false)
  }

  async function fetchClientes() {
    const { data } = await supabase.from('clients').select('id, name, phone').order('name')
    if (data) setClientes(data)
  }

  async function registrar() {
    if (!form.mensaje.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('inbox').insert([{
      cliente_id: form.cliente_id || null,
      canal: form.canal,
      direccion: form.direccion,
      mensaje: form.mensaje,
      leido: true,
      user_id: user?.id
    }])
    if (!error) {
      setForm({ cliente_id: '', canal: 'whatsapp', direccion: 'entrante', mensaje: '' })
      setShowForm(false)
      fetchMensajes()
    }
    setSaving(false)
  }

  async function toggleLeido(id: string, leido: boolean) {
    await supabase.from('inbox').update({ leido: !leido }).eq('id', id)
    fetchMensajes()
  }

  async function eliminar(id: string) {
    await supabase.from('inbox').delete().eq('id', id)
    fetchMensajes()
  }

  const filtrados = mensajes.filter(m => {
    const matchCanal = filtroCanal === 'todos' || m.canal === filtroCanal
    const matchLeido = filtroLeido === 'todos' || (filtroLeido === 'no_leido' ? !m.leido : m.leido)
    return matchCanal && matchLeido
  })

  const noLeidos = mensajes.filter(m => !m.leido).length

  const formatFecha = (str: string) => new Date(str).toLocaleDateString('es-DO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6 flex justify-between items-end">
        <div>
          <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Comunicaciones</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Conversaciones</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-5 py-3 hover:bg-[#b8e600] transition-colors">
          + Nueva Conversación
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Sin leer</p>
          <p className="text-3xl font-black text-[#CCFF00] mt-1">{noLeidos}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Total</p>
          <p className="text-3xl font-black text-white mt-1">{mensajes.length}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">WhatsApp</p>
          <p className="text-3xl font-black text-green-400 mt-1">{mensajes.filter(m => m.canal === 'whatsapp').length}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Instagram</p>
          <p className="text-3xl font-black text-pink-400 mt-1">{mensajes.filter(m => m.canal === 'instagram').length}</p>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-mono text-white uppercase tracking-wider">Nueva Conversación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] font-mono text-white uppercase">Cliente</label>
              <select value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none">
                <option value="">Sin cliente asignado</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-white uppercase">Canal</label>
              <select value={form.canal} onChange={e => setForm({...form, canal: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none">
                {CANALES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-white uppercase">Dirección</label>
              <select value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none">
                <option value="entrante">Entrante</option>
                <option value="saliente">Saliente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-mono text-white uppercase">Mensaje / Resumen</label>
            <textarea value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})}
              rows={3} placeholder="Resumen de la conversación..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none resize-none placeholder-zinc-600" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="text-white text-xs px-4 py-2">Cancelar</button>
            <button onClick={registrar} disabled={saving || !form.mensaje.trim()}
              className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-6 py-2.5 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex gap-3 flex-wrap">
        <select value={filtroCanal} onChange={e => setFiltroCanal(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none">
          <option value="todos">Todos los canales</option>
          {CANALES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={filtroLeido} onChange={e => setFiltroLeido(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none">
          <option value="todos">Todos</option>
          <option value="no_leido">Sin leer</option>
          <option value="leido">Leídos</option>
        </select>
        <span className="text-white text-xs self-center font-mono">{filtrados.length} mensajes</span>
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="text-white text-sm text-center py-10">Cargando conversaciones...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-white text-sm text-center py-10">No hay mensajes. Registra el primero.</div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(m => (
            <div key={m.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${!m.leido ? 'border-[#CCFF00]/20 bg-[#CCFF00]/5' : 'border-zinc-800 bg-zinc-950'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${CANAL_COLORS[m.canal] || 'bg-zinc-900 text-white border-zinc-800'}`}>
                    {m.canal}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${m.direccion === 'entrante' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {m.direccion === 'entrante' ? '← Entrante' : '→ Saliente'}
                  </span>
                  {m.cliente && (
                    <span className="text-[10px] font-mono text-white">{m.cliente.name}</span>
                  )}
                  {!m.leido && (
                    <span className="text-[10px] font-mono text-[#CCFF00] font-bold">● Nuevo</span>
                  )}
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">{m.mensaje}</p>
                <p className="text-[11px] text-zinc-600 font-mono mt-1">{formatFecha(m.created_at)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleLeido(m.id, m.leido)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono ${m.leido ? 'border-zinc-800 text-zinc-600 hover:text-white' : 'border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00]/10'}`}>
                  {m.leido ? 'Marcar nuevo' : 'Leído'}
                </button>
                <button onClick={() => eliminar(m.id)} className="text-zinc-700 hover:text-red-400 text-xs transition-colors px-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
