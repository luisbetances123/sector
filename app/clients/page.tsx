'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { UserPlus, Home, X, Search, Plus, MessageCircle, Phone, Clock, Pencil, Sparkles, StickyNote } from 'lucide-react'

interface Cliente {
  id: string
  name: string // Corrección a estructura nativa de la DB
  email: string
  phone?: string // Corrección a estructura nativa de la DB
  status: string // Corrección a estructura nativa de la DB
  tipo_propiedad?: string[]
  price?: string // Mapeado como el presupuesto almacenado en pipeline
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
  notas?: string
}

interface Nota {
  id: string
  cliente_id: string
  texto: string
  created_at: string
}

const ETAPAS = ['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']
const ZONAS = ['Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos', 'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millón', 'Mirador Norte', 'Mirador Sur']
const TIPOS = ['Apartamento', 'Casa', 'Villa', 'Penthouse', 'Local Comercial', 'Solar']
const DIAS_ALERTA = 3
const TASA_CAMBIO = 60 // Tasa estándar de conversión RD$ por 1 US$

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

function formatPrice(price: string, monedaDefault = 'USD') {
  if (!price) return '—'
  if (price.includes('US$') || price.includes('RD$')) return price
  
  const num = parseFloat(price.replace(/[^0-9.]/g, ''))
  if (isNaN(num) || num === 0) return price
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: monedaDefault, maximumFractionDigits: 0 }).format(num)
}

// Extrae el valor numérico absoluto de un string con formato ('US$ 150,000' -> 150000)
function normalizarMontoAUSD(montoStr: string | undefined): number {
  if (!montoStr) return 0
  const numero = parseFloat(montoStr.replace(/[^0-9.]/g, ''))
  if (isNaN(numero)) return 0
  
  // Si explícitamente dice RD$, se convierte a dólares para el algoritmo de matching
  if (montoStr.includes('RD')) {
    return numero / TASA_CAMBIO
  }
  return numero
}

function calcularMatch(cliente: Cliente, propiedad: Propiedad): number {
  let score = 0
  
  // 1. Match por sector geográfico (40 puntos)
  if (cliente.zonas_interes && cliente.zonas_interes.length > 0 && propiedad.sector) {
    const zonaMatch = cliente.zonas_interes.some(z =>
      propiedad.sector?.toLowerCase().includes(z.toLowerCase()) ||
      z.toLowerCase().includes(propiedad.sector?.toLowerCase() || '')
    )
    if (zonaMatch) score += 40
  }
  
  // 2. Match por tipo de inmueble (30 puntos)
  if (cliente.tipo_propiedad && cliente.tipo_propiedad.length > 0 && propiedad.type) {
    const tipoMatch = cliente.tipo_propiedad.some(t =>
      propiedad.type?.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(propiedad.type?.toLowerCase() || '')
    )
    if (tipoMatch) score += 30
  }
  
  // 3. Match inteligente Bimonetario de Presupuesto (30 puntos)
  if (cliente.price && propiedad.price) {
    const precioClienteUSD = normalizarMontoAUSD(cliente.price)
    const precioPropiedadUSD = normalizarMontoAUSD(propiedad.price)
    
    if (precioClienteUSD > 0 && precioPropiedadUSD > 0) {
      // Si el precio de la propiedad está dentro del presupuesto estimado del cliente (con margen del 15%)
      if (precioPropiedadUSD <= precioClienteUSD) {
        score += 30
      } else if (precioPropiedadUSD <= precioClienteUSD * 1.15) {
        score += 15
      }
    }
  }
  return score
}

const nuevoClienteInicial = {
  nombre: '', email: '', telefono: '', etapa: 'LEAD',
  price: '', currency: 'USD',
  zonas_interes: [] as string[], tipo_propiedad: [] as string[], notas: ''
}

export default function ClientesPage() {
  const router = useRouter() // <- CAMBIO 3: Inicializado aquí arriba correctamente para que lo usen las funciones
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [propiedadesAsignadas, setPropiedadesAsignadas] = useState<ClientePropiedad[]>([])
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [contactosCliente, setContactosCliente] = useState<Contacto[]>([])
  const [notasCliente, setNotasCliente] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [todasPropiedades, setTodasPropiedades] = useState<Propiedad[]>([])
  const [propiedadesMatch, setPropiedadesMatch] = useState<Propiedad[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [showNuevoModal, setShowNuevoModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState(nuevoClienteInicial)
  const [editForm, setEditForm] = useState(nuevoClienteInicial)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
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

  const abrirWhatsApp = async (cliente: Cliente, propiedadTexto?: string) => {
    await registrarContacto(cliente.id, 'whatsapp')
    const numero = cliente.phone?.replace(/\D/g, '')
    const mensaje = propiedadTexto || (() => {
      const etapaMensaje: Record<string, string> = {
        'LEAD': `Hola ${cliente.name}, te contacto de HOMVI. Vi que estás interesado en propiedades. ¿Tienes un momento para hablar?`,
        'BUSCANDO': `Hola ${cliente.name}, tengo algunas propiedades nuevas que podrían interesarte. ¿Cuándo podemos hablar?`,
        'EN OFERTA': `Hola ${cliente.name}, quería darte seguimiento a la oferta. ¿Tienes alguna duda o actualización?`,
        'CIERRE': `Hola ${cliente.name}, quería dar seguimiento al proceso de cierre. ¿Todo va bien?`,
      }
      return etapaMensaje[cliente.status] || `Hola ${cliente.name}, te contacto de HOMVI.`
    })()
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const compartirPropiedad = (cliente: Cliente, propiedad: Propiedad) => {
    const precio = formatPrice(propiedad.price, propiedad.moneda)
    const mensaje = `Hola ${cliente.name}, encontré una propiedad que podría interesarte:\n\n🏠 *${propiedad.title}*\n📍 ${propiedad.sector || propiedad.location}\n💰 ${precio}\n${propiedad.recamaras ? `🛏 ${propiedad.recamaras} habitaciones` : ''}\n\n¿Te gustaría saber más detalles?`
    abrirWhatsApp(cliente, mensaje)
  }

  const abrirLlamada = async (cliente: Cliente) => {
    await registrarContacto(cliente.id, 'llamada')
    window.open(`tel:${cliente.phone}`)
  }

  // <- CAMBIO 2: Modificada para redirigir directamente usando la Promise de Next.js
  const abrirPerfil = async (cliente: Cliente) => {
    router.push(`/clients/${cliente.id}`)
  }

  const guardarNota = async () => {
    if (!selectedCliente || !nuevaNota.trim()) return
    setGuardandoNota(true)
    const { data } = await supabase
      .from('notas_cliente')
      .insert({ cliente_id: selectedCliente.id, texto: nuevaNota.trim() })
      .select()
      .single()
    if (data) {
      setNotasCliente(prev => [data, ...prev])
      setNuevaNota('')
    }
    setGuardandoNota(false)
  }

  const eliminarNota = async (notaId: string) => {
    await supabase.from('notas_cliente').delete().eq('id', notaId)
    setNotasCliente(prev => prev.filter(n => n.id !== notaId))
  }

  const abrirEditar = () => {
    if (!selectedCliente) return
    
    // Separar moneda del valor si ya viene formateado
    let valorLimpio = selectedCliente.price || ''
    let monedaDetectada = 'USD'
if (valorLimpio.includes('RD$')) { monedaDetectada = 'RD'; valorLimpio = valorLimpio.replace(/[^0-9.]/g, '') }    else if (valorLimpio.includes('US$')) { monedaDetectada = 'USD'; valorLimpio = valorLimpio.replace(/[^0-9.]/g, '') }

    setEditForm({
      nombre: selectedCliente.name || '',
      email: selectedCliente.email || '',
      telefono: selectedCliente.phone || '',
      etapa: selectedCliente.status || 'LEAD',
      price: valorLimpio,
      currency: monedaDetectada,
      zonas_interes: selectedCliente.zonas_interes || [],
      tipo_propiedad: selectedCliente.tipo_propiedad || [],
      notas: selectedCliente.notas || '',
    })
    setShowEditModal(true)
  }

  const guardarEdicion = async () => {
    if (!selectedCliente || !editForm.nombre.trim()) return
    setGuardando(true)

    // Formatear precio
    const numeroLimpio = editForm.price.replace(/[^0-9.]/g, '')
    let precioFormateado = null
    if (numeroLimpio) {
      const valor = parseFloat(numeroLimpio)
      if (!isNaN(valor)) {
        const formato = new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(valor)
        precioFormateado = `${editForm.currency}$ ${formato}`
      }
    }

    const { data } = await supabase
      .from('clients')
      .update({
        name: editForm.nombre,
        email: editForm.email,
        phone: editForm.telefono || null,
        status: editForm.etapa,
        price: precioFormateado,
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
    if (!confirm(`¿Eliminar a ${selectedCliente.name}? Esta acción no se puede deshacer.`)) return
    await supabase.from('clients').delete().eq('id', selectedCliente.id)
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
    zonas_interes: prev.zonas_interes.includes(zona) ? prev.zonas_interes.filter(z => z !== zona) : [...prev.zonas_interes, zona]
  }))

  const toggleTipo = (tipo: string) => setNuevoCliente(prev => ({
    ...prev,
    tipo_propiedad: prev.tipo_propiedad.includes(tipo) ? prev.tipo_propiedad.filter(t => t !== tipo) : [...prev.tipo_propiedad, tipo]
  }))

  const toggleZonaEdit = (zona: string) => setEditForm(prev => ({
    ...prev,
    zonas_interes: prev.zonas_interes.includes(zona) ? prev.zonas_interes.filter(z => z !== zona) : [...prev.zonas_interes, zona]
  }))

  const toggleTipoEdit = (tipo: string) => setEditForm(prev => ({
    ...prev,
    tipo_propiedad: prev.tipo_propiedad.includes(tipo) ? prev.tipo_propiedad.filter(t => t !== tipo) : [...prev.tipo_propiedad, tipo]
  }))

  const guardarCliente = async () => {
    if (!nuevoCliente.nombre.trim() || !nuevoCliente.email.trim()) return
    setGuardando(true)
    
    const numeroLimpio = nuevoCliente.price.replace(/[^0-9.]/g, '')
    let precioFormateado = null
    if (numeroLimpio) {
      const valor = parseFloat(numeroLimpio)
      if (!isNaN(valor)) {
        const formato = new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(valor)
        precioFormateado = `${nuevoCliente.currency}$ ${formato}`
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('clients')
      .insert({
        name: nuevoCliente.nombre,
        email: nuevoCliente.email,
        phone: nuevoCliente.telefono || null,
        status: nuevoCliente.etapa,
        price: precioFormateado,
        initial: nuevoCliente.nombre.slice(0, 2).toUpperCase(),
        zonas_interes: nuevoCliente.zonas_interes,
        tipo_propiedad: nuevoCliente.tipo_propiedad,
        notas: nuevoCliente.notas || null,
        owner_id: user?.id,
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
    'LEAD': 'bg-zinc-700 text-zinc-300',
    'BUSCANDO': 'bg-blue-900/80 text-blue-300',
    'EN OFERTA': 'bg-amber-900/80 text-amber-300',
    'CIERRE': 'bg-green-900/80 text-green-300',
  }

  const inputCls = 'w-full bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500'
  const labelCls = 'text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block'

  // ── Vista perfil (Se mantiene intacta por seguridad) ───────────────────────────
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

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-2xl shrink-0">
              {selectedCliente.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white truncate">{selectedCliente.name}</h1>
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
                {selectedCliente.status}
              </span>
              <button onClick={abrirEditar}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all">
                <Pencil size={12} /> Editar
              </button>
            </div>
          </div>

          {selectedCliente.phone && (
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

          {!selectedCliente.phone && (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 mb-6">
              <p className="text-zinc-500 text-sm">Sin teléfono registrado</p>
              <button onClick={abrirEditar}
                className="text-amber-500 text-xs font-bold uppercase hover:text-white transition-colors">
                + Agregar teléfono
              </button>
            </div>
          )}

          {/* ══ MATCHMAKER ══ */}
          {propiedadesMatch.length > 0 && (
            <div className="bg-gradient-to-br from-amber-950/60 to-zinc-900 border-2 border-amber-600/40 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-amber-400" />
                <h2 className="text-amber-400 font-black uppercase text-sm tracking-wider">
                  {propiedadesMatch.length} Propiedades Sugeridas
                </h2>
                <span className="text-xs text-zinc-500">— match inteligente bimonetario</span>
              </div>
              <div className="flex flex-col gap-3">
                {propiedadesMatch.map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-black/30 border border-amber-800/30 rounded-xl p-3">
                    {p.image_url ? (
                      <img src={p.image_url} className="w-16 h-12 object-cover rounded-lg shrink-0" alt={p.title} />
                    ) : (
                      <div className="w-16 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xl">🏠</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{p.title}</p>
                      <p className="text-zinc-400 text-xs">{p.sector || p.location}</p>
                      <p className="text-amber-400 text-xs font-bold">{formatPrice(p.price, p.moneda)}</p>
                    </div>
                    {selectedCliente.phone && (
                      <button
                        onClick={() => compartirPropiedad(selectedCliente, p)}
                        className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-black transition-colors">
                        <MessageCircle size={12} />
                        Compartir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ HISTORIAL CONTACTOS ══ */}
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

          {/* ══ PROPIEDADES ASIGNADAS ══ */}
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
                      <p className="text-amber-500 text-xs font-bold">{formatPrice(rel.properties.price, rel.properties.moneda)}</p>
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

          {/* ══ PERFIL ══ */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black uppercase text-sm tracking-wider">Perfil del Cliente</h2>
              <button onClick={abrirEditar}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-xs uppercase transition-colors">
                <Pencil size={12} /> Editar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedCliente.phone && (
                <div><p className="text-zinc-500 text-xs uppercase">Teléfono</p><p className="text-white">{selectedCliente.phone}</p></div>
              )}
              {selectedCliente.price && (
                <div><p className="text-zinc-500 text-xs uppercase">Presupuesto Máx.</p><p className="text-white">{formatPrice(selectedCliente.price)}</p></div>
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
            </div>
          </div>

          {/* ══ NOTAS RÁPIDAS ══ */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote size={16} className="text-amber-500" />
              <h2 className="text-white font-black uppercase text-sm tracking-wider">Notas de seguimiento</h2>
              {notasCliente.length > 0 && (
                <span className="bg-zinc-700 text-zinc-300 text-xs font-bold px-2 py-0.5 rounded-full">{notasCliente.length}</span>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <textarea
                value={nuevaNota}
                onChange={e => setNuevaNota(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); guardarNota() } }}
                placeholder="Ej: 24 Mayo — Le gustó la cocina del apto en Naco pero el parqueo le pareció incómodo..."
                className="flex-1 bg-zinc-800 text-white px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none h-16 placeholder-zinc-600"
              />
              <button
                onClick={guardarNota}
                disabled={guardandoNota || !nuevaNota.trim()}
                className="shrink-0 bg-amber-500 hover:bg-white text-black px-4 rounded-xl font-black text-xs uppercase transition-all disabled:opacity-50">
                {guardandoNota ? '...' : '+ Nota'}
              </button>
            </div>

            {notasCliente.length === 0 ? (
              <p className="text-zinc-600 text-xs text-center py-2">Sin notas todavía — agrega observaciones de cada interacción</p>
            ) : (
              <div className="flex flex-col gap-2">
                {notasCliente.map(n => (
                  <div key={n.id} className="flex gap-3 bg-zinc-800/50 rounded-xl p-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{n.texto}</p>
                      <p className="text-zinc-600 text-[10px] mt-1">{formatFecha(n.created_at)}</p>
                    </div>
                    <button
                      onClick={() => eliminarNota(n.id)}
                      className="shrink-0 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 mt-0.5">
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

        {showEditModal && (
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
                    <input value={editForm.nombre} onChange={e => setEditForm(p => ({...p, nombre: e.target.value}))} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Email</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({...p, email: e.target.value}))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono</label>
                    <input value={editForm.telefono} onChange={e => setEditForm(p => ({...p, telefono: e.target.value}))} placeholder="809-000-0000" className={inputCls} />
                  </div>
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
                  <textarea value={editForm.notes} onChange={e => setEditForm(p => ({...p, notes: e.target.value}))}
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
        )}

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
                  className={`bg-zinc-900/40 border p-5 rounded-2xl cursor-pointer transition-all hover:bg-zinc-900 ${alerta && c.status !== 'CIERRE' ? 'border-red-800/50 hover:border-red-600' : 'border-zinc-800 hover:border-amber-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-black shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{c.name}</p>
                        <p className="text-zinc-500 text-xs truncate">{c.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0 ml-2 ${etapaColor[c.status] || 'bg-zinc-800 text-zinc-400'}`}>
                      {c.status}
                    </span>
                  </div>

                  {alerta && c.status !== 'CIERRE' && (
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

                  {c.phone && (
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
                <div className="col-span-2">
                  <label className={labelCls}>Presupuesto Estimado</label>
                  <div className="flex rounded-xl overflow-hidden border border-zinc-700 focus-within:border-amber-500">
                    <select value={nuevoCliente.currency} onChange={e => setNuevoCliente(p => ({...p, currency: e.target.value}))} className="bg-zinc-700 border-none text-white text-xs px-2 focus:outline-none font-bold cursor-pointer">
                      <option value="USD">USD ($)</option>
                      <option value="RD">DOP (RD$)</option>
                    </select>
                    <input value={nuevoCliente.price} onChange={e => setNuevoCliente(p => ({...p, price: e.target.value}))} placeholder="150,000" className="w-full bg-zinc-800 border-none px-4 py-2 text-white text-sm focus:outline-none" />
                  </div>
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
                <textarea value={nuevoCliente.notes} onChange={e => setNuevoCliente(p => ({...p, notes: e.target.value}))}
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