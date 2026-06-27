'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Recordatorio {
  id: string
  cliente_id: string | null
  texto: string
  fecha: string
  completado: boolean
  created_at: string
}

export default function RemindersPage() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [texto, setTexto] = useState('')
  const [fecha, setFecha] = useState('')
  const [saving, setSaving] = useState(false)
  const [constructoraId, setConstructoraId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from('constructoras')
        .select('id')
        .eq('activa', true)
        .limit(1)
        .maybeSingle()
      const id = data?.id ?? null
      setConstructoraId(id)
      fetchRecordatorios(id)
    }
    init()
  }, [])

  async function fetchRecordatorios(cid: string | null = constructoraId) {
    if (cid === null) return
    const { data } = await supabase
      .from('recordatorios')
      .select('*')
      .eq('constructora_id', cid)
      .order('fecha', { ascending: true })
    if (data) setRecordatorios(data)
    setLoading(false)
  }

  async function agregar() {
    if (!texto.trim() || !fecha) return
    setSaving(true)
    await supabase.from('recordatorios').insert([{ texto, fecha, completado: false, constructora_id: constructoraId }])
    setTexto('')
    setFecha('')
    fetchRecordatorios()
    setSaving(false)
  }

  async function toggleCompletado(id: string, completado: boolean) {
    await supabase.from('recordatorios').update({ completado: !completado }).eq('id', id)
    fetchRecordatorios()
  }

  async function eliminar(id: string) {
    await supabase.from('recordatorios').delete().eq('id', id)
    fetchRecordatorios()
  }

  const hoy = new Date().toISOString().split('T')[0]
  const vencidos = recordatorios.filter(r => !r.completado && r.fecha < hoy)
  const pendientes = recordatorios.filter(r => !r.completado && r.fecha >= hoy)
  const completados = recordatorios.filter(r => r.completado)

  const formatFecha = (f: string) => new Date(f + 'T00:00:00').toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' })

  const RCard = ({ r, vencido }: { r: Recordatorio, vencido?: boolean }) => (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${r.completado ? 'border-zinc-900 opacity-50' : vencido ? 'border-red-500/30 bg-red-950/10' : 'border-zinc-800 bg-zinc-950'}`}>
      <button onClick={() => toggleCompletado(r.id, r.completado)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${r.completado ? 'bg-[#CCFF00] border-[#CCFF00]' : vencido ? 'border-red-400 hover:border-red-300' : 'border-zinc-600 hover:border-[#CCFF00]'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${r.completado ? 'line-through text-zinc-500' : 'text-white'}`}>{r.texto}</p>
        <p className={`text-[11px] font-mono mt-1 ${vencido ? 'text-red-400' : 'text-zinc-500'}`}>
          {vencido ? '⚠ Vencido — ' : ''}{formatFecha(r.fecha)}
        </p>
      </div>
      <button onClick={() => eliminar(r.id)} className="text-zinc-700 hover:text-red-400 text-xs transition-colors">✕</button>
    </div>
  )

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6">
        <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Seguimiento</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Recordatorios</h1>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Vencidos</p>
          <p className="text-3xl font-black text-red-400 mt-1">{vencidos.length}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Pendientes</p>
          <p className="text-3xl font-black text-[#CCFF00] mt-1">{pendientes.length}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Completados</p>
          <p className="text-3xl font-black text-white mt-1">{completados.length}</p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-mono text-white uppercase tracking-wider">Nuevo Recordatorio</h2>
        <div className="flex gap-3">
          <input value={texto} onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && agregar()}
            placeholder="Ej. Llamar a Maria Nunez para seguimiento..."
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 outline-none placeholder-zinc-600" />
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} min={hoy}
            className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 outline-none" />
          <button onClick={agregar} disabled={saving || !texto.trim() || !fecha}
            className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-5 py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
            + Agregar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-sm text-center py-10">Cargando...</div>
      ) : (
        <div className="space-y-6">
          {vencidos.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono text-red-400 uppercase tracking-wider">⚠ Vencidos ({vencidos.length})</h2>
              {vencidos.map(r => <RCard key={r.id} r={r} vencido />)}
            </div>
          )}
          {pendientes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono text-white uppercase tracking-wider">Pendientes ({pendientes.length})</h2>
              {pendientes.map(r => <RCard key={r.id} r={r} />)}
            </div>
          )}
          {completados.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-mono text-white uppercase tracking-wider">Completados ({completados.length})</h2>
              {completados.map(r => <RCard key={r.id} r={r} />)}
            </div>
          )}
          {recordatorios.length === 0 && (
            <p className="text-white text-sm text-center py-10">No hay recordatorios. Agrega el primero.</p>
          )}
        </div>
      )}
    </div>
  )
}
