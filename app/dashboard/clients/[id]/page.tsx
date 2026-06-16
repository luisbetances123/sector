'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

interface Cliente {
  id: string
  name: string
  email: string
  phone: string
  stage: string
  price: string
  notes: string
  initial: string
  created_at: string
}

interface Nota {
  id: string
  cliente_id: string
  nota: string
  created_at: string
}

export default function ClienteFichaPage() {
  const { id } = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<Partial<Cliente>>({})

  useEffect(() => {
    if (id) {
      fetchCliente()
      fetchNotas()
    }
  }, [id])

  async function fetchCliente() {
    const { data } = await supabase.from('clients').select('*').eq('id', id).single()
    if (data) {
      setCliente(data)
      setForm(data)
    }
    setLoading(false)
  }

  async function fetchNotas() {
    const { data } = await supabase
      .from('bitacora_cliente')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false })
    if (data) setNotas(data)
  }

  async function agregarNota() {
    if (!nuevaNota.trim()) return
    setSaving(true)
    await supabase.from('bitacora_cliente').insert([{ cliente_id: id, nota: nuevaNota.trim() }])
    setNuevaNota('')
    fetchNotas()
    setSaving(false)
  }

  async function eliminarNota(notaId: string) {
    await supabase.from('bitacora_cliente').delete().eq('id', notaId)
    fetchNotas()
  }

  async function guardarCliente() {
    setSaving(true)
    await supabase.from('clients').update({
      name: form.name,
      email: form.email,
      phone: form.phone,
      stage: form.stage,
      price: form.price,
      notes: form.notes,
      initial: form.initial
    }).eq('id', id)
    fetchCliente()
    setEditando(false)
    setSaving(false)
  }

  const getEtapaStyle = (stage: string) => {
    switch (stage) {
      case 'NUEVO': return 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'
      case 'ACTIVO': return 'bg-zinc-900 text-zinc-400 border-zinc-800'
      case 'ESTANCADO': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800'
    }
  }

  const formatTelefono = (tel: string) => {
    const digits = tel.replace(/\D/g, '')
    if (digits.length === 10) return '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6)
    if (digits.length === 11) return '(' + digits.slice(1,4) + ') ' + digits.slice(4,7) + '-' + digits.slice(7)
    return tel
  }

  const formatFecha = (str: string) => {
    return new Date(str).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="text-zinc-500 text-sm text-center py-20">Cargando...</div>
  if (!cliente) return <div className="text-zinc-500 text-sm text-center py-20">Cliente no encontrado.</div>

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <button onClick={() => router.push('/dashboard/clients')} className="text-zinc-500 text-xs hover:text-white mb-3 flex items-center gap-1">
            ← Volver
          </button>
          <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Ficha del Cliente</span>
          <h1 className="text-3xl font-extrabold tracking-tighter text-white mt-1">{cliente.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{cliente.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={'inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ' + getEtapaStyle(cliente.stage)}>
            {cliente.stage || '-'}
          </span>
          <button onClick={() => setEditando(!editando)}
            className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold rounded-xl px-4 py-2 hover:bg-zinc-800 transition-colors">
            {editando ? 'Cancelar' : 'Editar'}
          </button>
          {cliente.phone && (
            <a href={"https://wa.me/" + cliente.phone} target="_blank" rel="noopener noreferrer"
              className="bg-[#CCFF00] text-black text-xs font-black rounded-xl px-4 py-2 hover:bg-[#b8e600] transition-colors">
              WhatsApp
            </a>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Información del Cliente</h2>
          {editando ? (
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Nombre</label>
                <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Email</label>
                <input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Teléfono</label>
                <input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Etapa</label>
                <select value={form.stage || ''} onChange={e => setForm({...form, stage: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none">
                  <option value="NUEVO">NUEVO</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="ESTANCADO">ESTANCADO</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Presupuesto</label>
                <input value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Próxima Acción</label>
                <input value={form.initial || ''} onChange={e => setForm({...form, initial: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Notas</label>
                <input value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-2.5 mt-1 outline-none" />
              </div>
              <button onClick={guardarCliente} disabled={saving}
                className="w-full bg-[#CCFF00] text-black font-black text-xs rounded-xl py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Teléfono</span>
                <span className="text-white font-mono">{cliente.phone ? formatTelefono(cliente.phone) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Presupuesto</span>
                <span className="text-[#CCFF00] font-black font-mono">
                  {cliente.price ? 'US$ ' + Number(cliente.price).toLocaleString() : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Próxima Acción</span>
                <span className="text-white">{cliente.initial || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Registrado</span>
                <span className="text-zinc-300 text-xs">{formatFecha(cliente.created_at)}</span>
              </div>
              {cliente.notes && (
                <div className="pt-2 border-t border-zinc-900">
                  <span className="text-zinc-500 text-xs block mb-1">Notas</span>
                  <p className="text-zinc-300 text-xs leading-relaxed">{cliente.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Historial de Interacciones</h2>
          <div className="flex gap-2">
            <input
              value={nuevaNota}
              onChange={e => setNuevaNota(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarNota()}
              placeholder="Agregar nota o interacción..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-2.5 outline-none"
            />
            <button onClick={agregarNota} disabled={saving || !nuevaNota.trim()}
              className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-2.5 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
              +
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notas.length === 0 ? (
              <p className="text-zinc-600 text-xs text-center py-6">Sin interacciones registradas.</p>
            ) : (
              notas.map(nota => (
                <div key={nota.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 group">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-zinc-300 text-xs leading-relaxed flex-1">{nota.nota}</p>
                    <button onClick={() => eliminarNota(nota.id)}
                      className="text-zinc-600 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-all">
                      x
                    </button>
                  </div>
                  <p className="text-zinc-600 text-[10px] font-mono mt-1">{formatFecha(nota.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
