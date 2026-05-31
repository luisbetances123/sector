'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'

type ClienteEstado = 'nuevo' | 'calificado' | 'cita' | 'negociacion' | 'cerrado'

type Cliente = {
  id: string
  nombre: string
  telefono?: string
  email?: string
  presupuesto_max?: number
  tipo_propiedad?: string
  sectores_interes?: string[]
  habitaciones_min?: number
  banos_min?: number
  estado: ClienteEstado
  notas?: string
  created_at?: string
}

const ESTADOS: { value: ClienteEstado; label: string; bg: string; border: string; text: string }[] = [
  { value: 'nuevo',       label: 'Leads Nuevos',    bg: 'bg-zinc-950/40',  border: 'border-zinc-800',     text: 'text-zinc-400' },
  { value: 'calificado',  label: 'Calificados',     bg: 'bg-blue-950/10',   border: 'border-blue-900/30',   text: 'text-blue-400' },
  { value: 'cita',        label: 'En Cita / Visita',bg: 'bg-amber-950/10',  border: 'border-amber-900/30',  text: 'text-amber-400' },
  { value: 'negociacion', label: 'Negociación',    bg: 'bg-purple-950/10', border: 'border-purple-900/30', text: 'text-purple-400' },
  { value: 'cerrado',     label: 'Cerrados 🎉',     bg: 'bg-emerald-950/10',border: 'border-emerald-900/30',text: 'text-emerald-400' },
]

const TIPOS_PROPIEDAD = ['APARTAMENTO', 'CASA', 'LOCAL', 'TERRENO', 'OFICINA', 'BODEGA']

export default function CRMPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Estado para el formulario
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [tipo, setTipo] = useState('APARTAMENTO')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [])

  async function fetchClientes() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) setClientes(data)
    } catch (err) {
      console.error("Error fetching clients:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCliente(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return

    setGuardando(true)
    const payload = {
      nombre,
      telefono: telefono || null,
      email: email || null,
      presupuesto_max: presupuesto ? parseFloat(presupuesto) : null,
      tipo_propiedad: tipo,
      estado: 'nuevo',
      notas: notas || null
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([payload])
        .select()
        .single()

      if (!error && data) {
        setClientes(prev => [data, ...prev])
        // Limpiar formulario y cerrar modal
        setNombre('')
        setTelefono('')
        setEmail('')
        setPresupuesto('')
        setNotas('')
        setModalOpen(false)
      }
    } catch (err) {
      console.error("Error adding client:", err)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(id: string, nuevoEstado: ClienteEstado) {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (!error) {
        setClientes(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c))
      }
    } catch (err) {
      console.error("Error changing state:", err)
    }
  }

  const columnas = useMemo(() => {
    return ESTADOS.reduce((acc, col) => {
      acc[col.value] = clientes.filter(c => c.estado === col.value)
      return acc
    }, {} as Record<ClienteEstado, Cliente[]>)
  }, [clientes])

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-amber-500 tracking-tighter uppercase">
            CRM REALTOR
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
            Control de Prospectos y Embudo de Ventas
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-amber-500 text-black px-4 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-white transition-all shadow-lg shadow-amber-500/20"
        >
          + Agregar Cliente
        </button>
      </div>

      {/* Tablero */}
      {loading ? (
        <div className="text-zinc-500 text-sm animate-pulse">Cargando embudo de clientes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {ESTADOS.map(col => (
            <div key={col.value} className={`rounded-2xl border ${col.border} ${col.bg} p-4 min-h-[500px] flex flex-col`}>
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800/60 pb-2 shrink-0">
                <h3 className={`font-black text-xs uppercase tracking-wider ${col.text}`}>
                  {col.label}
                </h3>
                <span className="bg-zinc-900 text-zinc-400 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {columnas[col.value]?.length || 0}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnas[col.value]?.length === 0 ? (
                  <p className="text-zinc-700 text-xs text-center py-8 italic border border-dashed border-zinc-800/40 rounded-xl">Vacío</p>
                ) : (
                  columnas[col.value]?.map(cliente => (
                    <div key={cliente.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-md hover:border-zinc-700 transition-all group">
                      <h4 className="text-white font-bold text-sm mb-1">{cliente.nombre}</h4>
                      
                      {cliente.telefono && <p className="text-zinc-500 text-xs mb-1">📱 {cliente.telefono}</p>}
                      {cliente.email && <p className="text-zinc-600 text-xs mb-2 truncate">✉️ {cliente.email}</p>}

                      {cliente.presupuesto_max && (
                        <div className="text-amber-400 font-extrabold text-[11px] bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 inline-block mb-2">
                          USD ${(cliente.presupuesto_max).toLocaleString('es-DO')}
                        </div>
                      )}
                      
                      {cliente.notas && <p className="text-zinc-500 text-[11px] bg-zinc-950 p-2 rounded-lg border border-zinc-800/60 line-clamp-2 italic">"{cliente.notas}"</p>}

                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Mover:</span>
                        <select 
                          value={cliente.estado} 
                          onChange={(e) => cambiarEstado(cliente.id, e.target.value as ClienteEstado)}
                          className="bg-zinc-950 text-zinc-400 text-[10px] rounded px-1.5 py-0.5 border border-zinc-800 focus:outline-none cursor-pointer"
                        >
                          {ESTADOS.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ventana Emergente */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-black text-amber-500 uppercase tracking-tight mb-4">Nuevo Cliente</h2>
            <form onSubmit={handleAddCliente} className="space-y-4">
              <div>
                <label className="text-zinc-400 text-xs uppercase font-bold block mb-1">Nombre *</label>
                <input required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="Ej: Juan Pérez" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-xs uppercase font-bold block mb-1">Teléfono</label>
                  <input value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="809-555-5555" />
                </div>
                <div>
                  <label className="text-zinc-400 text-xs uppercase font-bold block mb-1">Presupuesto Max (USD)</label>
                  <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="250000" />
                </div>
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase font-bold block mb-1">Correo</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="juan@email.com" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase font-bold block mb-1">Tipo de Propiedad de Interés</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                  {TIPOS_PROPIEDAD.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase font-bold block mb-1">Notas / Requerimientos</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none" placeholder="Busca con balcón amplio en piso alto..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-zinc-800 py-2.5 rounded-xl text-xs font-bold uppercase">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 bg-amber-500 text-black py-2.5 rounded-xl text-xs font-black uppercase hover:bg-white transition-all disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}