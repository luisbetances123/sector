'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, Upload, Home, X, Search, Plus } from 'lucide-react'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  etapa: string
  tipo_propiedad?: string[]
  presupuesto_min?: string
  presupuesto_max?: string
  zonas_interes?: string[]
  notas?: string
}

interface Propiedad {
  id: string
  title: string
  price: string
  location: string
  sector?: string
  type: string
  bedrooms?: number
  bathrooms?: number
  image_url?: string
}

interface ClientePropiedad {
  id: string
  property_id: string
  properties: Propiedad
}

const ETAPAS = ['Lead', 'Buscando', 'En Oferta', 'Cierre']
const ZONAS = ['Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos', 'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millón', 'Mirador Norte', 'Mirador Sur']
const TIPOS = ['Apartamento', 'Casa', 'Villa', 'Penthouse', 'Local Comercial', 'Solar']

const nuevoClienteInicial = { nombre: '', email: '', telefono: '', etapa: 'Lead', presupuesto_min: '', presupuesto_max: '', zonas_interes: [] as string[], tipo_propiedad: [] as string[], notas: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [propiedadesAsignadas, setPropiedadesAsignadas] = useState<ClientePropiedad[]>([])
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [todasPropiedades, setTodasPropiedades] = useState<Propiedad[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [showNuevoModal, setShowNuevoModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState(nuevoClienteInicial)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    supabase.from('clientes').select('*').then(({ data }) => {
      if (data) setClientes(data)
    })
  }, [])

  const abrirPerfil = async (cliente: Cliente) => {
    setSelectedCliente(cliente)
    const { data } = await supabase
      .from('cliente_properties')
      .select('id, property_id, properties(*)')
      .eq('cliente_id', cliente.id)
    if (data) setPropiedadesAsignadas(data.map((r: any) => ({ id: r.id, property_id: r.property_id, properties: r.properties as Propiedad })))
  }

  const abrirModalAsignar = async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (data) setTodasPropiedades(data)
    setShowAsignarModal(true)
  }

  const asignarPropiedad = async (propiedad: Propiedad) => {
    if (!selectedCliente) return
    const yaAsignada = propiedadesAsignadas.some(p => p.property_id === propiedad.id)
    if (yaAsignada) return
    const { data } = await supabase
      .from('cliente_properties')
      .insert({ cliente_id: selectedCliente.id, property_id: propiedad.id })
      .select('id, property_id, properties(*)')
      .single()
    if (data) {
      const rel = { id: (data as any).id, property_id: (data as any).property_id, properties: (data as any).properties as Propiedad }
      setPropiedadesAsignadas(prev => [...prev, rel])
      setShowAsignarModal(false)
    }
  }

  const desasignarPropiedad = async (relacionId: string) => {
    await supabase.from('cliente_properties').delete().eq('id', relacionId)
    setPropiedadesAsignadas(prev => prev.filter(p => p.id !== relacionId))
  }

  const toggleZona = (zona: string) => {
    setNuevoCliente(prev => ({
      ...prev,
      zonas_interes: prev.zonas_interes.includes(zona)
        ? prev.zonas_interes.filter(z => z !== zona)
        : [...prev.zonas_interes, zona]
    }))
  }

  const toggleTipo = (tipo: string) => {
    setNuevoCliente(prev => ({
      ...prev,
      tipo_propiedad: prev.tipo_propiedad.includes(tipo)
        ? prev.tipo_propiedad.filter(t => t !== tipo)
        : [...prev.tipo_propiedad, tipo]
    }))
  }

  const guardarCliente = async () => {
    if (!nuevoCliente.nombre.trim() || !nuevoCliente.email.trim()) return
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre: nuevoCliente.nombre,
        email: nuevoCliente.email,
        telefono: nuevoCliente.telefono || null,
        etapa: nuevoCliente.etapa,
        presupuesto_min: nuevoCliente.presupuesto_min || null,
        presupuesto_max: nuevoCliente.presupuesto_max || null,
        zonas_interes: nuevoCliente.zonas_interes,
        tipo_propiedad: nuevoCliente.tipo_propiedad,
        notas: nuevoCliente.notas || null,
        user_id: user?.id,
      })
      .select()
      .single()
    console.log('INSERT resultado:', { data, error })
    if (data) {
      setClientes(prev => [data, ...prev])
      setShowNuevoModal(false)
      setNuevoCliente(nuevoClienteInicial)
    }
    setGuardando(false)
  }
  }

  const propiedadesFiltradas = todasPropiedades.filter(p =>
    p.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.sector || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  if (selectedCliente) return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <button onClick={() => setSelectedCliente(null)} className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 mb-6 text-sm uppercase tracking-wider transition-colors">
        ← Volver a clientes
      </button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-2xl">
            {selectedCliente.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{selectedCliente.nombre}</h1>
            <p className="text-zinc-400 text-sm">{selectedCliente.email}</p>
          </div>
          <span className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold uppercase">{selectedCliente.etapa}</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black uppercase text-sm tracking-wider flex items-center gap-2">
              <Home size={16} className="text-amber-500" /> Propiedades Asignadas
            </h2>
            <button onClick={abrirModalAsignar} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-black uppercase hover:bg-white transition-all">
              <Plus size={14} /> Asignar
            </button>
          </div>
          {propiedadesAsignadas.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4">No hay propiedades asignadas</p>
          ) : (
            <div className="space-y-3">
              {propiedadesAsignadas.map(rel => (
                <div key={rel.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                  {rel.properties.image_url && <img src={rel.properties.image_url} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{rel.properties.title}</p>
                    <p className="text-zinc-400 text-xs">{rel.properties.sector || rel.properties.location}</p>
                    <p className="text-amber-500 text-xs font-bold">{rel.properties.price}</p>
                  </div>
                  <button onClick={() => desasignarPropiedad(rel.id)} className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-4">Perfil del Cliente</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {selectedCliente.telefono && <div><p className="text-zinc-500 text-xs uppercase">Teléfono</p><p className="text-white">{selectedCliente.telefono}</p></div>}
            {selectedCliente.presupuesto_min && <div><p className="text-zinc-500 text-xs uppercase">Presupuesto</p><p className="text-white">{selectedCliente.presupuesto_min} – {selectedCliente.presupuesto_max}</p></div>}
            {selectedCliente.tipo_propiedad && selectedCliente.tipo_propiedad.length > 0 && (
              <div className="col-span-2"><p className="text-zinc-500 text-xs uppercase mb-1">Tipo</p><div className="flex gap-2 flex-wrap">{selectedCliente.tipo_propiedad.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{t}</span>)}</div></div>
            )}
            {selectedCliente.zonas_interes && selectedCliente.zonas_interes.length > 0 && (
              <div className="col-span-2"><p className="text-zinc-500 text-xs uppercase mb-1">Zonas de Interés</p><div className="flex gap-2 flex-wrap">{selectedCliente.zonas_interes.map(z => <span key={z} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">{z}</span>)}</div></div>
            )}
            {selectedCliente.notas && <div className="col-span-2"><p className="text-zinc-500 text-xs uppercase mb-1">Notas</p><p className="text-zinc-300">{selectedCliente.notas}</p></div>}
          </div>
        </div>
      </div>

      {showAsignarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="text-white font-black uppercase text-sm tracking-wider">Asignar Propiedad</h3>
              <button onClick={() => setShowAsignarModal(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2">
                <Search size={16} className="text-zinc-500" />
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por título, sector..." className="bg-transparent text-white text-sm flex-1 outline-none placeholder-zinc-500" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {propiedadesFiltradas.map(p => {
                const yaAsignada = propiedadesAsignadas.some(rel => rel.property_id === p.id)
                return (
                  <div key={p.id} onClick={() => !yaAsignada && asignarPropiedad(p)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${yaAsignada ? 'border-amber-500/30 bg-amber-500/5 cursor-default' : 'border-zinc-800 hover:border-amber-500 cursor-pointer hover:bg-zinc-800'}`}>
                    {p.image_url && <img src={p.image_url} className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{p.title}</p>
                      <p className="text-zinc-400 text-xs">{p.sector || p.location}</p>
                      <p className="text-amber-500 text-xs font-bold">{p.price}</p>
                    </div>
                    {yaAsignada && <span className="text-amber-500 text-xs font-bold flex-shrink-0">✓ Asignada</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">MIS CLIENTES</h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{clientes.length} REGISTROS</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => alert('Importador')} className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-amber-500 transition-all">
              <Upload className="w-3 h-3" /> Importar Excel
            </button>
            <button onClick={() => setShowNuevoModal(true)} className="flex items-center gap-1.5 bg-amber-500 text-black px-3 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-white transition-all">
              <UserPlus className="w-3 h-3" /> + Nuevo Cliente
            </button>
          </div>
        </div>

        {clientes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm mb-4">No hay clientes todavía.</p>
            <button onClick={() => setShowNuevoModal(true)} className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all">
              + Agregar primer cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map(c => (
              <div key={c.id} onClick={() => abrirPerfil(c)} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl cursor-pointer hover:border-amber-500 transition-all hover:bg-zinc-900">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-black">
                      {c.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{c.nombre}</p>
                      <p className="text-zinc-500 text-xs">{c.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs uppercase">{c.etapa}</span>
                </div>
                {c.zonas_interes && c.zonas_interes.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {c.zonas_interes.slice(0, 3).map(z => (
                      <span key={z} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs">{z}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nuevo cliente */}
      {showNuevoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="text-white font-black uppercase text-sm tracking-wider">Nuevo Cliente</h3>
              <button onClick={() => setShowNuevoModal(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Nombre *</label>
                  <input value={nuevoCliente.nombre} onChange={e => setNuevoCliente(p => ({...p, nombre: e.target.value}))} placeholder="Nombre completo" className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Email *</label>
                  <input type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente(p => ({...p, email: e.target.value}))} placeholder="email@ejemplo.com" className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Teléfono</label>
                  <input value={nuevoCliente.telefono} onChange={e => setNuevoCliente(p => ({...p, telefono: e.target.value}))} placeholder="809-000-0000" className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Etapa</label>
                  <select value={nuevoCliente.etapa} onChange={e => setNuevoCliente(p => ({...p, etapa: e.target.value}))} className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Presupuesto mín.</label>
                  <input value={nuevoCliente.presupuesto_min} onChange={e => setNuevoCliente(p => ({...p, presupuesto_min: e.target.value}))} placeholder="$100,000" className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Presupuesto máx.</label>
                  <input value={nuevoCliente.presupuesto_max} onChange={e => setNuevoCliente(p => ({...p, presupuesto_max: e.target.value}))} placeholder="$300,000" className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-2 block">Tipo de propiedad</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button key={t} onClick={() => toggleTipo(t)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${nuevoCliente.tipo_propiedad.includes(t) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:border-amber-500'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-2 block">Zonas de interés</label>
                <div className="flex flex-wrap gap-2">
                  {ZONAS.map(z => (
                    <button key={z} onClick={() => toggleZona(z)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${nuevoCliente.zonas_interes.includes(z) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:border-amber-500'}`}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Notas</label>
                <textarea value={nuevoCliente.notas} onChange={e => setNuevoCliente(p => ({...p, notas: e.target.value}))} placeholder="Observaciones del cliente..." className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20" />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-zinc-800">
              <button onClick={() => setShowNuevoModal(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs uppercase tracking-widest hover:border-zinc-500 transition-all">
                Cancelar
              </button>
              <button onClick={guardarCliente} disabled={guardando || !nuevoCliente.nombre || !nuevoCliente.email} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs uppercase tracking-widest font-black hover:bg-white transition-all disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}