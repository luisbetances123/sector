'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Phone, MessageCircle, FileText, Plus, Trash2, Save } from 'lucide-react'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  etapa: string
  presupuesto_min?: string
  presupuesto_max?: string
  zonas_interes?: string[]
  tipo_propiedad?: string[]
  notas?: string
}

interface Nota {
  id: string
  cliente_id: string
  texto: string
  created_at: string
}

export default function ClientePerfilPage() {
  const { id } = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      const [{ data: c }, { data: n }] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', id).single(),
        supabase.from('notas_cliente').select('*').eq('cliente_id', id).order('created_at', { ascending: false })
      ])
      if (c) setCliente(c)
      if (n) setNotas(n)
      setLoading(false)
    }
    cargar()
  }, [id])

  const guardarNota = async () => {
    if (!nuevaNota.trim() || !id) return
    setGuardando(true)
    const { data } = await supabase
      .from('notas_cliente')
      .insert({ cliente_id: id, texto: nuevaNota.trim() })
      .select()
      .single()
    if (data) {
      setNotas(prev => [data, ...prev])
      setNuevaNota('')
    }
    setGuardando(false)
  }

  const eliminarNota = async (notaId: string) => {
    await supabase.from('notas_cliente').delete().eq('id', notaId)
    setNotas(prev => prev.filter(n => n.id !== notaId))
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>
  if (!cliente) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cliente no encontrado</div>

  const formatFecha = (f: string) => new Date(f).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-2xl mx-auto">
      <button onClick={() => router.push('/clients')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a Clientes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-xl font-bold text-black">
            {cliente.nombre[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
            <p className="text-zinc-400">{cliente.email}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {cliente.etapa}
        </span>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a href={`https://wa.me/${cliente.telefono}`} target="_blank" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors">
          <MessageCircle size={18} /> WhatsApp
        </a>
        <a href={`tel:${cliente.telefono}`} className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors">
          <Phone size={18} /> Llamar
        </a>
      </div>

      {/* Notas Rápidas */}
      <div className="bg-zinc-900 rounded-2xl p-4 mb-4 border border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-amber-400" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-zinc-400">Notas de Seguimiento</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <textarea
            value={nuevaNota}
            onChange={e => setNuevaNota(e.target.value)}
            placeholder="Agregar nota rápida..."
            className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            rows={2}
          />
          <button
            onClick={guardarNota}
            disabled={guardando || !nuevaNota.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold px-4 rounded-xl transition-colors flex items-center gap-1"
          >
            <Save size={16} />
          </button>
        </div>
        {notas.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-4">Sin notas aún</p>
        ) : (
          <div className="space-y-2">
            {notas.map(n => (
              <div key={n.id} className="flex items-start justify-between gap-2 bg-zinc-800 rounded-xl p-3">
                <div>
                  <p className="text-sm text-white">{n.texto}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatFecha(n.created_at)}</p>
                </div>
                <button onClick={() => eliminarNota(n.id)} className="text-zinc-600 hover:text-red-400 transition-colors mt-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Perfil */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <h2 className="font-semibold text-sm uppercase tracking-widest text-zinc-400 mb-4">Perfil del Cliente</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-500">Teléfono</p><p>{cliente.telefono || '—'}</p></div>
          <div><p className="text-zinc-500">Presupuesto</p><p>{cliente.presupuesto_min ? `US$${cliente.presupuesto_min} – US$${cliente.presupuesto_max}` : '—'}</p></div>
          <div><p className="text-zinc-500">Zonas</p><p>{cliente.zonas_interes?.join(', ') || '—'}</p></div>
          <div><p className="text-zinc-500">Tipo</p><p>{cliente.tipo_propiedad?.join(', ') || '—'}</p></div>
        </div>
      </div>
    </div>
  )
}
