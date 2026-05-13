'use client'
import React from 'react'

import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../app/lib/supabase'

type Stage = 'LEAD' | 'BUSCANDO' | 'EN OFERTA' | 'CIERRE'

interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  etapa: Stage
  presupuestoMin: string
  presupuestoMax: string
  tipoPropiedad: string[]
  recamaras: string
  plazo: string
  financiamiento: string
  zonas: string[]
  notas: string
  tags: string[]
}

interface Comunicacion {
  id: string
  tipo: 'whatsapp' | 'email' | 'llamada' | 'nota'
  texto: string
  fecha: string
}

interface Propiedad {
  id: string
  nombre: string
  ubicacion: string
  precio: string
  area: string
  tipo: string
  imagen: string
}

interface Recordatorio {
  id: string
  texto: string
  fecha: string
  completado: boolean
}

interface FollowUp {
  id: string
  tipo: string
  titulo: string
  detalle: string
  fecha: string
  hora: string
  urgencia: string
  hecho: boolean
}

const diasRapidosFollowup = [
  { label: 'Mañana', dias: 1 },
  { label: '3 días', dias: 3 },
  { label: '1 semana', dias: 7 },
]

const etapaColor: Record<Stage, string> = {
  LEAD: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  BUSCANDO: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30',
  'EN OFERTA': 'text-green-400 bg-green-400/10 border-green-400/30',
  CIERRE: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
}

const etapas: Stage[] = ['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']

const plantillas = [
  { id: 'p1', label: 'Primer contacto', icono: '👋', mensaje: (n: string) => `Hola ${n}, te contacto porque creo que puedo ayudarte a encontrar la propiedad ideal. ¿Tienes unos minutos para conversar esta semana?` },
  { id: 'p2', label: 'Post visita', icono: '🏠', mensaje: (n: string) => `Hola ${n}, espero que hayas disfrutado la visita de hoy. ¿Tienes alguna pregunta sobre la propiedad que vimos?` },
  { id: 'p3', label: 'Follow-up', icono: '🔁', mensaje: (n: string) => `Hola ${n}, solo quería saber cómo vas con la decisión. Estoy aquí para ayudarte en lo que necesites.` },
  { id: 'p4', label: 'Nueva propiedad', icono: '✨', mensaje: (n: string) => `${n}, acaba de entrar una propiedad que creo que te va a interesar mucho. ¿Te la muestro esta semana?` },
  { id: 'p5', label: 'Negociación', icono: '🤝', mensaje: (n: string) => `Hola ${n}, he hablado con el vendedor y tenemos margen para negociar. ¿Podemos hablar hoy para coordinar los siguientes pasos?` },
  { id: 'p6', label: 'Cierre próximo', icono: '🎉', mensaje: (n: string) => `${n}, estamos muy cerca del cierre. Solo necesito confirmar algunos detalles finales. ¿Tienes disponibilidad esta semana?` },
]

const tipoIcono: Record<string, string> = {
  whatsapp: '💬',
  email: '✉️',
  llamada: '📞',
  nota: '📝',
}

const tipoColor: Record<string, string> = {
  whatsapp: 'text-green-400 bg-green-400/10 border-green-400/20',
  email: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  llamada: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20',
  nota: 'text-gray-300 bg-white/5 border-white/10',
}

function initiales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function generarMensajeAuto(cliente: Cliente): string {
  const nombre = cliente.nombre.split(' ')[0]
  const zona = cliente.zonas?.[0] || 'la zona'
  const msgs: Record<Stage, string[]> = {
    LEAD: [
      `Hola ${nombre}, te contacto de parte de Homvi. ¿Tienes unos minutos para conversar sobre lo que buscas?`,
      `Buenos días ${nombre}, me gustaría conocer qué tipo de propiedad estás buscando. ¿Te viene bien una llamada esta semana?`,
    ],
    BUSCANDO: [
      `Hola ${nombre}, tengo propiedades nuevas en ${zona} que creo que te van a interesar. ¿Cuándo podríamos coordinar una visita?`,
      `${nombre}, acaba de entrar una propiedad que coincide con lo que buscas. ¿Te la muestro esta semana?`,
    ],
    'EN OFERTA': [
      `Hola ${nombre}, quería darte seguimiento a la oferta. ¿Has tenido oportunidad de revisarla?`,
      `${nombre}, ¿cómo vas con la decisión? Estoy aquí para resolver cualquier duda.`,
    ],
    CIERRE: [
      `${nombre}, ya estamos muy cerca del cierre. ¿Tienes disponibilidad esta semana para coordinar la firma?`,
      `Hola ${nombre}, felicitaciones, estamos en la recta final. Te contacto para coordinar los últimos pasos.`,
    ],
  }
  const opciones = msgs[cliente.etapa]
  return opciones[Math.floor(Math.random() * opciones.length)]
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const diasRapidos = [
  { label: 'Mañana', dias: 1 },
  { label: '3 días', dias: 3 },
  { label: '1 semana', dias: 7 },
  { label: '2 semanas', dias: 14 },
]



const TAGS_DISPONIBLES = ['🔥 Hot', '❄️ Frío', '💰 Investor', '👑 Luxury', '🌎 Foreign', '✅ Pre-aprobado', '🤝 Referido', '🏢 Comercial']

function TagSelector({ clienteId, tags, onUpdate }: { clienteId: string, tags: string[], onUpdate: (tags: string[]) => void }) {
  const [abierto, setAbierto] = React.useState(false)

  const toggle = async (tag: string) => {
    const nuevos = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    await supabase.from('clientes').update({ tags: nuevos }).eq('id', clienteId)
    onUpdate(nuevos)
  }

  return (
    <div className="relative">
      <button onClick={() => setAbierto(!abierto)}
        className="text-[11px] px-3 py-1 rounded-full border border-dashed border-[#d4af37]/40 text-[#d4af37]/60 hover:border-[#d4af37] hover:text-[#d4af37] transition-all">
        + Tag
      </button>
      {abierto && (
        <div className="absolute top-8 left-0 z-50 bg-[#111] border border-white/10 rounded-2xl p-3 flex flex-wrap gap-2 w-64 shadow-2xl">
          {TAGS_DISPONIBLES.map(tag => (
            <button key={tag} onClick={() => toggle(tag)}
              className={`text-[11px] px-3 py-1 rounded-full border font-bold transition-all ${tags.includes(tag) ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
              {tag}
            </button>
          ))}
          <button onClick={() => setAbierto(false)} className="w-full text-[10px] text-gray-600 hover:text-gray-400 mt-1">Cerrar</button>
        </div>
      )}
    </div>
  )
}

function ResumenAI({ cliente, comunicaciones, propiedades }: { cliente: any, comunicaciones: any[], propiedades: any[] }) {
  const [resumen, setResumen] = React.useState("")
  const [cargando, setCargando] = React.useState(true)

  React.useEffect(() => {
    const generar = async () => {
      setCargando(true)
      const contexto = [
        `Cliente: ${cliente.nombre}`,
        `Etapa: ${cliente.etapa}`,
        `Presupuesto: ${cliente.presupuestoMin} - ${cliente.presupuestoMax}`,
        `Tipo propiedad: ${(cliente.tipoPropiedad || []).join(", ")}`,
        `Zonas: ${(cliente.zonas || []).join(", ")}`,
        `Recamaras: ${cliente.recamaras}`,
        `Financiamiento: ${cliente.financiamiento}`,
        `Notas: ${cliente.notas}`,
        `Propiedades asignadas: ${propiedades.map((p: any) => p.nombre).join(", ") || "ninguna"}`,
        `Ultimas comunicaciones: ${comunicaciones.slice(0, 3).map((c: any) => c.texto).join(" | ") || "ninguna"}`,
      ].join("\n")

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 120,
            messages: [{ role: "user", content: `Basado en este perfil de cliente inmobiliario, genera UN resumen ejecutivo de máximo 2 líneas en español. Incluye qué busca, presupuesto y estado actual. Sin bullets, sin títulos, directo al punto:\n\n${contexto}` }]
          })
        })
        const data = await res.json()
        setResumen(data.content?.[0]?.text || "No se pudo generar el resumen.")
      } catch {
        setResumen("No se pudo generar el resumen.")
      }
      setCargando(false)
    }
    if (cliente?.nombre) generar()
  }, [cliente?.id])

  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold">✨ Resumen AI</span>
        {cargando && <span className="text-[10px] text-gray-500 animate-pulse">Generando...</span>}
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{cargando ? "" : resumen}</p>
    </div>
  )
}

export default function ClienteDetalle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [mostrarCopilot, setMostrarCopilot] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [tabActivo, setTabActivo] = useState<'auto' | 'plantillas'>('auto')
  const [historial, setHistorial] = useState<Comunicacion[]>([])
  const [nuevaNota, setNuevaNota] = useState('')

  // Propiedades
  const [propiedadesAsignadas, setPropiedadesAsignadas] = useState<Propiedad[]>([])
  const [todasPropiedades, setTodasPropiedades] = useState<Propiedad[]>([])
  const [modalPropiedades, setModalPropiedades] = useState(false)
  const [searchProp, setSearchProp] = useState('')
  const [asignando, setAsignando] = useState<string | null>(null)

  // Recordatorios
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [modalRecordatorio, setModalRecordatorio] = useState(false)
  const [textoRecordatorio, setTextoRecordatorio] = useState('')
  const [fechaRecordatorio, setFechaRecordatorio] = useState('')
  const [guardandoRecordatorio, setGuardandoRecordatorio] = useState(false)

  // Follow-ups
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [modalFollowup, setModalFollowup] = useState(false)
  const [fuTipo, setFuTipo] = useState('llamada')
  const [fuTitulo, setFuTitulo] = useState('')
  const [fuDetalle, setFuDetalle] = useState('')
  const [fuFecha, setFuFecha] = useState('')
  const [fuHora, setFuHora] = useState('')
  const [fuUrgencia, setFuUrgencia] = useState('media')
  const [guardandoFu, setGuardandoFu] = useState(false)

  useEffect(() => {
    const cargarCliente = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single()

      if (data && !error) {
        setTags(data.tags || [])
        setCliente({
          id: data.id,
          nombre: data.nombre,
          telefono: data.telefono || '',
          email: data.email || '',
          etapa: data.etapa as Stage,
          presupuestoMin: data.presupuesto_min || '',
          presupuestoMax: data.presupuesto_max || '',
          tipoPropiedad: data.tipo_propiedad || [],
          recamaras: data.recamaras || '',
          plazo: data.plazo || '',
          financiamiento: data.financiamiento || '',
          zonas: data.zonas || [],
          notas: data.notas || '',
          tags: data.tags || [],
        })
      }
    }

    const cargarHistorial = async () => {
      const { data } = await supabase
        .from('historial')
        .select('*')
        .eq('cliente_id', id)
        .order('fecha', { ascending: false })

      if (data) {
        setHistorial(data.map((h) => ({
          id: h.id,
          tipo: h.tipo,
          texto: h.texto,
          fecha: h.fecha,
        })))
      }
    }

    const cargarPropiedadesAsignadas = async () => {
      const { data } = await supabase
        .from('cliente_propiedades')
        .select('propiedad_id')
        .eq('cliente_id', id)

      if (data && data.length > 0) {
        const ids = data.map((r) => r.propiedad_id)
        const { data: props } = await supabase
          .from('propiedades')
          .select('*')
          .in('id', ids)
        if (props) setPropiedadesAsignadas(props.map(mapProp))
      }
    }

    const cargarTodasPropiedades = async () => {
      const { data } = await supabase.from('propiedades').select('*').order('nombre')
      if (data) setTodasPropiedades(data.map(mapProp))
    }

    const cargarRecordatorios = async () => {
      const { data } = await supabase
        .from('recordatorios')
        .select('*')
        .eq('cliente_id', id)
        .eq('completado', false)
        .order('fecha', { ascending: true })
      if (data) setRecordatorios(data)
    }

    const cargarFollowups = async () => {
      const { data } = await supabase
        .from('followups')
        .select('*')
        .eq('cliente_id', id)
        .eq('hecho', false)
        .order('fecha', { ascending: true })
      if (data) setFollowups(data)
    }

    cargarCliente()
    cargarHistorial()
    cargarPropiedadesAsignadas()
    cargarTodasPropiedades()
    cargarRecordatorios()
    cargarFollowups()
  }, [id])

  function mapProp(p: Record<string, string>): Propiedad {
    return {
      id: p.id,
      nombre: p.nombre,
      ubicacion: p.ubicacion,
      precio: p.precio,
      area: p.area,
      tipo: p.tipo,
      imagen: p.imagen,
    }
  }

  const asignarPropiedad = async (propId: string) => {
    setAsignando(propId)
    const { error } = await supabase
      .from('cliente_propiedades')
      .insert({ cliente_id: id, propiedad_id: propId })

    if (!error) {
      const prop = todasPropiedades.find((p) => p.id === propId)
      if (prop) setPropiedadesAsignadas((prev) => [...prev, prop])
      await registrarComunicacion('nota', `Propiedad asignada: ${todasPropiedades.find(p => p.id === propId)?.nombre}`)
    }
    setAsignando(null)
  }

  const desasignarPropiedad = async (propId: string) => {
    await supabase
      .from('cliente_propiedades')
      .delete()
      .eq('cliente_id', id)
      .eq('propiedad_id', propId)
    setPropiedadesAsignadas((prev) => prev.filter((p) => p.id !== propId))
  }

  const guardarFollowup = async () => {
    if (!fuTitulo.trim() || !fuFecha) return
    setGuardandoFu(true)
    const { data, error } = await supabase
      .from('followups')
      .insert({ cliente_id: id, tipo: fuTipo, titulo: fuTitulo.trim(), detalle: fuDetalle.trim(), fecha: fuFecha, hora: fuHora, urgencia: fuUrgencia })
      .select()
      .single()
    if (!error && data) {
      setFollowups((prev) => [...prev, data])
      await registrarComunicacion('nota', `Follow-up creado: ${fuTitulo}`)
      setFuTitulo(''); setFuDetalle(''); setFuFecha(''); setFuHora(''); setFuTipo('llamada'); setFuUrgencia('media')
      setModalFollowup(false)
    }
    setGuardandoFu(false)
  }

  const setDiaRapidoFu = (dias: number) => {
    setFuFecha(new Date(Date.now() + dias * 86400000).toISOString().split('T')[0])
  }

  const guardarRecordatorio = async () => {
    if (!textoRecordatorio.trim() || !fechaRecordatorio) return
    setGuardandoRecordatorio(true)
    const { data, error } = await supabase
      .from('recordatorios')
      .insert({ cliente_id: id, texto: textoRecordatorio.trim(), fecha: fechaRecordatorio })
      .select()
      .single()

    if (!error && data) {
      setRecordatorios((prev) => [...prev, data])
      setTextoRecordatorio('')
      setFechaRecordatorio('')
      setModalRecordatorio(false)
    }
    setGuardandoRecordatorio(false)
  }

  const completarRecordatorio = async (recId: string) => {
    await supabase.from('recordatorios').update({ completado: true }).eq('id', recId)
    setRecordatorios((prev) => prev.filter((r) => r.id !== recId))
  }

  const setDiaRapido = (dias: number) => {
    const fecha = new Date(Date.now() + dias * 86400000).toISOString().split('T')[0]
    setFechaRecordatorio(fecha)
  }

  const registrarComunicacion = async (tipo: Comunicacion['tipo'], texto: string) => {
    const nueva = {
      id: Date.now().toString(),
      cliente_id: id,
      tipo,
      texto,
      fecha: new Date().toISOString(),
    }
    await supabase.from('historial').insert(nueva)
    setHistorial((prev) => [{ id: nueva.id, tipo, texto, fecha: nueva.fecha }, ...prev])
  }

  const cambiarEtapa = async (nuevaEtapa: Stage) => {
    if (!cliente) return
    await supabase.from('clientes').update({ etapa: nuevaEtapa }).eq('id', id)
    setCliente({ ...cliente, etapa: nuevaEtapa })
  }

  const eliminarCliente = async () => {
    await supabase.from('clientes').delete().eq('id', id)
    router.push('/dashboard')
  }

  const seleccionarMensaje = (texto: string) => {
    setMensaje(texto)
    setMostrarCopilot(true)
    setCopiado(false)
  }

  const copiar = () => {
    navigator.clipboard.writeText(mensaje)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const abrirWhatsApp = () => {
    if (!cliente?.telefono || !mensaje) return
    const numero = cliente.telefono.replace(/\D/g, '')
    registrarComunicacion('whatsapp', mensaje)
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const abrirEmail = () => {
    if (!cliente?.email) return
    registrarComunicacion('email', `Email enviado a ${cliente.email}`)
    window.open(`mailto:${cliente.email}`, '_blank')
  }

  const abrirLlamada = () => {
    if (!cliente?.telefono) return
    registrarComunicacion('llamada', `Llamada a ${cliente.telefono}`)
    window.open(`tel:${cliente.telefono}`, '_blank')
  }

  const agregarNota = () => {
    if (!nuevaNota.trim()) return
    registrarComunicacion('nota', nuevaNota.trim())
    setNuevaNota('')
  }

  const propiedadesAsignadasIds = new Set(propiedadesAsignadas.map((p) => p.id))
  const propiedadesFiltradas = todasPropiedades.filter(
    (p) => !propiedadesAsignadasIds.has(p.id) &&
      (p.nombre.toLowerCase().includes(searchProp.toLowerCase()) ||
        p.ubicacion.toLowerCase().includes(searchProp.toLowerCase()))
  )

  if (!cliente) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-300 font-sans">
      Cargando cliente...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <button onClick={() => router.push('/dashboard')} className="text-xs uppercase tracking-widest text-gray-300 hover:text-white transition-colors font-bold">
          ← Dashboard
        </button>
        <div className="flex-1" />
        <button onClick={() => router.push(`/clients/${id}/edit`)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors font-bold">
          Editar cliente
        </button>
        <button onClick={eliminarCliente} className="text-xs uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors font-bold">
          Eliminar cliente
        </button>
        <span className={`text-xs px-3 py-1 rounded-full font-bold border uppercase tracking-widest ${etapaColor[cliente.etapa]}`}>
          {cliente.etapa}
        </span>
      </div>

      {/* Resumen AI */}
      <ResumenAI cliente={cliente} comunicaciones={comunicaciones} propiedades={propiedadesAsignadas} />


      {/* Tags */}
      <div className="mx-6 mt-3 flex flex-wrap gap-2 items-center">
        {(cliente.tags || []).map((tag: string) => (
          <span key={tag} className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full font-bold border border-white/10 bg-white/5 text-gray-300">
            {tag}
            <button onClick={async () => {
              const nuevos = (cliente.tags || []).filter((t: string) => t !== tag)
              await supabase.from('clientes').update({ tags: nuevos }).eq('id', id)
              setCliente({ ...cliente, tags: nuevos })
            }} className="ml-1 text-gray-500 hover:text-red-400 transition-colors">×</button>
          </span>
        ))}
        <TagSelector clienteId={id} tags={cliente.tags || []} onUpdate={(nuevos) => setCliente({ ...cliente, tags: nuevos })} />
      </div>

      {/* Perfil */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          {initiales(cliente.nombre)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{cliente.nombre.split(' ').map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')}</h1>
          <p className="text-gray-300 text-sm mt-0.5">{cliente.telefono}{cliente.telefono && cliente.email && ' · '}{cliente.email}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={() => { seleccionarMensaje(generarMensajeAuto(cliente)); setTabActivo('auto') }}
            className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d4af37]/20 transition-all">
            ✨ Generar mensaje
          </button>
          <button onClick={() => { setMostrarCopilot(true); setTabActivo('plantillas'); setMensaje('') }}
            className="bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
            📋 Plantillas
          </button>
          {cliente.telefono && (
            <button onClick={() => {
              const numero = cliente.telefono.replace(/\D/g, '')
              registrarComunicacion('whatsapp', `WhatsApp abierto con ${cliente.nombre}`)
              window.open(`https://wa.me/${numero}`, '_blank')
            }}
              className="bg-green-400/10 border border-green-400/30 text-green-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-400/20 transition-all">
              WhatsApp →
            </button>
          )}
          {cliente.email && (
            <button onClick={abrirEmail}
              className="bg-blue-400/10 border border-blue-400/30 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-400/20 transition-all">
              Email →
            </button>
          )}
          {cliente.telefono && (
            <button onClick={abrirLlamada}
              className="bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
              Llamar →
            </button>
          )}
        </div>
      </div>

      {/* Panel de mensajes */}
      {mostrarCopilot && (
        <div className="mx-6 mt-4 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-[1.5rem] p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex">
              <button onClick={() => setTabActivo('auto')}
                className={`px-4 py-2 text-xs font-bold rounded-l-xl border transition-all ${tabActivo === 'auto' ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]' : 'bg-transparent border-white/10 text-gray-300'}`}>
                ✨ Auto
              </button>
              <button onClick={() => setTabActivo('plantillas')}
                className={`px-4 py-2 text-xs font-bold rounded-r-xl border-t border-r border-b transition-all ${tabActivo === 'plantillas' ? 'bg-blue-400/10 border-blue-400/30 text-blue-400' : 'bg-transparent border-white/10 text-gray-300'}`}>
                📋 Plantillas
              </button>
            </div>
            <button onClick={() => setMostrarCopilot(false)} className="text-gray-300 hover:text-white transition-colors text-lg">✕</button>
          </div>

          {tabActivo === 'plantillas' && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {plantillas.map((p) => (
                <button key={p.id} onClick={() => seleccionarMensaje(p.mensaje(cliente.nombre.split(' ')[0]))}
                  className="bg-[#050505] border border-white/5 rounded-xl p-3 text-gray-300 text-xs text-left flex items-center gap-2 hover:border-[#d4af37]/30 hover:text-white transition-all">
                  <span className="text-base">{p.icono}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          )}

          {mensaje && (
            <>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50 resize-none transition-all"
              />
              <div className="flex gap-2 mt-3">
                {tabActivo === 'auto' && (
                  <button onClick={() => seleccionarMensaje(generarMensajeAuto(cliente))}
                    className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d4af37]/20 transition-all">
                    Otro mensaje
                  </button>
                )}
                <button onClick={copiar}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${copiado ? 'bg-green-400/10 border-green-400/30 text-green-400' : 'bg-blue-400/10 border-blue-400/30 text-blue-400'}`}>
                  {copiado ? '✓ Copiado' : 'Copiar'}
                </button>
                {cliente.telefono && (
                  <button onClick={abrirWhatsApp}
                    className="ml-auto bg-green-400/10 border border-green-400/30 text-green-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-400/20 transition-all">
                    Enviar por WhatsApp →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-4">
        <div className="p-6 border-r border-white/5">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-4">Perfil de Búsqueda</h3>
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden mb-4">
            {cliente.presupuestoMin && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-300">Presupuesto</span>
                <span className="text-sm text-green-400 font-bold">${cliente.presupuestoMin} – ${cliente.presupuestoMax}</span>
              </div>
            )}
            {cliente.tipoPropiedad?.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-300">Tipo</span>
                <span className="text-sm text-white">{cliente.tipoPropiedad.join(' · ')}</span>
              </div>
            )}
            {cliente.recamaras && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-300">Recámaras</span>
                <span className="text-sm text-white">{cliente.recamaras}</span>
              </div>
            )}
            {cliente.plazo && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-300">Plazo</span>
                <span className="text-sm text-white">{cliente.plazo}</span>
              </div>
            )}
            {cliente.financiamiento && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs text-gray-300">Financiamiento</span>
                <span className="text-sm text-white">{cliente.financiamiento}</span>
              </div>
            )}
          </div>

          {cliente.zonas?.length > 0 && (
            <>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-3">Zonas de Interés</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {cliente.zonas.map((zona) => (
                  <span key={zona} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">{zona}</span>
                ))}
              </div>
            </>
          )}

          {cliente.notas && (
            <>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-3">Notas</h3>
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-2xl p-4 text-sm text-gray-300 italic leading-relaxed">
                {cliente.notas}
              </div>
            </>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-4">Etapa del Pipeline</h3>
          <div className="flex flex-col gap-2 mb-6">
            {etapas.map((e) => (
              <button key={e} onClick={() => cambiarEtapa(e)}
                className={`px-4 py-3 rounded-2xl border text-sm font-bold text-left flex items-center gap-3 transition-all ${cliente.etapa === e ? etapaColor[e] : 'bg-[#0a0a0a] border-white/5 text-gray-300 hover:border-white/20'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cliente.etapa === e ? 'bg-current' : 'bg-white/20'}`} />
                {e}
                {cliente.etapa === e && <span className="ml-auto text-xs font-normal opacity-60">actual</span>}
              </button>
            ))}
          </div>

          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-4">Acciones Rápidas</h3>
          <div className="flex flex-col gap-2">
            <button onClick={() => setModalPropiedades(true)}
              className="px-4 py-3 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/20 text-sm text-[#d4af37] text-left hover:bg-[#d4af37]/10 transition-all font-bold">
              🏠 Asignar propiedad
            </button>
            <button onClick={() => setModalFollowup(true)}
              className="px-4 py-3 rounded-2xl bg-blue-400/5 border border-blue-400/20 text-sm text-blue-400 text-left hover:bg-blue-400/10 transition-all font-bold">
              📋 Crear follow-up
            </button>
            <button onClick={() => setModalRecordatorio(true)}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 text-left hover:border-[#d4af37]/30 hover:text-white transition-all">
              🔔 Crear recordatorio
            </button>
            <button onClick={() => router.push('/today')}
              className="px-4 py-3 rounded-2xl bg-[#0a0a0a] border border-white/5 text-sm text-gray-300 text-left hover:border-[#d4af37]/30 hover:text-white transition-all">
              Agendar cita →
            </button>
          </div>

          {/* Follow-ups del cliente */}
          {followups.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-3">
                Follow-ups Pendientes
                <span className="ml-2 bg-blue-400/10 text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded-full text-xs">
                  {followups.length}
                </span>
              </h3>
              <div className="flex flex-col gap-2">
                {followups.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 bg-[#0a0a0a] border border-white/5 rounded-2xl px-4 py-3">
                    <span className="text-base flex-shrink-0 mt-0.5">
                      {f.tipo === 'llamada' ? '📞' : f.tipo === 'visita' ? '🏠' : f.tipo === 'documento' ? '📄' : '📌'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-white font-bold">{f.titulo}</p>
                      <p className="text-xs text-blue-400 mt-0.5">
                        {new Date(f.fecha + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {f.hora && ` · ${f.hora}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recordatorios del cliente */}
          {recordatorios.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-3">
                Recordatorios
                <span className="ml-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 rounded-full text-xs">
                  {recordatorios.length}
                </span>
              </h3>
              <div className="flex flex-col gap-2">
                {recordatorios.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 bg-[#0a0a0a] border border-white/5 rounded-2xl px-4 py-3">
                    <button
                      onClick={() => completarRecordatorio(r.id)}
                      className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0 mt-0.5 hover:border-green-400 hover:bg-green-400/10 transition-all"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{r.texto}</p>
                      <p className="text-xs text-[#d4af37] mt-0.5">
                        {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Propiedades asignadas */}
      <div className="px-6 pb-2 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold">
            Propiedades de Interés
            {propiedadesAsignadas.length > 0 && (
              <span className="ml-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 rounded-full text-xs">
                {propiedadesAsignadas.length}
              </span>
            )}
          </h3>
          <button onClick={() => setModalPropiedades(true)} className="text-xs text-[#d4af37] hover:text-[#d4af37]/80 transition-colors font-bold">
            + Agregar
          </button>
        </div>

        {propiedadesAsignadas.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/5 border-dashed rounded-2xl py-8 text-center">
            <p className="text-gray-300 text-sm">Sin propiedades asignadas</p>
            <button onClick={() => setModalPropiedades(true)} className="mt-3 text-xs text-[#d4af37] hover:underline">
              Asignar una propiedad →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propiedadesAsignadas.map((prop) => (
              <div key={prop.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#d4af37]/20 transition-all group">
                <div className="h-36 overflow-hidden relative">
                  <img src={prop.imagen} alt={prop.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-white bg-black/50 backdrop-blur-md px-2 py-1 rounded-full">
                    {prop.tipo}
                  </div>
                  <button onClick={() => desasignarPropiedad(prop.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs transition-all opacity-0 group-hover:opacity-100">
                    ✕
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white truncate">{prop.nombre}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{prop.ubicacion}</p>
                  <p className="text-xs text-[#d4af37] font-bold mt-1">{prop.precio} · {prop.area}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal follow-up */}
      {modalFollowup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-md">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Nuevo Follow-up</h2>
                <p className="text-xs text-gray-300 mt-1">Para {cliente.nombre.split(' ')[0]}</p>
              </div>
              <button onClick={() => setModalFollowup(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all">✕</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* Tipo */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">Tipo</label>
                <div className="flex gap-2">
                  {[{ v: 'llamada', i: '📞' }, { v: 'visita', i: '🏠' }, { v: 'documento', i: '📄' }, { v: 'otro', i: '📌' }].map((t) => (
                    <button key={t.v} onClick={() => setFuTipo(t.v)}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-all ${fuTipo === t.v ? 'bg-blue-400/10 border-blue-400/30 text-blue-400' : 'border-white/10 text-gray-300'}`}>
                      {t.i}
                    </button>
                  ))}
                </div>
              </div>
              {/* Título */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">Tarea</label>
                <input type="text" value={fuTitulo} onChange={(e) => setFuTitulo(e.target.value)}
                  placeholder="ej: Llamar para confirmar visita"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-400/50 transition-all"
                  autoFocus />
              </div>
              {/* Detalle */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">Detalle (opcional)</label>
                <input type="text" value={fuDetalle} onChange={(e) => setFuDetalle(e.target.value)}
                  placeholder="ej: Confirmar horario de la tarde"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-400/50 transition-all" />
              </div>
              {/* Fecha */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">¿Cuándo?</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {diasRapidosFollowup.map((d) => (
                    <button key={d.dias} onClick={() => setDiaRapidoFu(d.dias)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 text-gray-300 hover:border-blue-400/30 hover:text-blue-400 transition-all">
                      {d.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="date" value={fuFecha} onChange={(e) => setFuFecha(e.target.value)}
                    className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-400/50 transition-all" />
                  <input type="time" value={fuHora} onChange={(e) => setFuHora(e.target.value)}
                    className="w-32 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-400/50 transition-all" />
                </div>
              </div>
              {/* Urgencia */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">Urgencia</label>
                <div className="flex gap-2">
                  {[{ v: 'alta', l: 'Urgente', c: 'text-red-400 border-red-400/30 bg-red-400/10' },
                    { v: 'media', l: 'Esta semana', c: 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10' },
                    { v: 'baja', l: 'Sin prisa', c: 'text-green-400 border-green-400/30 bg-green-400/10' }].map((u) => (
                    <button key={u.v} onClick={() => setFuUrgencia(u.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${fuUrgencia === u.v ? u.c : 'border-white/10 text-gray-300'}`}>
                      {u.l}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={guardarFollowup}
                disabled={!fuTitulo.trim() || !fuFecha || guardandoFu}
                className="w-full py-3 rounded-2xl bg-blue-400 text-black text-xs font-bold uppercase tracking-widest hover:bg-blue-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                {guardandoFu ? 'Guardando...' : 'Guardar Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal recordatorio */}
      {modalRecordatorio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-md">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Nuevo Recordatorio</h2>
                <p className="text-xs text-gray-300 mt-1">Para {cliente.nombre.split(' ')[0]}</p>
              </div>
              <button onClick={() => setModalRecordatorio(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all">
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">¿Qué hacer?</label>
                <input
                  type="text"
                  value={textoRecordatorio}
                  onChange={(e) => setTextoRecordatorio(e.target.value)}
                  placeholder="ej: Llamar para hacer seguimiento de la oferta"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2 block">¿Cuándo?</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {diasRapidos.map((d) => (
                    <button key={d.dias} onClick={() => setDiaRapido(d.dias)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 text-gray-300 hover:border-[#d4af37]/30 hover:text-[#d4af37] transition-all">
                      {d.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={fechaRecordatorio}
                  onChange={(e) => setFechaRecordatorio(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50 transition-all"
                />
              </div>

              <button
                onClick={guardarRecordatorio}
                disabled={!textoRecordatorio.trim() || !fechaRecordatorio || guardandoRecordatorio}
                className="w-full py-3 rounded-2xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                {guardandoRecordatorio ? 'Guardando...' : 'Guardar Recordatorio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal asignar propiedad */}
      {modalPropiedades && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Asignar Propiedad</h2>
                <p className="text-xs text-gray-300 mt-1">Selecciona propiedades de interés para {cliente.nombre.split(' ')[0]}</p>
              </div>
              <button onClick={() => { setModalPropiedades(false); setSearchProp('') }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all">
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-white/5">
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchProp}
                onChange={(e) => setSearchProp(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {propiedadesFiltradas.length === 0 ? (
                <div className="text-center py-10 text-gray-300 text-sm">
                  {todasPropiedades.length === propiedadesAsignadas.length
                    ? 'Todas las propiedades ya están asignadas'
                    : 'No se encontraron propiedades'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {propiedadesFiltradas.map((prop) => (
                    <div key={prop.id} className="flex items-center gap-4 bg-[#050505] border border-white/5 rounded-2xl p-3 hover:border-[#d4af37]/20 transition-all">
                      <img src={prop.imagen} alt={prop.nombre} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{prop.nombre}</p>
                        <p className="text-xs text-gray-300">{prop.ubicacion} · {prop.tipo}</p>
                        <p className="text-xs text-[#d4af37] font-bold mt-0.5">{prop.precio} · {prop.area}</p>
                      </div>
                      <button
                        onClick={() => asignarPropiedad(prop.id)}
                        disabled={asignando === prop.id}
                        className="flex-shrink-0 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-50">
                        {asignando === prop.id ? '...' : '+ Asignar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {propiedadesAsignadas.length > 0 && (
              <div className="p-4 border-t border-white/5">
                <p className="text-xs text-gray-300 text-center">
                  {propiedadesAsignadas.length} propiedad{propiedadesAsignadas.length !== 1 ? 'es' : ''} asignada{propiedadesAsignadas.length !== 1 ? 's' : ''} a {cliente.nombre.split(' ')[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="p-6 border-t border-white/5 mt-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-gray-300 font-bold mb-6">Historial de Comunicaciones</h3>
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregarNota()}
            placeholder="Añadir nota manual..."
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all"
          />
          <button onClick={agregarNota}
            className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] px-5 py-3 rounded-2xl text-xs font-bold hover:bg-[#d4af37]/20 transition-all">
            + Nota
          </button>
        </div>
        {historial.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-sm">Sin comunicaciones registradas aún.</div>
        ) : (
          <div className="space-y-3">
            {historial.map((h) => (
              <div key={h.id} className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 border ${tipoColor[h.tipo]}`}>
                  {tipoIcono[h.tipo]}
                </div>
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl px-4 py-3">
                  <p className="text-sm text-gray-300 leading-relaxed">{h.texto}</p>
                  <p className="text-xs text-gray-300 mt-1">{formatFecha(h.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
