'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'

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
}

interface Comunicacion {
  id: string
  tipo: 'whatsapp' | 'email' | 'llamada' | 'nota'
  texto: string
  fecha: string
}

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
  nota: 'text-gray-400 bg-white/5 border-white/10',
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

  useEffect(() => {
    const guardados = localStorage.getItem('homvi_clientes')
    if (guardados) {
      const clientes: Cliente[] = JSON.parse(guardados)
      const encontrado = clientes.find((c) => c.id === id)
      if (encontrado) setCliente(encontrado)
    }
    const hist = localStorage.getItem(`homvi_historial_${id}`)
    if (hist) setHistorial(JSON.parse(hist))
  }, [id])

  const registrarComunicacion = (tipo: Comunicacion['tipo'], texto: string) => {
    const nueva: Comunicacion = {
      id: Date.now().toString(),
      tipo,
      texto,
      fecha: new Date().toISOString(),
    }
    const actualizado = [nueva, ...historial]
    setHistorial(actualizado)
    localStorage.setItem(`homvi_historial_${id}`, JSON.stringify(actualizado))
  }

  const cambiarEtapa = (nuevaEtapa: Stage) => {
    if (!cliente) return
    const guardados = localStorage.getItem('homvi_clientes')
    if (!guardados) return
    const clientes: Cliente[] = JSON.parse(guardados)
    const actualizados = clientes.map((c) => c.id === cliente.id ? { ...c, etapa: nuevaEtapa } : c)
    localStorage.setItem('homvi_clientes', JSON.stringify(actualizados))
    setCliente({ ...cliente, etapa: nuevaEtapa })
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

  if (!cliente) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-sans">
      Cargando cliente...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <button onClick={() => router.push('/dashboard')} className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors font-bold">
          ← Dashboard
        </button>
        <div className="flex-1" />
        <button
          onClick={() => {
            const guardados = localStorage.getItem('homvi_clientes')
            if (!guardados) return
            const clientes = JSON.parse(guardados).filter((c: Cliente) => c.id !== id)
            localStorage.setItem('homvi_clientes', JSON.stringify(clientes))
            router.push('/dashboard')
          }}
          className="text-xs uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors font-bold"
        >
          Eliminar cliente
        </button>
        <span className={`text-xs px-3 py-1 rounded-full font-bold border uppercase tracking-widest ${etapaColor[cliente.etapa]}`}>
          {cliente.etapa}
        </span>
      </div>

      {/* Perfil */}
      <div className="p-6 border-b border-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          {initiales(cliente.nombre)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{cliente.nombre.split(' ').map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{cliente.telefono}{cliente.telefono && cliente.email && ' · '}{cliente.email}</p>
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
onClick={() => {
  const numero = cliente.telefono.replace(/\D/g, '')
  registrarComunicacion('whatsapp', `WhatsApp abierto con ${cliente.nombre}`)
  window.open(`https://wa.me/${numero}`, '_blank')
}}              className="bg-green-400/10 border border-green-400/30 text-green-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-400/20 transition-all">
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
                className={`px-4 py-2 text-xs font-bold rounded-l-xl border transition-all ${tabActivo === 'auto' ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]' : 'bg-transparent border-white/10 text-gray-500'}`}>
                ✨ Auto
              </button>
              <button onClick={() => setTabActivo('plantillas')}
                className={`px-4 py-2 text-xs font-bold rounded-r-xl border-t border-r border-b transition-all ${tabActivo === 'plantillas' ? 'bg-blue-400/10 border-blue-400/30 text-blue-400' : 'bg-transparent border-white/10 text-gray-500'}`}>
                📋 Plantillas
              </button>
            </div>
            <button onClick={() => setMostrarCopilot(false)} className="text-gray-600 hover:text-white transition-colors text-lg">✕</button>
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
        {/* Perfil de búsqueda */}
        <div className="p-6 border-r border-white/5">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Perfil de Búsqueda</h3>
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden mb-4">
            {cliente.presupuestoMin && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-500">Presupuesto</span>
                <span className="text-sm text-green-400 font-bold">${cliente.presupuestoMin} – ${cliente.presupuestoMax}</span>
              </div>
            )}
            {cliente.tipoPropiedad?.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-500">Tipo</span>
                <span className="text-sm text-white">{cliente.tipoPropiedad.join(' · ')}</span>
              </div>
            )}
            {cliente.recamaras && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-500">Recámaras</span>
                <span className="text-sm text-white">{cliente.recamaras}</span>
              </div>
            )}
            {cliente.plazo && (
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                <span className="text-xs text-gray-500">Plazo</span>
                <span className="text-sm text-white">{cliente.plazo}</span>
              </div>
            )}
            {cliente.financiamiento && (
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-xs text-gray-500">Financiamiento</span>
                <span className="text-sm text-white">{cliente.financiamiento}</span>
              </div>
            )}
          </div>

          {cliente.zonas?.length > 0 && (
            <>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Zonas de Interés</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {cliente.zonas.map((zona) => (
                  <span key={zona} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-400">{zona}</span>
                ))}
              </div>
            </>
          )}

          {cliente.notas && (
            <>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-3">Notas</h3>
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/10 rounded-2xl p-4 text-sm text-gray-400 italic leading-relaxed">
                {cliente.notas}
              </div>
            </>
          )}
        </div>

        {/* Etapa y acciones */}
        <div className="p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Etapa del Pipeline</h3>
          <div className="flex flex-col gap-2 mb-6">
            {etapas.map((e) => (
              <button key={e} onClick={() => cambiarEtapa(e)}
                className={`px-4 py-3 rounded-2xl border text-sm font-bold text-left flex items-center gap-3 transition-all ${cliente.etapa === e ? etapaColor[e] : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cliente.etapa === e ? 'bg-current' : 'bg-white/20'}`} />
                {e}
                {cliente.etapa === e && <span className="ml-auto text-xs font-normal opacity-60">actual</span>}
              </button>
            ))}
          </div>

          <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Acciones Rápidas</h3>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push('/properties')}
              className="px-4 py-3 rounded-2xl bg-[#0a0a0a] border border-white/5 text-sm text-gray-300 text-left hover:border-[#d4af37]/30 hover:text-white transition-all">
              Ver propiedades →
            </button>
            <button onClick={() => router.push('/today')}
              className="px-4 py-3 rounded-2xl bg-[#0a0a0a] border border-white/5 text-sm text-gray-300 text-left hover:border-[#d4af37]/30 hover:text-white transition-all">
              Agendar cita →
            </button>
          </div>
        </div>
      </div>

      {/* Historial de comunicaciones */}
      <div className="p-6 border-t border-white/5 mt-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-6">Historial de Comunicaciones</h3>

        {/* Añadir nota manual */}
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

        {/* Lista de historial */}
        {historial.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-sm">
            Sin comunicaciones registradas aún.
          </div>
        ) : (
          <div className="space-y-3">
            {historial.map((h) => (
              <div key={h.id} className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 border ${tipoColor[h.tipo]}`}>
                  {tipoIcono[h.tipo]}
                </div>
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl px-4 py-3">
                  <p className="text-sm text-gray-300 leading-relaxed">{h.texto}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatFecha(h.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
  
