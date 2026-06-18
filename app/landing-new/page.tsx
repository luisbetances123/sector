'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Bell, Users, Building2, GitFork, Calendar, BarChart3, ChevronDown, CheckCircle2 } from 'lucide-react'

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 40, delay = 500) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, speed, delay])
  return { displayed, done }
}

// ── FadeIn component ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

const t = {
  nav: { features: 'Funciones', faq: 'FAQ', cta: 'Acceder' },
  prelaunsch: '🚀 PLATAFORMA COMERCIAL — CRM para Constructoras en República Dominicana',
  hero: {
    badge: '🇩🇴 CRM para Constructoras · República Dominicana',
    h1a: 'Tu inventario de preventa,',
    h1b: 'bajo control absoluto.',
    desc: 'SECTOR conecta el inventario de tu constructora con el ejército de brokers de RD — en tiempo real, sin tocar tu ERP, desde cualquier celular.',
    btnPrimary: 'Acceder a SECTOR',
    btnSecondary: 'Ver Funciones',
  },
  stats: [
    ['5 min', 'Configuración inicial cero drama. Entras y produces'],
    ['1 clic', 'Envía fichas técnicas estéticas por WhatsApp. Cierra en caliente'],
    ['7 en 1', 'Proyectos, brokers, pipeline y finanzas. Deja de regalar ventas por desorden'],
    ['0%', 'Distracciones. Una interfaz diseñada exclusivamente para vender'],
  ],
  featuresBadge: 'Todo lo que necesitas',
  featuresTitle: '7 herramientas de alto rendimiento. Un solo lugar.',
  faqBadge: 'Preguntas frecuentes',
  faqTitle: 'Todo lo que necesitas saber',
  ctaTitle: 'Únete antes que todos.',
  ctaDesc: 'Domina tu mercado antes de que lo haga tu competencia. Acceso directo, sin intermediarios.',
  ctaPlaceholder: 'tu@email.com',
  ctaBtn: 'Solicitar Acceso',
  ctaSent: '✓ ¡Listo! Te contactaremos pronto.',
  ctaLoading: 'Guardando...',
  footer: '© 2026 SECTOR · CRM para Constructoras · República Dominicana',
  rd: {
    title: 'Construido para el ecosistema inmobiliario de la República Dominicana',
    subtitle: 'De costa a costa, SECTOR conoce dónde se mueve el negocio grande.',
    desc: 'Configurado con los sectores donde se mueve el dinero real y nacen nuevas torres:',
    sectors: 'Piantini, Naco, Bella Vista, Serrallés, Los Cacicazgos, La Esperilla, Mirador Norte',
    tourism: '— así como los polos de mayor plusvalía e inversión turística:',
    tourismPlaces: 'Santiago, Las Terrenas, Juan Dolio, Punta Cana y Bávaro',
  },
  features: [
    { numero: '01', titulo: 'Dashboard', subtitulo: 'Visión total de tu negocio en un vistazo', descripcion: 'El centro de mando de SECTOR. Te muestra en tiempo real lo que deja dinero: unidades vendidas, reservadas y libres, cuotas vencidas y el estatus real de cada proyecto. Cero métricas de vanidad.', puntos: ['Inventario consolidado por proyecto', 'Alertas de cuotas vencidas', 'Reservas críticas por vencer', 'Resumen financiero al instante'] },
    { numero: '02', titulo: 'Recordatorios', subtitulo: 'Tu agenda diaria inteligente', descripcion: 'Diseñado para el ritmo de la constructora moderna. Centraliza seguimientos de cobranza, visitas a proyectos y cierres programados. Nunca se te escapa un pago vencido.', puntos: ['Alertas automáticas de cuotas', 'Notificaciones por email y WhatsApp', 'Seguimiento de incidencias abiertas', 'Etiquetas de urgencia (Cierre, Alerta)'] },
    { numero: '03', titulo: 'Brokers', subtitulo: 'Tu red de venta, blindada', descripcion: 'Gestiona el perfil completo de cada broker que vende tus proyectos: comisiones, unidades cerradas y performance histórico. Conecta brokers con el inventario disponible al instante.', puntos: ['Perfil de comisiones por broker', 'Historial de cierres por agente', 'Acceso controlado por broker', 'Ranking de mejores vendedores'] },
    { numero: '04', titulo: 'Mi Empresa', subtitulo: 'Catálogo de proyectos premium', descripcion: 'Administra tus proyectos y unidades disponibles de forma visual. Filtros ultra rápidos por piso, tipo y estado para que tu equipo responda al broker de inmediato cuando pida opciones.', puntos: ['Fichas de unidades optimizadas', 'Filtros dinámicos por proyecto y piso', 'Match automático con brokers', 'Control de estatus: Libre, Reservado, Vendido'] },
    { numero: '05', titulo: 'Pipeline', subtitulo: 'El estado de tus ventas en tiempo real', descripcion: 'El corazón comercial de tu negocio. Una vista tipo Kanban que te permite mover a tus clientes desde el interés inicial hasta la entrega de llaves. Controla tu flujo de caja visualmente.', puntos: ['Vista visual por etapas de venta', 'Movimiento drag-and-drop intuitivo', 'Cálculo automático de volumen del pipeline', 'Asistente AI para próximos pasos'] },
    { numero: '06', titulo: 'Calendario', subtitulo: 'Visitas y cierres bajo control', descripcion: 'Organiza visitas a proyectos y reuniones de cierre sin solapamientos. Vinculado directamente con los deals de tu pipeline para que sepas exactamente qué unidad vas a mostrar antes de llegar.', puntos: ['Vista ágil semanal y mensual', 'Eventos enlazados a deals reales', 'Recordatorios de visitas a proyectos', 'Bloqueo de horas de alta productividad'] },
    { numero: '07', titulo: 'Finanzas', subtitulo: 'Datos crudos que multiplican cierres', descripcion: 'Deja de adivinar qué funciona. Analiza tu cartera vencida, qué proyectos están rindiendo más ventas este trimestre y de dónde están saliendo tus mejores brokers.', puntos: ['Cartera vencida en tiempo real', 'Tasa de conversión de deals a cierres', 'Volumen financiero total en negociación', 'Análisis de efectividad por proyecto'] },
  ],
  faqs: [
    { pregunta: '¿Necesito instalar algo?', respuesta: 'No. SECTOR es 100% en la nube. Accedes desde tu computadora, tablet o celular desde cualquier lugar de Santo Domingo o el interior, sin descargar nada.' },
    { pregunta: '¿Puedo usar SECTOR con mi equipo de brokers?', respuesta: 'Sí. El sistema está hecho para constructoras con redes de venta externas. Cada broker puede tener acceso controlado a las unidades disponibles, con total trazabilidad de cada venta.' },
    { pregunta: '¿Mis datos de proyectos están protegidos?', respuesta: 'Totalmente. Implementamos encriptación de nivel bancario y políticas estrictas de privacidad en Supabase. Tu inventario es tu activo más valioso, y nadie sin autorización tiene acceso a él.' },
    { pregunta: '¿Cómo migro mis unidades desde un Excel?', respuesta: 'Fácil. SECTOR cuenta con un proceso de importación rápido para tu inventario actual. Sube tu base de datos y estarás operando en minutos.' },
    { pregunta: '¿Cómo funciona el envío por WhatsApp?', respuesta: 'Desde la ficha de cualquier unidad en Mi Empresa, generas un PDF profesional listo para enviar directo a tu broker o cliente por WhatsApp, optimizado para verse bien en móvil.' },
    { pregunta: '¿Hay un límite de proyectos o unidades?', respuesta: 'Ninguno. Sube todo el inventario de preventas y proyectos en construcción que manejes. La plataforma procesa catálogos grandes sin perder velocidad.' },
  ],
}

const icons = [LayoutDashboard, Bell, Users, Building2, GitFork, Calendar, BarChart3]

export default function Page() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  const [activeTab, setActiveTab] = useState(0)
  const [completedTask, setCompletedTask] = useState<boolean[]>([false, false, false])

  const { displayed: typedH1b, done: typedDone } = useTypewriter(t.hero.h1b, 45, 800)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedTask((prev) => {
        const next = [...prev]
        const firstFalseIndex = next.indexOf(false)
        if (firstFalseIndex !== -1) {
          next[firstFalseIndex] = true
        } else {
          return [false, false, false]
        }
        return next
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const guardarEmail = async () => {
    if (!email.trim()) return
    setCargando(true)
    await supabase.from('beta_emails').insert({ email: email.trim() })
    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-x-hidden selection:bg-[#CCFF00]/30 selection:text-[#CCFF00]">

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CCFF00]/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#CCFF00]/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">

        <div className="bg-[#CCFF00]/10 border-b border-[#CCFF00]/20 py-2.5 px-4 text-center">
          <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest">{t.prelaunsch}</p>
        </div>

        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-zinc-800/60">
          <div className="text-2xl font-black tracking-tighter">SEC<span className="text-[#CCFF00]">TOR.</span></div>
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-zinc-500">
            <a href="#features" className="hover:text-white cursor-pointer transition-colors">{t.nav.features}</a>
            <a href="#faq" className="hover:text-white cursor-pointer transition-colors">{t.nav.faq}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="bg-[#CCFF00] text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all uppercase tracking-wider">
              {t.nav.cta}
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-20 pb-10 px-6 text-center max-w-4xl mx-auto">
          <FadeIn delay={0}>
            <span className="text-[#CCFF00] text-xs uppercase tracking-widest font-bold mb-4 block">{t.hero.badge}</span>
          </FadeIn>
          <FadeIn delay={200}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
              {t.hero.h1a}{' '}
              <span className="text-[#CCFF00]">
                {typedH1b}
                {!typedDone && <span className="animate-pulse">|</span>}
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={400}>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">{t.hero.desc}</p>
          </FadeIn>
          <FadeIn delay={600}>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="#contacto" className="bg-[#CCFF00] text-black px-8 py-4 rounded-xl font-black hover:bg-white transition-all text-sm uppercase tracking-wider shadow-lg shadow-[#CCFF00]/10">
                {t.hero.btnPrimary}
              </a>
              <a href="#features" className="border border-zinc-800 px-8 py-4 rounded-xl font-bold hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all text-sm uppercase tracking-wider">
                {t.hero.btnSecondary}
              </a>
            </div>
          </FadeIn>
        </section>

        {/* RD Section */}
        <FadeIn>
          <section className="py-12 px-6 max-w-4xl mx-auto text-center">
            <span className="text-2xl mb-4 block animate-bounce">🇩🇴</span>
            <h2 className="text-2xl md:text-3xl font-black mb-3">{t.rd.title}</h2>
            <p className="text-zinc-400 text-sm mb-6 italic">{t.rd.subtitle}</p>
            <div className="bg-black/40 backdrop-blur border border-zinc-800/80 rounded-2xl p-6 max-w-2xl mx-auto shadow-inner">
              <p className="text-zinc-300 text-sm leading-relaxed">
                {t.rd.desc}{' '}
                <span className="text-[#CCFF00] font-bold underline decoration-[#CCFF00]/30">{t.rd.sectors}</span>
                {' '}{t.rd.tourism}{' '}
                <span className="text-[#CCFF00] font-bold underline decoration-[#CCFF00]/30">{t.rd.tourismPlaces}</span>.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Stats */}
        <section className="py-10 px-6 max-w-6xl mx-auto border-y border-zinc-800/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.map(([num, label]) => (
              <div key={label} className="text-center group cursor-default">
                <p className="text-4xl font-black mb-2 text-[#CCFF00] group-hover:scale-110 transition-transform duration-300">{num}</p>
                <p className="text-zinc-400 text-xs uppercase tracking-widest leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#CCFF00] text-xs uppercase tracking-widest font-bold mb-3 block">{t.featuresBadge}</span>
              <h2 className="text-4xl font-black">{t.featuresTitle}</h2>
            </div>
          </FadeIn>
          <div className="space-y-6">
            {t.features.map((f, i) => {
              const Icon = icons[i]
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="bg-black/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-8 hover:border-[#CCFF00]/30 transition-all group duration-300 shadow-xl">
                    <div className="flex items-start gap-6 flex-col lg:flex-row">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-[#CCFF00] text-xs font-black bg-[#CCFF00]/10 px-2 py-0.5 rounded">{f.numero}</span>
                          <Icon className="w-4 h-4 text-zinc-500" />
                          <h3 className="text-xl font-black group-hover:text-[#CCFF00] transition-colors">{f.titulo}</h3>
                          <span className="text-zinc-500 text-sm">— {f.subtitulo}</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{f.descripcion}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {f.puntos.map((p, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                              <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full flex-shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mockup visual dinámico */}
                      <div className="w-full lg:w-80 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl transition-all group-hover:border-zinc-700">
                        {i === 0 && (
                          <div className="p-4 space-y-2.5">
                            <div className="flex gap-2">
                              {['Proyectos', 'Libres', 'Reserv.', 'Vendid.'].map((l, k) => (
                                <div key={k} className="flex-1 bg-black/40 rounded-lg p-2 text-center border border-zinc-800/60">
                                  <div className="text-[#CCFF00] font-black text-sm">{[1,3,2,1][k]}</div>
                                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider">{l}</div>
                                </div>
                              ))}
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 flex items-center justify-between transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                <span className="text-red-400 text-xs font-medium">2 cuotas vencidas</span>
                              </div>
                              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">¡Atender!</span>
                            </div>
                          </div>
                        )}
                        {i === 1 && (
                          <div className="p-4 space-y-2">
                            {[
                              ['💰', 'Cuota vencida — Eric Pena', 'Hoy', 'text-red-400'],
                              ['🏠', 'Visita Torre Piantini', '11:30', 'text-[#CCFF00]'],
                              ['📄', 'Firma contrato — Maria N.', '15:00', 'text-[#CCFF00]']
                            ].map(([icon, txt, hora, color], k) => (
                              <div
                                key={k}
                                className={`flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border transition-all duration-500 ${completedTask[k] ? 'border-[#CCFF00]/30 opacity-40 bg-zinc-900/20' : 'border-zinc-800/80'}`}
                              >
                                {completedTask[k] ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />
                                ) : (
                                  <span className="text-sm flex-shrink-0">{icon}</span>
                                )}
                                <span className={`text-xs flex-1 transition-all ${completedTask[k] ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{txt}</span>
                                <span className={`${completedTask[k] ? 'text-zinc-600' : color} text-[10px] font-mono`}>{hora}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {i === 2 && (
                          <div className="p-4 space-y-2">
                            {[
                              ['C', 'Clara Nunez', '8 cierres', 'bg-blue-950/40 text-blue-400 border-blue-900/40'],
                              ['L', 'Luz Minier', '5 cierres', 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'],
                              ['J', 'Juan Perez', '3 cierres', 'bg-black/30 text-zinc-400 border-zinc-800/80']
                            ].map(([ini, nom, etapa, color], k) => (
                              <div key={k} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-zinc-800/80 hover:translate-x-1 transition-transform">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#CCFF00] to-white text-black flex items-center justify-center text-[10px] font-black">{ini}</div>
                                <span className="text-zinc-300 text-xs flex-1 font-medium">{nom}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${color}`}>{etapa}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {i === 3 && (
                          <div className="p-4 space-y-2">
                            {[
                              ['Unidad 4A — Torre Piantini', 'US$250,000', 'Libre'],
                              ['Unidad 1B', 'US$195,000', 'Reserv.'],
                              ['Unidad 2A', 'US$210,000', 'Vendido']
                            ].map(([nom, precio, estado], k) => (
                              <div key={k} className="bg-black/30 rounded-lg p-2.5 border border-zinc-800/80 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-300 text-xs font-bold truncate max-w-[160px]">{nom}</span>
                                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${estado === 'Libre' ? 'bg-emerald-500/10 text-emerald-400' : estado === 'Reserv.' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{estado}</span>
                                </div>
                                <span className="text-[#CCFF00] text-[11px] font-mono font-black">{precio}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {i === 4 && (
                          <div className="py-4 overflow-hidden relative bg-[#09090b] h-28 flex items-center">
                            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />
                            <div className="animate-marquee gap-3 flex">
                              {[
                                { n: 'Maria Nunez', e: 'Interesado', p: 'US$250k' },
                                { n: 'Eric Pena', e: 'Separacion', p: 'US$210k' },
                                { n: 'Liz Betances', e: 'En Cuotas 🎉', p: 'US$195k' },
                                { n: 'Seung Lee', e: 'Pre-entrega', p: 'US$220k' }
                              ].map((item, idx) => (
                                <div key={idx} className="bg-black/40 border border-zinc-800/80 rounded-xl p-3 w-40 shadow-xl flex flex-col gap-1">
                                  <div className="text-zinc-300 font-bold text-xs">{item.n}</div>
                                  <div className="text-[10px] text-[#CCFF00] flex items-center gap-1 font-medium">{item.e}</div>
                                  <div className="text-[10px] font-mono font-black text-zinc-500">{item.p}</div>
                                </div>
                              ))}
                              {[
                                { n: 'Maria Nunez', e: 'Interesado', p: 'US$250k' },
                                { n: 'Eric Pena', e: 'Separacion', p: 'US$210k' },
                                { n: 'Liz Betances', e: 'En Cuotas 🎉', p: 'US$195k' },
                                { n: 'Seung Lee', e: 'Pre-entrega', p: 'US$220k' }
                              ].map((item, idx) => (
                                <div key={`dup-${idx}`} className="bg-black/40 border border-zinc-800/80 rounded-xl p-3 w-40 shadow-xl flex flex-col gap-1">
                                  <div className="text-zinc-300 font-bold text-xs">{item.n}</div>
                                  <div className="text-[10px] text-[#CCFF00] flex items-center gap-1 font-medium">{item.e}</div>
                                  <div className="text-[10px] font-mono font-black text-zinc-500">{item.p}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {i === 5 && (
                          <div className="p-4">
                            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                              {['D','L','M','M','J','V','S'].map((d,k) => (
                                <div key={k} className="text-center text-zinc-600 text-[9px] font-bold">{d}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({length: 28}, (_,k) => (
                                <div key={k} className={`text-center text-[9px] rounded-md py-1 transition-all duration-300 ${k===14 ? 'bg-[#CCFF00] text-black font-black shadow-lg shadow-[#CCFF00]/20' : k===8||k===21 ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold' : 'text-zinc-500 bg-black/30'}`}>
                                  {k+1}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {i === 6 && (
                          <div className="p-4 space-y-2">
                            <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-zinc-800/80">
                              {['Mensual', 'Proyecto', 'Cartera'].map((tab, idx) => (
                                <button key={idx} className={`flex-1 text-[9px] font-bold uppercase py-1 rounded transition-colors ${activeTab === idx ? 'bg-[#CCFF00] text-black' : 'text-zinc-500'}`}>
                                  {tab.slice(0, 5)}
                                </button>
                              ))}
                            </div>
                            <div className="bg-black/20 rounded-lg p-2.5 border border-zinc-800/80 h-16 flex flex-col justify-center">
                              {activeTab === 0 && (
                                <div>
                                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Cierres del Mes</div>
                                  <div className="text-emerald-400 text-sm font-black font-mono">US$210,000</div>
                                </div>
                              )}
                              {activeTab === 1 && (
                                <div>
                                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Top Proyecto Activo</div>
                                  <div className="text-[#CCFF00] text-xs font-bold truncate">Torre Piantini (65% obra)</div>
                                </div>
                              )}
                              {activeTab === 2 && (
                                <div>
                                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Cartera Vencida</div>
                                  <div className="text-red-400 text-xs font-mono font-bold">US$0 — Todo al día</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="text-[#CCFF00] text-xs uppercase tracking-widest font-bold mb-3 block">{t.faqBadge}</span>
              <h2 className="text-4xl font-black">{t.faqTitle}</h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {t.faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div className="bg-black/20 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-black/40 transition-all"
                  >
                    <span className="font-bold text-sm text-zinc-200">{faq.pregunta}</span>
                    <ChevronDown className={`w-4 h-4 text-[#CCFF00] flex-shrink-0 transition-transform duration-300 ${faqAbierto === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${faqAbierto === i ? 'max-h-48' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 border-t border-zinc-800/40 pt-2">
                      <p className="text-zinc-400 text-sm leading-relaxed">{faq.respuesta}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <FadeIn>
          <section id="contacto" className="py-16 px-6 text-center bg-[#CCFF00]/5 border-t border-[#CCFF00]/10 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#CCFF00]/10 rounded-full blur-2xl" />
            <h2 className="text-4xl font-black mb-4">{t.ctaTitle}</h2>
            <p className="text-zinc-400 mb-10 max-w-md mx-auto text-sm">{t.ctaDesc}</p>
            <div className="max-w-md mx-auto flex flex-col gap-4 relative z-10">
              <div className="relative">
                <input
                  type="email"
                  placeholder={t.ctaPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border-2 border-zinc-800 rounded-xl px-6 py-4 text-sm focus:border-[#CCFF00] outline-none transition-all placeholder-zinc-600 focus:ring-1 focus:ring-[#CCFF00]/20"
                />
              </div>
              <button
                onClick={guardarEmail}
                disabled={cargando || enviado}
                className="bg-[#CCFF00] text-black px-8 py-4 rounded-xl text-sm font-black hover:bg-white transition-all disabled:opacity-50 uppercase tracking-wider shadow-lg shadow-[#CCFF00]/20"
              >
                {enviado ? t.ctaSent : cargando ? t.ctaLoading : t.ctaBtn}
              </button>
              {!enviado && (
                <p className="text-zinc-600 text-xs">Sin spam. Acceso directo a la plataforma.</p>
              )}
            </div>
          </section>
        </FadeIn>

        <footer className="py-8 text-center text-zinc-600 text-xs tracking-widest uppercase border-t border-zinc-800/60">
          <p>{t.footer}</p>
        </footer>

        <a href="#" className="fixed bottom-6 right-6 bg-[#CCFF00] text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-50 text-lg font-black transform hover:scale-110 active:scale-95 duration-200">
          ↑
        </a>
      </div>
    </div>
  )
}
