'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { Home, X, Search, Plus, MessageCircle, Phone, Clock, Pencil, Sparkles, StickyNote } from 'lucide-react'

interface Cliente {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  tipo_propiedad?: string[]
  price?: string
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
  estado?: string
  recamaras?: number
  banos?: number
  m2?: number
  moneda?: string
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
}

interface Nota {
  id: string
  cliente_id: string
  texto: string
  created_at: string
}

interface Tarea {
  id: string
  cliente_id: string
  titulo: string
  completada: boolean
  created_at: string
}

interface Bitacora {
  id: string
  cliente_id: string
  nota: string
  created_at: string
}

const ETAPAS = ['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']
const ZONAS = ['Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos', 'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millón', 'Mirador Norte', 'Mirador Sur']
const TIPOS = ['Apartamento', 'Casa', 'Villa', 'Penthouse', 'Local Comercial', 'Solar']
const DIAS_ALERTA = 3
const TASA_CAMBIO = 60

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-DO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

// FUNCIÓN CORREGIDA: Agregamos auto-multiplicador por 1,000 para corregir precios como "215" -> "215,000"
function formatPrice(price: string, monedaDefault = 'USD') {
  if (!price) return '—'
  
  // Si ya viene completamente formateado desde el perfil del cliente, lo dejamos pasar limpio
  if ((price.includes('US$') || price.includes('RD$') || price.includes('USD$')) && price.includes(',')) {
    return price
  }

  let limpio = price.replace(/,/g, '').trim()
  
  if (/\.\d{3}$/.test(limpio)) {
    limpio = limpio.replace(/\./g, '')
  }

  let num = parseFloat(limpio.replace(/[^0-9.]/g, ''))
  if (isNaN(num) || num === 0) return price

  // Si el formulario guardó solo las centenas (ej: 215), lo auto-corrige a miles (215,000)
  if (num > 0 && num < 1000) {
    num = num * 1000
  }

  // Detectamos si el string guardado ya indicaba explícitamente DOP/RD
  const esDOP = price.toUpperCase().includes('RD') || price.toUpperCase().includes('DOP') || monedaDefault === 'DOP'

  return new Intl.NumberFormat('es-DO', { 
    style: 'currency', 
    currency: esDOP ? 'DOP' : 'USD', 
    maximumFractionDigits: 0 
  }).format(num)
}

function normalizarMontoAUSD(montoStr: string | undefined): number {
  if (!montoStr) return 0
  let limpio = montoStr.replace(/[^0-9.]/g, '')
  let numero = parseFloat(limpio)
  if (isNaN(numero)) return 0
  
  // Ajuste preventivo en el matchmaker: si el presupuesto se guardó sin los miles, lo normalizamos
  if (numero > 0 && numero < 1000) {
    numero = numero * 1000
  }

  if (montoStr.includes('RD')) return numero / TASA_CAMBIO
  return numero
}

function calcularMatch(cliente: Cliente, propiedad: Propiedad): number {
  let score = 0
  if (cliente.zonas_interes && cliente.zonas_interes.length > 0 && propiedad.sector) {
    const zonaMatch = cliente.zonas_interes.some(z =>
      propiedad.sector?.toLowerCase().includes(z.toLowerCase()) ||
      z.toLowerCase().includes(propiedad.sector?.toLowerCase() || '')
    )
    if (zonaMatch) score += 40
  }
  if (cliente.tipo_propiedad && cliente.tipo_propiedad.length > 0 && propiedad.type) {
    const tipoMatch = cliente.tipo_propiedad.some(t =>
      propiedad.type?.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(propiedad.type?.toLowerCase() || '')
    )
    if (tipoMatch) score += 30
  }
  if (cliente.price && propiedad.price) {
    const precioClienteUSD = normalizarMontoAUSD(cliente.price)
    const precioPropiedadUSD = normalizarMontoAUSD(propiedad.price)
    if (precioClienteUSD > 0 && precioPropiedadUSD > 0) {
      if (precioPropiedadUSD <= precioClienteUSD) score += 30
      else if (precioPropiedadUSD <= precioClienteUSD * 1.15) score += 15
    }
  }
  return score
}

const editFormInicial = {
  nombre: '', email: '', telefono: '', etapa: 'LEAD',
  price: '', currency: 'USD',
  zonas_interes: [] as string[], tipo_propiedad: [] as string[], notas: ''
}

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [propiedadesAsignadas, setPropiedadesAsignadas] = useState<ClientePropiedad[]>([])
  const [contactosCliente, setContactosCliente] = useState<Contacto[]>([])
  const [notasCliente, setNotasCliente] = useState<Nota[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [bitacora, setBitacora] = useState<Bitacora[]>([])
  const [propiedadesMatch, setPropiedadesMatch] = useState<Propiedad[]>([])
  const [todasPropiedades, setTodasPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [guardandoTarea, setGuardandoTarea] = useState(false)
  const [nuevaBitacora, setNuevaBitacora] = useState('')
  const [guardandoBitacora, setGuardandoBitacora] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [editForm, setEditForm] = useState(editFormInicial)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.resolve(params).then(p => setClienteId(p.id))
  }, [params])

  useEffect(() => {
    if (!clienteId) return
    async function load() {
      setLoading(true)
      const [
        { data: clienteData },
        { data: props },
        { data: cts },
        { data: notas },
        { data: tareasData },
        { data: bitacoraData },
        { data: allProps },
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('id', clienteId).single(),
        supabase.from('cliente_properties').select('id, property_id, properties(*)').eq('cliente_id', clienteId),
        supabase.from('contactos_whatsapp').select('*').eq('cliente_id', clienteId).order('fecha', { ascending: false }),
        supabase.from('notas_cliente').select('*').eq('cliente_id', clienteId).order('created_at', { ascending: false }),
        supabase.from('tareas_cliente').select('*').eq('cliente_id', clienteId).order('created_at', { ascending: false }),
        supabase.from('bitacora_cliente').select('*').eq('cliente_id', clienteId).order('created_at', { ascending: false }),
        supabase.from('properties').select('*').eq('estado', 'disponible'),
      ])
      if (clienteData) {
        setCliente(clienteData)
        if (allProps) {
          const matches = allProps
            .map(p => ({ ...p, score: calcularMatch(clienteData, p) }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
          setPropiedadesMatch(matches)
        }
      }
      if (props) setPropiedadesAsignadas(props.map((r: any) => ({ id: r.id, property_id: r.property_id, properties: r.properties as Propiedad })))
      if (cts) setContactosCliente(cts)
      if (notas) setNotasCliente(notas)
      if (tareasData) setTareas(tareasData)
      if (bitacoraData) setBitacora(bitacoraData)
      setLoading(false)
    }
    load()
  }, [clienteId])

  const registrarContacto = async (tipo: 'whatsapp' | 'llamada') => {
    if (!clienteId) return
    const { data } = await supabase.from('contactos_whatsapp').insert({ cliente_id: clienteId, tipo }).select().single()
    if (data) setContactosCliente(prev => [data, ...prev])
  }

  const abrirWhatsApp = async (propiedadTexto?: string) => {
    if (!cliente) return
    await registrarContacto('whatsapp')
    const numero = cliente.phone?.replace(/\D/g, '')
    const etapaMensaje: Record<string, string> = {
      'LEAD': `Hola ${cliente.name}, te contacto de HOMVI. ¿Tienes un momento para hablar?`,
      'BUSCANDO': `Hola ${cliente.name}, tengo propiedades nuevas que podrían interesarte.`,
      'EN OFERTA': `Hola ${cliente.name}, quería darte seguimiento a la oferta.`,
      'CIERRE': `Hola ${cliente.name}, quería dar seguimiento al proceso de cierre.`,
    }
    const mensaje = propiedadTexto || etapaMensaje[cliente.status] || `Hola ${cliente.name}, te contacto de HOMVI.`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const compartirPropiedad = (propiedad: Propiedad) => {
    if (!cliente) return
    const precio = formatPrice(propiedad.price, propiedad.moneda)
    const mensaje = `Hola ${cliente.name}, encontré una propiedad que podría interesarte:\n\n🏠 *${propiedad.title}*\n📍 ${propiedad.sector || propiedad.location}\n💰 ${precio}\n\n¿Te gustaría saber más detalles?`
    abrirWhatsApp(mensaje)
  }

  const abrirLlamada = async () => {
    if (!cliente) return
    await registrarContacto('llamada')
    window.open(`tel:${cliente.phone}`)
  }

  const guardarNota = async () => {
    if (!clienteId || !nuevaNota.trim()) return
    setGuardandoNota(true)
    const { data } = await supabase.from('notas_cliente').insert({ cliente_id: clienteId, texto: nuevaNota.trim() }).select().single()
    if (data) { setNotasCliente(prev => [data, ...prev]); setNuevaNota('') }
    setGuardandoNota(false)
  }

  const eliminarNota = async (id: string) => {
    await supabase.from('notas_cliente').delete().eq('id', id)
    setNotasCliente(prev => prev.filter(n => n.id !== id))
  }

  const agregarTarea = async () => {
    if (!clienteId || !nuevaTarea.trim()) return
    setGuardandoTarea(true)
    const { data } = await supabase.from('tareas_cliente').insert({ cliente_id: clienteId, titulo: nuevaTarea.trim(), completada: false }).select().single()
    if (data) { setTareas(prev => [data, ...prev]); setNuevaTarea('') }
    setGuardandoTarea(false)
  }

  const toggleTarea = async (tarea: Tarea) => {
    const { error } = await supabase.from('tareas_cliente').update({ completada: !tarea.completada }).eq('id', tarea.id)
    if (!error) setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, completada: !t.completada } : t))
  }

  const eliminarTarea = async (id: string) => {
    await supabase.from('tareas_cliente').delete().eq('id', id)
    setTareas(prev => prev.filter(t => t.id !== id))
  }

  const agregarBitacora = async () => {
    if (!clienteId || !nuevaBitacora.trim()) return
    setGuardandoBitacora(true)
    const { data } = await supabase.from('bitacora_cliente').insert({ cliente_id: clienteId, nota: nuevaBitacora.trim() }).select().single()
    if (data) { setBitacora(prev => [data, ...prev]); setNuevaBitacora('') }
    setGuardandoBitacora(false)
  }

  const abrirEditar = () => {
    if (!cliente) return
    let valorLimpio = cliente.price || ''
    let monedaDetectada = 'USD'
    if (valorLimpio.includes('RD$')) { monedaDetectada = 'RD'; valorLimpio = valorLimpio.replace(/[^0-9.]/g, '') }
    else if (valorLimpio.includes('US$') || valorLimpio.includes('USD$')) { monedaDetectada = 'USD'; valorLimpio = valorLimpio.replace(/[^0-9.]/g, '') }
    setEditForm({
      nombre: cliente.name || '', email: cliente.email || '', telefono: cliente.phone || '',
      etapa: cliente.status || 'LEAD', price: valorLimpio, currency: monedaDetectada,
      zonas_interes: cliente.zonas_interes || [], tipo_propiedad: cliente.tipo_propiedad || [], notas: cliente.notas || '',
    })
    setShowEditModal(true)
  }

  const guardarEdicion = async () => {
    if (!cliente || !editForm.nombre.trim()) return
    setGuardando(true)
    const numeroLimpio = editForm.price.replace(/[^0-9.]/g, '')
    let precioFormateado = null
    if (numeroLimpio) {
      const valor = parseFloat(numeroLimpio)
      if (!isNaN(valor)) {
        // Al guardar el presupuesto desde edición, también nos aseguramos que si ponen "1000" o menos, se asuman miles de forma segura
        let valorFinal = valor
        if (valorFinal > 0 && valorFinal < 1000) valorFinal = valorFinal * 1000
        precioFormateado = `${editForm.currency}$ ${new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(valorFinal)}`
      }
    }
    const { data } = await supabase.from('clients').update({
      name: editForm.nombre, email: editForm.email, phone: editForm.telefono || null,
      status: editForm.etapa, price: precioFormateado,
      zonas_interes: editForm.zonas_interes, tipo_propiedad: editForm.tipo_propiedad, notas: editForm.notas || null,
    }).eq('id', cliente.id).select().single()
    if (data) { setCliente(data); setShowEditModal(false) }
    setGuardando(false)
  }

  const eliminarCliente = async () => {
    if (!cliente) return
    if (!confirm(`¿Eliminar a ${cliente.name}? Esta acción no se puede deshacer.`)) return
    await supabase.from('clients').delete().eq('id', cliente.id)
    router.push('/clients')
  }

  const abrirModalAsignar = async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (data) setTodasPropiedades(data)
    setShowAsignarModal(true)
  }

  const asignarPropiedad = async (propiedad: Propiedad) => {
    if (!clienteId) return
    const yaAsignada = propiedadesAsignadas.some(p => p.property_id === propiedad.id)
    if (yaAsignada) return
    const { data } = await supabase.from('cliente_properties').insert({ cliente_id: clienteId, property_id: propiedad.id }).select('id, property_id, properties(*)').single()
    if (data) {
      setPropiedadesAsignadas(prev => [...prev, { id: (data as any).id, property_id: (data as any).property_id, properties: (data as any).properties as Propiedad }])
      setShowAsignarModal(false)
    }
  }

  const desasignarPropiedad = async (relacionId: string) => {
    await supabase.from('cliente_properties').delete().eq('id', relacionId)
    setPropiedadesAsignadas(prev => prev.filter(p => p.id !== relacionId))
  }

  const propiedadesFiltradas = todasPropiedades.filter(p =>
    p.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.sector || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const inputCls = 'w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500'
  const labelCls = 'text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block'

  const diasContacto = contactosCliente.length > 0
    ? Math.floor((Date.now() - new Date(contactosCliente[0].fecha).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const sinContacto = diasContacto === null || diasContacto >= DIAS_ALERTA

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Cliente no encontrado</p>
          <button onClick={() => router.push('/clients')} className="px-4 py-2 bg-amber-500 text-black rounded-xl font-bold text-sm">Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <button onClick={() => router.push('/clients')}
        className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 mb-6 text-sm uppercase tracking-wider transition-colors">
        ← Volver a clientes
      </button>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-2xl shrink-0">
            {cliente.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white truncate">{cliente.name}</h1>
            <p className="text-zinc-400 text-sm">{cliente.email}</p>
            {diasContacto !== null ? (
              <p className={`text-xs mt-0.5 font-bold ${sinContacto ? 'text-red-400' : 'text-green-400'}`}>
                {sinContacto ? `⚠️ Sin contacto hace ${diasContacto} días` : `✅ Contactado hace ${diasContacto} días`}
              </p>
            ) : (
              <p className="text-zinc-500 text-xs mt-0.5">Sin contactos registrados</p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold uppercase text-center">{cliente.status}</span>
            <button onClick={abrirEditar} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all">
              <Pencil size={12} /> Editar
            </button>
          </div>
        </div>

        {/* ── WhatsApp / Llamar ── */}
        {cliente.phone ? (
          <div className="flex gap-3">
            <button onClick={() => abrirWhatsApp()}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl font-black text-sm uppercase transition-all">
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button onClick={abrirLlamada}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-2xl font-black text-sm uppercase transition-all">
              <Phone size={18} /> Llamar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3">
            <p className="text-zinc-500 text-sm">Sin teléfono registrado</p>
            <button onClick={abrirEditar} className="text-amber-500 text-xs font-bold uppercase hover:text-white transition-colors">+ Agregar teléfono</button>
          </div>
        )}

        {/* ── Matchmaker ── */}
        {propiedadesMatch.length > 0 && (
          <div className="bg-gradient-to-br from-amber-950/60 to-zinc-900 border-2 border-amber-600/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-amber-400" />
              <h2 className="text-amber-400 font-black uppercase text-sm tracking-wider">{propiedadesMatch.length} Propiedades Sugeridas</h2>
              <span className="text-xs text-zinc-500">— match inteligente bimonetario</span>
            </div>
            <div className="flex flex-col gap-3">
              {propiedadesMatch.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-black/30 border border-amber-800/30 rounded-xl p-3">
                  {p.image_url ? (
                    <img src={p.image_url} className="w-16 h-12 object-cover rounded-lg shrink-0" alt={p.title} />
                  ) : (
                    <div className="w-16 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0"><span className="text-xl">🏠</span></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{p.title}</p>
                    <p className="text-zinc-400 text-xs">{p.sector || p.location}</p>
                    <p className="text-amber-400 text-xs font-bold">{formatPrice(p.price, p.moneda)}</p>
                  </div>
                  {cliente.phone && (
                    <button onClick={() => compartirPropiedad(p)}
                      className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-black transition-colors">
                      <MessageCircle size={12} /> Compartir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tareas ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-white font-black uppercase text-sm tracking-wider flex items-center gap-2 mb-4">
            ✅ Tareas Pendientes
            <span className="ml-auto text-xs font-normal text-zinc-600">{tareas.filter(t => !t.completada).length} pendiente{tareas.filter(t => !t.completada).length !== 1 ? 's' : ''}</span>
          </h2>
          <div className="flex gap-2 mb-4">
            <input value={nuevaTarea} onChange={e => setNuevaTarea(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarTarea()}
              placeholder="Ej: Llamar el jueves, enviar contrato..."
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 placeholder:text-zinc-600" />
            <button onClick={agregarTarea} disabled={guardandoTarea || !nuevaTarea.trim()}
              className="px-4 py-2.5 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-all">
              + Agregar
            </button>
          </div>
          {tareas.length === 0 ? (
            <p className="text-zinc-700 text-sm text-center py-3">Sin tareas — agrega la primera arriba.</p>
          ) : (
            <div className="space-y-2">
              {tareas.map(tarea => (
                <div key={tarea.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${tarea.completada ? 'bg-zinc-900/50 border-zinc-800/50 opacity-50' : 'bg-zinc-800/50 border-zinc-700'}`}>
                  <button onClick={() => toggleTarea(tarea)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${tarea.completada ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 hover:border-amber-500'}`}>
                    {tarea.completada && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <span className={`flex-1 text-sm ${tarea.completada ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{tarea.titulo}</span>
                  <button onClick={() => eliminarTarea(tarea.id)} className="text-zinc-700 hover:text-red-400 transition-colors text-xs px-2">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bitácora ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-white font-black uppercase text-sm tracking-wider flex items-center gap-2 mb-4">
            📋 Bitácora de Interacciones
          </h2>
          <div className="flex gap-2 mb-4">
            <textarea value={nuevaBitacora} onChange={e => setNuevaBitacora(e.target.value)}
              placeholder="Ej: Llamé hoy y me dijo que prefiere ver el penthouse el jueves..."
              rows={2}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 resize-none" />
            <button onClick={agregarBitacora} disabled={guardandoBitacora || !nuevaBitacora.trim()}
              className="px-4 py-2.5 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-all self-start">
              + Nota
            </button>
          </div>
          {bitacora.length === 0 ? (
            <p className="text-zinc-700 text-sm text-center py-3">Sin notas — registra la primera interacción arriba.</p>
          ) : (
            <div className="space-y-3">
              {bitacora.map(entrada => (
                <div key={entrada.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                  <p className="text-zinc-300 text-sm leading-relaxed">{entrada.nota}</p>
                  <p className="text-zinc-600 text-xs mt-2">{formatFecha(entrada.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Historial Contactos ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
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

        {/* ── Propiedades Asignadas ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
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
                  {rel.properties.image_url && <img src={rel.properties.image_url} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{rel.properties.title}</p>
                    <p className="text-zinc-400 text-xs">{rel.properties.sector || rel.properties.location}</p>
                    <p className="text-amber-500 text-xs font-bold">{formatPrice(rel.properties.price, rel.properties.moneda)}</p>
                  </div>
                  <button onClick={() => desasignarPropiedad(rel.id)} className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Perfil ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-black uppercase text-sm tracking-wider">Perfil del Cliente</h2>
            <button onClick={abrirEditar} className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-xs uppercase transition-colors">
              <Pencil size={12} /> Editar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {cliente.phone && <div><p className="text-zinc-500 text-xs uppercase">Teléfono</p><p className="text-white">{cliente.phone}</p></div>}
            {cliente.price && <div><p className="text-zinc-500 text-xs uppercase">Presupuesto Máx.</p><p className="text-white">{formatPrice(cliente.price)}</p></div>}
            {cliente.tipo_propiedad && cliente.tipo_propiedad.length > 0 && (
              <div className="col-span-2">
                <p className="text-zinc-500 text-xs uppercase mb-1">Tipo</p>
                <div className="flex gap-2 flex-wrap">{cliente.tipo_propiedad.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs">{t}</span>)}</div>
              </div>
            )}
            {cliente.zonas_interes && cliente.zonas_interes.length > 0 && (
              <div className="col-span-2">
                <p className="text-zinc-500 text-xs uppercase mb-1">Zonas de Interés</p>
                <div className="flex gap-2 flex-wrap">{cliente.zonas_interes.map(z => <span key={z} className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">{z}</span>)}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Notas Rápidas ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <StickyNote size={16} className="text-amber-500" />
            <h2 className="text-white font-black uppercase text-sm tracking-wider">Notas de seguimiento</h2>
            {notasCliente.length > 0 && <span className="bg-zinc-700 text-zinc-300 text-xs font-bold px-2 py-0.5 rounded-full">{notasCliente.length}</span>}
          </div>
          <div className="flex gap-2 mb-4">
            <textarea value={nuevaNota} onChange={e => setNuevaNota(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); guardarNota() } }}
              placeholder="Ej: Le gustó el apto en Naco pero el parqueo le pareció incómodo..."
              className="flex-1 bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none h-16 placeholder-zinc-600" />
            <button onClick={guardarNota} disabled={guardandoNota || !nuevaNota.trim()}
              className="shrink-0 bg-amber-500 hover:bg-white text-black px-4 rounded-xl font-black text-xs uppercase transition-all disabled:opacity-50">
              {guardandoNota ? '...' : '+ Nota'}
            </button>
          </div>
          {notasCliente.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center py-2">Sin notas todavía</p>
          ) : (
            <div className="flex flex-col gap-2">
              {notasCliente.map(n => (
                <div key={n.id} className="flex gap-3 bg-zinc-800/50 rounded-xl p-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{n.texto}</p>
                    <p className="text-zinc-600 text-[10px] mt-1">{formatFecha(n.created_at)}</p>
                  </div>
                  <button onClick={() => eliminarNota(n.id)} className="shrink-0 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={eliminarCliente}
          className="w-full py-3 rounded-2xl border border-red-800/50 text-red-500 hover:bg-red-900/20 text-xs uppercase font-bold tracking-wider transition-all">
          Eliminar cliente
        </button>
      </div>

      {/* ── Modal Editar ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h3 className="text-white font-black uppercase text-sm tracking-wider">Editar Cliente</h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={labelCls}>Nombre *</label><input value={editForm.nombre} onChange={e => setEditForm(p => ({...p, nombre: e.target.value}))} className={inputCls} /></div>
                <div className="col-span-2"><label className={labelCls}>Email</label><input type="email" value={editForm.email} onChange={e => setEditForm(p => ({...p, email: e.target.value}))} className={inputCls} /></div>
                <div><label className={labelCls}>Teléfono</label><input value={editForm.telefono} onChange={e => setEditForm(p => ({...p, telefono: e.target.value}))} placeholder="809-000-0000" className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Etapa</label>
                  <select value={editForm.etapa} onChange={e => setEditForm(p => ({...p, etapa: e.target.value}))} className={inputCls}>
                    {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Presupuesto Máximo</label>
                  <div className="flex rounded-xl overflow-hidden border border-zinc-700 focus-within:border-amber-500">
                    <select value={editForm.currency} onChange={e => setEditForm(p => ({...p, currency: e.target.value}))} className="bg-zinc-700 border-none text-white text-xs px-2 focus:outline-none font-bold cursor-pointer">
                      <option value="USD">USD ($)</option>
                      <option value="RD">DOP (RD$)</option>
                    </select>
                    <input value={editForm.price} onChange={e => setEditForm(p => ({...p, price: e.target.value}))} placeholder="250,000" className="w-full bg-zinc-800 border-none px-4 py-2 text-white text-sm focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Tipo de propiedad</label>
                <div className="flex flex-wrap gap-2">
                  {TIPOS.map(t => <button key={t} onClick={() => setEditForm(p => ({...p, tipo_propiedad: p.tipo_propiedad.includes(t) ? p.tipo_propiedad.filter(x => x !== t) : [...p.tipo_propiedad, t]}))}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${editForm.tipo_propiedad.includes(t) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{t}</button>)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Zonas de interés</label>
                <div className="flex flex-wrap gap-2">
                  {ZONAS.map(z => <button key={z} onClick={() => setEditForm(p => ({...p, zonas_interes: p.zonas_interes.includes(z) ? p.zonas_interes.filter(x => x !== z) : [...p.zonas_interes, z]}))}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${editForm.zonas_interes.includes(z) ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{z}</button>)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Notas</label>
                <textarea value={editForm.notas} onChange={e => setEditForm(p => ({...p, notes: e.target.value}))} placeholder="Observaciones..." className="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-zinc-800">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs uppercase tracking-widest hover:border-zinc-500 transition-all">Cancelar</button>
              <button onClick={guardarEdicion} disabled={guardando || !editForm.nombre} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs uppercase tracking-widest font-black hover:bg-white transition-all disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Asignar ── */}
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
                      <p className="text-amber-500 text-xs font-bold">{formatPrice(p.price, p.moneda)}</p>
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