'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, Home, X, Search, Plus, MessageCircle, Phone, Clock, Pencil } from 'lucide-react'

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
  image_url?: string
}

interface ClientePropiedad {
  id: string
  property_id: string
  properties: Propiedad
}

interface Contacto {
  id: string
  cliente_id: string
  tipo: string
  fecha: string
  notas?: string
}

const ETAPAS = ['Lead', 'Buscando', 'En Oferta', 'Cierre']
const ZONAS = ['Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos', 'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millón', 'Mirador Norte', 'Mirador Sur']
const TIPOS = ['Apartamento', 'Casa', 'Villa', 'Penthouse', 'Local Comercial', 'Solar']
const DIAS_ALERTA = 3

const nuevoClienteInicial = {
  nombre: '', email: '', telefono: '', etapa: 'Lead',
  presupuesto_min: '', presupuesto_max: '',
  zonas_interes: [] as string[], tipo_propiedad: [] as string[], notas: ''
}

function diasSinContacto(contactos: Contacto[], clienteId: string): number | null {
  const del_cliente = contactos.filter(c => c.cliente_id === clienteId)
  if (del_cliente.length === 0) return null
  const ultimo = del_cliente.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
  const diff = (Date.now() - new Date(ultimo.fecha).getTime()) / (1000 * 60 * 60 * 24)
  return Math.floor(diff)
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-DO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [propiedadesAsignadas, setPropiedadesAsignadas] = useState<ClientePropiedad[]>([])
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [contactosCliente, setContactosCliente] = useState<Contacto[]>([])
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [todasPropiedades, setTodasPropiedades] = useState<Propiedad[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [showNuevoModal, setShowNuevoModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState(nuevoClienteInicial)
  const [editForm, setEditForm] = useState(nuevoClienteInicial)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('clientes').select('*'),
      supabase.from('contactos_whatsapp').select('*').order('fecha', { ascending: false }),
    ]).then(([c, ct]) => {
      if (c.data) setClientes(c.data)
      if (ct.data) setContactos(ct.data)
    })
  }, [])

  const registrarContacto = async (clienteId: string, tipo: 'whatsapp' | 'llamada') => {
    const { data } = await supabase
      .from('contactos_whatsapp')
      .insert({ cliente_id: clienteId, tipo })
      .select()
      .single()
    if (data) {
      setContactos(prev => [data, ...prev])
      if (selectedCliente?.id === clienteId) {
        setContactosCliente(prev => [data, ...prev])
      }
    }
  }

  const abrirWhatsApp = async (cliente: Cliente) => {
    await registrarContacto(cliente.id, 'whatsapp')
    const numero = cliente.telefono?.replace(/\D/g, '')
    const etapaMensaje: Record<string, string> = {
      'Lead': `Hola ${cliente.nombre}, te contacto de HOMVI. Vi que estás interesado en propiedades. ¿Tienes un momento para hablar?`,
      'Buscando': `Hola ${cliente.nombre}, tengo algunas propiedades nuevas que podrían interesarte. ¿Cuándo podemos hablar?`,
      'En Oferta': `Hola ${cliente.nombre}, quería darte seguimiento a la oferta. ¿Tienes alguna duda o actualización?`,
      'Cierre': `Hola ${cliente.nombre}, quería dar seguimiento al proceso de cierre. ¿Todo va bien?`,
    }
    const mensaje = etapaMensaje[cliente.etapa] || `Hola ${cliente.nombre}, te contacto de HOMVI.`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const abrirLlamada = async (cliente: Cliente) => {
    await registrarContacto(cliente.id, 'llamada')
    window.open(`tel:${cliente.telefono}`)
  }

  const abrirPerfil = async (cliente: Cliente) => {
    setSelectedCliente(cliente)
    const [{ data: props }, { data: cts }] = await Promise.all([
      supabase.from('cliente_properties').select('id, property_id, properties(*)').eq('cliente_id', cliente.id),
      supabase.from('contactos_whatsapp').select('*').eq('cliente_id', cliente.id).order('fecha', { ascending: false }),
    ])
    if (props) setPropiedadesAsignadas(props.map((r: any) => ({ id: r.id, property_id: r.property_id, properties: r.properties as Propiedad })))
    if (cts) setContactosCliente(cts)
  }

  const abrirEditar = () => {
    if (!selectedCliente) return
    setEditForm({
      nombre: selectedCliente.nombre || '',
      email: selectedCliente.email || '',
      telefono: selectedCliente.telefono || '',
      etapa: selectedCliente.etapa || 'Lead',
      presupuesto_min: selectedCliente.presupuesto_min || '',
      presupuesto_max: selectedCliente.presupuesto_max || '',
      zonas_interes: selectedCliente.zonas_interes || [],
      tipo_propiedad: selectedCliente.tipo_propiedad || [],
      notas: selectedCliente.notas || '',
    })
    setShowEditModal(true)
  }

  const guardarEdicion = async () => {
    if (!selectedCliente || !editForm.nombre.trim()) return
    setGuardando(true)
    const { data, error } = await supabase
      .from('clientes')
      .update({
        nombre: editForm.nombre,
        email: editForm.email,
        telefono: editForm.telefono || null,
        etapa: editForm.etapa,
        presupuesto_min: editForm.presupuesto_min || null,
        presupuesto_max: editForm.presupuesto_max || null,
        zonas_interes: editForm.zonas_interes,
        tipo_propiedad: editForm.tipo_propiedad,
        notas: editForm.notas || null,
      })
      .eq('id', selectedCliente.id)
      .select()
      .single()
    if (data) {
      setClientes(prev => prev.map(c => c.id === data.id ? data : c))
      setSelectedCliente(data)
      setShowEditModal(false)
    }
    setGuardando(false)
  }

  const eliminarCliente = async () => {
    if (!selectedCliente) return
    if (!confirm(`¿Eliminar a ${selectedCliente.nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from('clientes').delete().eq('id', selectedCliente.id)
    setClientes(prev => prev.filter(c => c.id !== selectedCliente.id))
    setSelectedCliente(null)
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

  const toggleZona = (zona: string) => setNuevoCliente(prev => ({
    ...prev,
    zonas_interes: prev.zonas_interes.includes(zona)
      ? prev.zonas_interes.filter(z => z !== zona)
      : [...prev.zonas_interes, zona]
  }))

  const toggleTipo = (tipo: string) => setNuevoCliente(prev => ({
    ...prev,
    tipo_propiedad: prev.tipo_propiedad.includes(tipo)
      ? prev.tipo_propiedad.filter(t => t !== tipo)
      : [...prev.tipo_propiedad, tipo]
  }))

  const toggleZonaEdit = (zona: string) => setEditForm(prev => ({
    ...prev,
    zonas_interes: prev.zonas_interes.includes(zona)
      ? prev.zonas_interes.filter(z => z !== zona)
      : [...prev.zonas_interes, zona]
  }))

  const toggleTipoEdit = (tipo: string) => setEditForm(prev => ({
    ...prev,
    tipo_propiedad: prev.tipo_propiedad.includes(tipo)
      ? prev.tipo_propiedad.filter(t => t !== tipo)
      : [...prev.tipo_propiedad, tipo]
  }))

  const guardarCliente = async () => {
    if (!nuevoCliente.nombre.trim() || !nuevoCliente.email.trim()) return
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
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
      .select().single()
    if (data) {
      setClientes(prev => [data, ...prev])
      setShowNuevoModal(false)
      setNuevoCliente(nuevoClienteInicial)
    }
    setGuardando(false)
  }

  const propiedadesFiltradas = todasPropiedades.filter(p =>
    p.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.sector || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const etapaColor: Record<string, string> = {
    'Lead': 'bg-zinc-700 text-zinc-300',
    'Buscando': 'bg-blue-900/80 text-blue-300',
    'En Oferta': 'bg-amber-900/80 text-amber-300',
    'Cierre': 'bg-green-900/80 text-green-300',
  }

  const inputCls = 'w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500'
  const labelCls = 'text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block'

  // ── Modal editar ─────────────────────────────────────────────────────────────
  const EditModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h3 className="text-white font-black uppercase text-sm tracking-wider">Editar Cliente</h3>
          <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nombre *</label>
              <input value={editForm.nombre} onChange={e => setEditForm(p => ({...p, nombre: e.target.value}))}
                className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({...p, email: e.target.value}))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input value={editForm.telefono} onChange={e => setEditForm(p => ({...p, telefono: e.target.value}))}
                placeholder="809-000-0000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Etapa</label>
              <select value={editForm.etapa} onChange={e => setEditForm(p => ({...p, etapa: e.target.value}))}
                className={inputCls}>
                {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Presupuesto mín.</label>
              <input value={editForm.presupuesto_min} onChange={e => setEditForm(p => ({...p, presupuesto_min: e.target.value}))}
                placeholder="$100,000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Presupuesto máx.</label>
              <input value={editForm.presupuesto_max} onChange={e => setEditForm(p => ({...p, presupuesto_max: e.target.value}))}
                placeholder="$300,000" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Tipo de propiedad</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(t => (
                <button key={t} onClick={() => toggleTipoEdit(t)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${editForm.tipo_propiedad.includes(t) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Zonas de interés</label>
            <div className="flex flex-wrap gap-2">
              {ZONAS.map(z => (
                <button key={z} onClick={() => toggleZonaEdit(z)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${editForm.zonas_interes.includes(z) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  {z}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea value={editForm.notas} onChange={e => setEditForm(p => ({...p, notas: e.target.value}))}
              placeholder="Observaciones del cliente..."
              className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20" />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-zinc-800">
          <button onClick={() => setShowEditModal(false)}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs uppercase tracking-widest hover:border-zinc-500 transition-all">
            Cancelar
          </button>
          <button onClick={guardarEdicion} disabled={guardando || !editForm.nombre}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs uppercase tracking-widest font-black hover:bg-white transition-all disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── Vista perfil de cliente ───────────────────────────────────────────────────
  if (selectedCliente) {
    const dias = diasSinContacto(contactos, selectedCliente.id)
    const sinContacto = dias === null || dias >= DIAS_ALERTA

    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <button onClick={() => setSelectedCliente(null)}
          className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 mb-6 text-sm uppercase tracking-wider transition-colors">
          ← Volver a clientes
        </button>
        <div className="max-w-3xl mx-auto">

          {/* Header cliente */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-2xl shrink-0">
              {selectedCliente.nombre.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white truncate">{selectedCliente.nombre}</h1>
              <p className="text-zinc-400 text-sm">{selectedCliente.email}</p>
              {dias !== null && (
                <p className={`text-xs mt-0.5 font-bold ${sinContacto ? 'text-red-400' : 'text-green-400'}`}>
                  {sinContacto ? `⚠️ Sin contacto hace ${dias} días` : `✅ Contactado hace ${dias} días`}
                </p>
              )}
              {dias === null && <p className="text-zinc-500 text-xs mt-0.5">Sin contactos registrados</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold uppercase text-center">
                {selectedCliente.etapa}
              </span>
              <button onClick={abrirEditar}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all">
                <Pencil size={12} /> Editar
              </button>
            </div>
          </div>

          {/* Botones de contacto */}
          {selectedCliente.telefono && (
            <div className="flex gap-3 mb-6">
              <button onClick={() => abrirWhatsApp(selectedCliente)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl font-black text-sm uppercase transition-all">
                <MessageCircle size={18} /> WhatsApp
              </button>
              <button onClick={() => abrirLlamada(selectedCliente)}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-2xl font-black text-sm uppercase transition-all">
                <Phone size={18} /> Llamar
              </button>
            </div>
          )}

          {/* Sin teléfono — aviso */}
          {!selectedCliente.telefono && (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 mb-6">
              <p className="text-zinc-500 text-sm">Sin teléfono registrado</p>
              <button onClick={abrirEditar}
                className="text-amber-500 text-xs font-bold uppercase hover:text-white transition-colors">
                + Agregar teléfono
              </button>
            </div>
          )}

          {/* Historial de contactos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-amber-500" />
              <h2 className="text-white font-black uppercase text-sm tracking-wider">Historial de contactos</h2>
            </div>
            {contactosCliente.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-3">Sin contactos registrados</p>
            ) : (
              <div className="flex flex-col gap-2">
                {contactosCliente.slice(0, 10).map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5">
                    <span className="text-lg">{c.tipo === 'whatsapp' ? '💬' : '📞'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold capitalize">{c.tipo}</p>
                      <p className="text-zinc-500 text-[10px]">{formatFecha(c.fecha)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Propiedades asignadas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black uppercase text-sm tracking-wider flex items-center gap-2">
                <Home size={16} className="text-amber-500" /> Propiedades Asignadas
              </h2>
              <button onClick={abrirModalAsignar}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-black uppercase hover:bg-white transition-all">
                <Plus size={14} /> Asignar
              </button>
            </div>
            {propiedadesAsignadas.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No hay propiedades asignadas</p>
            ) : (
              <div className="space-y-3">
                {propiedadesAsignadas.map(rel => (
                  <div key={rel.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                    {rel.properties.image_url && (
                      <img src={rel.properties.image_url} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{rel.properties.title}</p>
                      <p className="text-zinc-400 text-xs">{rel.properties.sector || rel.properties.location}</p>
                      <p className="text-amber-500 text-xs font-bold">{rel.properties.price}</p>
                    </div>
                    <button onClick={() => desasignarPropiedad(rel.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Perfil */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black uppercase text-sm tracking-wider">Perfil del Cliente</h2>
              <button onClick={abrirEditar}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-xs uppercase transition-colors">
                <Pencil size={12} /> Editar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedCliente.telefono && (
                <div><p className="text-zinc-500 text-xs uppercase">Teléfono</p><p className="text-white">{selectedCliente.telefono}</p></div>
              )}
              {selectedCliente.presupuesto_min && (
                <div><p className="text-zinc-500 text-xs uppercase">Presupuesto</p><p className="text-white">{selectedCliente.presupuesto_min} – {selectedCliente.presupuesto_max}</p></div>
              )}
              {selectedCliente.tipo_propiedad && selectedCliente.tipo_propiedad.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-500 text-xs uppercase mb-1">Tipo</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCliente.tipo_propiedad.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedCliente.zonas_interes && selectedCliente.zonas_interes.length > 0 && (
                <div className="col-span-2">
                  <p className="text-zinc-500 text-xs uppercase mb-1">Zonas de Interés</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCliente.zonas_interes.map(z => (
                      <span key={z} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">{z}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedCliente.notas && (
                <div className="col-span-2">
                  <p className="text-zinc-500 text-xs uppercase mb-1">Notas</p>
                  <p className="text-zinc-300">{selectedCliente.notas}</p>
                </div>
              )}
            </div>
          </div>

          {/* Eliminar cliente */}
          <button onClick={eliminarCliente}
            className="w-full py-3 rounded-2xl border border-red-800/50 text-red-500 hover:bg-red-900/20 text-xs uppercase font-bold tracking-wider transition-all">
            Eliminar cliente
          </button>
        </div>

        {showEditModal && <EditModal />}

        {/* Modal asignar propiedad */}
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
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por título, sector..."
                    className="bg-transparent text-white text-sm flex-1 outline-none placeholder-zinc-500" />
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
  }

  // ── Vista listado ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">MIS CLIENTES</h1>
            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{clientes.length} REGISTROS</p>
          </div>
          <button onClick={() => setShowNuevoModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 text-black px-3 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-white transition-all">
            <UserPlus className="w-3 h-3" /> + Nuevo Cliente
          </button>
        </div>

        {clientes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm mb-4">No hay clientes todavía.</p>
            <button onClick={() => setShowNuevoModal(true)}
              className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all">
              + Agregar primer cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes.map(c => {
              const dias = diasSinContacto(contactos, c.id)
              const alerta = dias === null || dias >= DIAS_ALERTA
              return (
                <div key={c.id} onClick={() => abrirPerfil(c)}
                  className={`bg-zinc-900/40 border p-5 rounded-2xl cursor-pointer transition-all hover:bg-zinc-900 ${alerta && c.etapa !== 'Cierre' ? 'border-red-800/50 hover:border-red-600' : 'border-zinc-800 hover:border-amber-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-black shrink-0">
                        {c.nombre.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{c.nombre}</p>
                        <p className="text-zinc-500 text-xs truncate">{c.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0 ml-2 ${etapaColor[c.etapa] || 'bg-zinc-800 text-zinc-400'}`}>
                      {c.etapa}
                    </span>
                  </div>

                  {alerta && c.etapa !== 'Cierre' && (
                    <div className="flex items-center gap-1.5 bg-red-900/30 border border-red-800/40 rounded-xl px-3 py-1.5 mb-3">
                      <span className="text-xs">🔴</span>
                      <p className="text-red-400 text-xs font-bold">
                        {dias === null ? 'Sin contacto registrado' : `Sin contacto hace ${dias} días`}
                      </p>
                    </div>
                  )}

                  {!alerta && dias !== null && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-xs">✅</span>
                      <p className="text-green-400 text-xs">Contactado hace {dias} días</p>
                    </div>
                  )}

                  {c.telefono && (
                    <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => abrirWhatsApp(c)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-600 text-white py-2 rounded-xl text-xs font-black transition-colors">
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                      <button onClick={() => abrirLlamada(c)}
                        className="flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-xl text-xs font-black transition-colors">
                        <Phone size={14} />
                      </button>
                    </div>
                  )}

                  {c.zonas_interes && c.zonas_interes.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-3">
                      {c.zonas_interes.slice(0, 3).map(z => (
                        <span key={z} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs">{z}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
                  <label className={labelCls}>Nombre *</label>
                  <input value={nuevoCliente.nombre} onChange={e => setNuevoCliente(p => ({...p, nombre: e.target.value}))}
                    placeholder="Nombre completo" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente(p => ({...p, email: e.target.value}))}
                    placeholder="email@ejemplo.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input value={nuevoCliente.telefono} onChange={e => setNuevoCliente(p => ({...p, telefono: e.target.value}))}
                    placeholder="809-000-0000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Etapa</label>
                  <select value={nuevoCliente.etapa} onChange={e => setNuevoCliente(p => ({...p, etapa: e.target.value}))}
                    className={inputCls}>
                    {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Presupuesto mín.</label>
                  <input value={nuevoCliente.presupuesto_min} onChange={e => setNuevoCliente(p => ({...p, presupuesto_min: e.target.value}))}
                    placeholder="$100,000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Presupuesto máx.</label>
                  <input value={nuevoCliente.presupuesto_max} onChange={e => setNuevoCliente(p => ({...p, presupuesto_max: e.target.value}))}
                    placeholder="$300,000" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Tipo de propiedad</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => (
                    <button key={t} onClick={() => toggleTipo(t)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${nuevoCliente.tipo_propiedad.includes(t) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Zonas de interés</label>
                <div className="flex flex-wrap gap-2">
                  {ZONAS.map(z => (
                    <button key={z} onClick={() => toggleZona(z)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${nuevoCliente.zonas_interes.includes(z) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Notas</label>
                <textarea value={nuevoCliente.notas} onChange={e => setNuevoCliente(p => ({...p, notas: e.target.value}))}
                  placeholder="Observaciones del cliente..."
                  className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20" />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-zinc-800">
              <button onClick={() => setShowNuevoModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs uppercase tracking-widest hover:border-zinc-500 transition-all">
                Cancelar
              </button>
              <button onClick={guardarCliente} disabled={guardando || !nuevoCliente.nombre || !nuevoCliente.email}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs uppercase tracking-widest font-black hover:bg-white transition-all disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}