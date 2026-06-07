'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Sun, Users, Building2, TrendingUp, Calendar, BarChart3, ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react'

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

const content = {
  es: {
    nav: { features: 'Funciones', faq: 'FAQ', cta: 'Solicitar Acceso' },
    prelaunsch: '🚀 FASE DE PRELANZAMIENTO — Cupos limitados para la Beta Privada en RD',
    hero: {
      badge: '🇩🇴 CRM Inmobiliario · Santo Domingo',
      h1a: 'Tu cartera de clientes,',
      h1b: 'bajo control total.',
      desc: 'SECTOR es el CRM diseñado para agentes inmobiliarios que operan con estándares de lujo. Pipeline visual, seguimiento preciso, cierre inteligente.',
      btnPrimary: 'Solicitar Acceso Anticipado',
      btnSecondary: 'Ver Funciones',
    },
    stats: [
      ['5 min', 'Configuración inicial cero drama. Entras y produces'],
      ['1 clic', 'Envía fichas técnicas estéticas por WhatsApp. Cierra en caliente'],
      ['7 en 1', 'Facturación, leads y pipeline. Deja de regalar comisiones por desorden'],
      ['0%', 'Distracciones. Una interfaz diseñada exclusivamente para facturar'],
    ],
    featuresBadge: 'Todo lo que necesitas',
    featuresTitle: '7 herramientas de alto rendimiento. Un solo lugar.',
    faqBadge: 'Preguntas frecuentes',
    faqTitle: 'Todo lo que necesitas saber',
    ctaTitle: 'Únete antes que todos.',
    ctaDesc: 'Cupos limitados para la beta privada. Domina tu mercado antes de que lo haga tu competencia.',
    ctaPlaceholder: 'tu@email.com',
    ctaBtn: 'Asegurar mi Acceso Anticipado',
    ctaSent: '✓ ¡Cupo reservado! Te vemos dentro.',
    ctaLoading: 'Guardando...',
    footer: '© 2026 SECTOR · CRM Inmobiliario · Santo Domingo',
    rd: {
      title: 'Construido para el ecosistema inmobiliario de la República Dominicana',
      subtitle: 'De costa a costa, SECTOR conoce dónde se mueve el negocio grande.',
      desc: 'Configurado con los sectores donde se mueve el dinero real y nacen nuevas torres:',
      sectors: 'Piantini, Naco, Bella Vista, Serrallés, Los Cacicazgos, La Esperilla, Mirador Norte',
      tourism: '— así como los polos de mayor plusvalía e inversión turística:',
      tourismPlaces: 'Santiago, Las Terrenas, Juan Dolio, Punta Cana y Bávaro',
    },
    features: [
      { numero: '01', titulo: 'Dashboard', subtitulo: 'Visión total de tu negocio en un vistazo', descripcion: 'El centro de mando de SECTOR. Te muestra en tiempo real lo que deja dinero: leads sin responder en rojo, seguimientos urgentes del día y el estatus real de tus negociaciones. Cero métricas de vanidad.', puntos: ['Leads fríos y calientes destacados', 'Alertas de seguimiento inmediato', 'Pipeline activo consolidado', 'Métricas de inventario disponible'] },
      { numero: '02', titulo: 'Mis Tareas', subtitulo: 'Tu agenda diaria inteligente', descripcion: 'Diseñado para el ritmo del broker moderno. Centraliza citas de captación, llamadas de seguimiento y cierres programados. Agenda en segundos y limpia tu pantalla a medida que avanzas el día.', puntos: ['Citas de proyectos ordenadas por hora', 'Block de notas rápidas integrado', 'Programación de llamadas con un clic', 'Etiquetas de urgencia (Cierre, Alerta)'] },
      { numero: '03', titulo: 'Leads y Contactos', subtitulo: 'Tu cartera completa, blindada', descripcion: 'Gestiona el perfil patrimonial de tus compradores: presupuestos, sectores específicos de interés, método de pago y nivel de urgencia. Conecta clientes con propiedades al instante.', puntos: ['Perfil con presupuesto bimonetario', 'Preferencia exacta de sectores', 'Historial de interacciones por cliente', 'Segmentación por origen del lead'] },
      { numero: '04', titulo: 'Inventario', subtitulo: 'Catálogo de propiedades premium', descripcion: 'Administra tus exclusivas y propiedades disponibles de forma visual. Filtros ultra rápidos por sector, precio y tipología para que le respondas al cliente de inmediato cuando pida opciones.', puntos: ['Fichas de propiedades optimizadas', 'Filtros dinámicos por zona y torre', 'Match automático con compradores', 'Control de estatus: Disponible o Reservado'] },
      { numero: '05', titulo: 'Pipeline', subtitulo: 'El estado de tus comisiones en tiempo real', descripcion: 'El corazón comercial de tu negocio. Una vista tipo Kanban que te permite arrastrar a tus clientes desde el primer contacto hasta el cobro de la comisión. Controla tu flujo de caja visualmente.', puntos: ['Vista visual por fases de venta', 'Movimiento drag-and-drop intuitivo', 'Cálculo automático de volumen de cierre', 'Alertas por estancamiento de prospectos'] },
      { numero: '06', titulo: 'Calendario', subtitulo: 'Citas y visitas bajo control', descripcion: 'Organiza tus recorridos y reuniones sin solapamientos. Vinculado directamente con los perfiles de tus clientes para que sepas exactamente qué propiedad vas a mostrar antes de llegar.', puntos: ['Vista ágil semanal y mensual', 'Eventos enlazados a clientes reales', 'Recordatorios de visitas a proyectos', 'Bloqueo de horas de alta productividad'] },
      { numero: '07', titulo: 'Métricas', subtitulo: 'Datos crudos que multiplican cierres', descripcion: 'Deja de adivinar qué funciona. Analiza tus tiempos de respuesta, qué sectores están rindiendo más comisiones este trimestre y de dónde están saliendo tus leads más calificados.', puntos: ['Rendimiento por zona geográfica', 'Tasa de conversión de leads a cierres', 'Volumen financiero total en negociación', 'Análisis de efectividad comercial'] },
    ],
    faqs: [
      { pregunta: '¿Necesito instalar algo?', respuesta: 'No. SECTOR es 100% en la nube. Accedes desde tu iPhone, iPad o computadora desde cualquier lugar de Santo Domingo o el interior, sin descargar nada.' },
      { pregunta: '¿Puedo usar SECTOR con mi equipo de brokers?', respuesta: 'Sí. El sistema está hecho para agencias o equipos de alto rendimiento. Cada asesor maneja sus propios clientes con total privacidad de datos mediante seguridad avanzada.' },
      { pregunta: '¿Mis datos de clientes están protegidos?', respuesta: 'Totalmente. Implementamos encriptación de nivel bancario y políticas estrictas de privacidad en Supabase. Tu cartera es tu activo más valioso, y nadie más tiene acceso a ella.' },
      { pregunta: '¿Cómo migro mis clientes desde un Excel?', respuesta: 'Facilísimo. SECTOR cuenta con un importador nativo de archivos CSV y Excel. Sube tu base de datos actual y estarás operando en menos de 5 minutos.' },
      { pregunta: '¿Cómo funciona el envío por WhatsApp?', respuesta: 'Desde la ficha de cualquier propiedad en tu Inventario, haces clic en el botón de compartir y SECTOR te genera un enlace estético, limpio y profesional optimizado para móvil listo para enviar.' },
      { pregunta: '¿Hay un límite de propiedades o captaciones?', respuesta: 'Ninguno. Sube todo el inventario de preventas, reventas y proyectos turísticos que manejes. La plataforma procesa catálogos masivos sin perder un solo milisegundo de velocidad.' },
    ],
  },
  en: {
    nav: { features: 'Features', faq: 'FAQ', cta: 'Request Access' },
    prelaunsch: '🚀 PRE-LAUNCH PHASE — Limited spots for the Private Beta in DR',
    hero: {
      badge: '🇩🇴 Real Estate CRM · Santo Domingo',
      h1a: 'Your client portfolio,',
      h1b: 'under total control.',
      desc: 'SECTOR is the CRM designed for real estate agents who operate at luxury standards. Visual pipeline, precise follow-ups, intelligent closing.',
      btnPrimary: 'Request Early Access',
      btnSecondary: 'See Features',
    },
    stats: [
      ['5 min', 'Zero-friction initial setup. Get in and produce'],
      ['1 click', 'Share aesthetic property sheets via WhatsApp. Close deals on the go'],
      ['7 in 1', 'Invoicing, leads, and pipeline. Stop losing commissions due to chaos'],
      ['0%', 'Distractions. An interface built exclusively for revenue generation'],
    ],
    featuresBadge: 'Everything you need',
    featuresTitle: '7 high-performance tools. One place.',
    faqBadge: 'Frequently asked questions',
    faqTitle: 'Everything you need to know',
    ctaTitle: 'Join before everyone else.',
    ctaDesc: 'Limited spots for the private beta. Dominate your market before your competition does.',
    ctaPlaceholder: 'you@email.com',
    ctaBtn: 'Secure My Early Access',
    ctaSent: '✓ Spot reserved! See you inside.',
    ctaLoading: 'Saving...',
    footer: '© 2026 SECTOR · Real Estate CRM · Santo Domingo',
    rd: {
      title: 'Built for the Dominican Republic real estate ecosystem',
      subtitle: 'From coast to coast, SECTOR knows where the big business moves.',
      desc: 'Configured with the areas where real money flows and new towers rise:',
      sectors: 'Piantini, Naco, Bella Vista, Serrallés, Los Cacicazgos, La Esperilla, Mirador Norte',
      tourism: '— as well as the highest growth tourist investment destinations:',
      tourismPlaces: 'Santiago, Las Terrenas, Juan Dolio, Punta Cana, and Bávaro',
    },
    features: [
      { numero: '01', titulo: 'Dashboard', subtitulo: 'Total view of your business at a glance', descripcion: 'SECTOR\'s command center. It shows you what makes money in real time: red-highlighted unanswered leads, urgent daily follow-ups, and the real status of your negotiations. Zero vanity metrics.', puntos: ['Hot and cold leads highlighted', 'Immediate follow-up alerts', 'Consolidated active pipeline', 'Available inventory metrics'] },
      { numero: '02', titulo: 'Mis Tareas', subtitulo: 'Your smart daily agenda', descripcion: 'Built for the modern broker\'s rhythm. Centralizes project viewings, follow-up calls, and scheduled closings. Schedule in seconds and clear your screen as the day moves forward.', puntos: ['Project appointments sorted by hour', 'Integrated quick notepad', 'One-click call scheduling', 'Urgency tags (Closing, Alert)'] },
      { numero: '03', titulo: 'Leads y Contactos', subtitulo: 'Your full portfolio, locked down', descripcion: 'Manage your buyer\'s wealth profile: budgets, specific areas of interest, payment method, and urgency level. Pair clients with properties instantly.', puntos: ['Dual-currency budget profile', 'Exact neighborhood preference', 'Interaction history per client', 'Lead source segmentation'] },
      { numero: '04', titulo: 'Inventario', subtitulo: 'Premium property catalog', descripcion: 'Manage your listings and available inventory visually. Ultra-fast filtering by sector, price, and type so you can respond to the client immediately when they request options.', puntos: ['Optimized property sheets', 'Dynamic filters by zone and tower', 'Automatic matching with buyers', 'Status control: Available or Reserved'] },
      { numero: '05', titulo: 'Pipeline', subtitulo: 'Track your commissions in real time', descripcion: 'The commercial heart of your business. A Kanban view that lets you drag your clients from the first touchpoint down to the commission check. Manage your cash flow visually.', puntos: ['Visual sales stages view', 'Intuitive drag-and-drop movement', 'Automatic closing volume calculation', 'Alerts for stalled prospects'] },
      { numero: '06', titulo: 'Calendario', subtitulo: 'Viewings and meetings under control', descripcion: 'Organize your property tours and meetings without overlaps. Connected directly with your client profiles so you know exactly what listing you are showing before arriving.', puntos: ['Agile weekly and monthly view', 'Events linked to real clients', 'Project visit reminders', 'High-productivity hours blocking'] },
      { numero: '07', titulo: 'Métricas', subtitulo: 'Raw data that multiplies closings', descripcion: 'Stop guessing what works. Analyze response times, which neighborhoods are yielding the highest commissions this quarter, and where your most qualified leads are coming from.', puntos: ['Performance by geographic zone', 'Lead-to-close conversion rate', 'Total pipeline financial volume', 'Sales effectiveness analysis'] },
    ],
    faqs: [
      { pregunta: 'Do I need to install anything?', respuesta: 'No. SECTOR is 100% cloud-based. Access it from your iPhone, iPad, or laptop from anywhere in Santo Domingo or across the country without downloading a thing.' },
      { pregunta: 'Can I use SECTOR with my team of brokers?', respuesta: 'Yes. The system is custom-built for high-performance agencies or teams. Each advisor manages their own database with absolute data privacy via advanced security layers.' },
      { pregunta: 'Is my client data protected?', respuesta: 'Absolutely. We implement bank-level encryption and strict privacy rules via Supabase. Your database is your most valuable asset, and nobody else has access to it.' },
      { pregunta: 'How do I migrate my clients from Excel?', respuesta: 'Extremely easy. SECTOR features a native CSV and Excel importer. Upload your current database and you will be up and running in less than 5 minutes.' },
      { pregunta: 'How does the WhatsApp share feature work?', respuesta: 'From any listing page in your Inventario, just click the share button and SECTOR will instantly generate a beautiful, clean, mobile-optimized link ready to send.' },
      { pregunta: 'Is there a limit on properties or listings?', respuesta: 'None at all. Upload all pre-constructions, resales, and tourist projects you handle. The platform processes massive catalogs without losing a single millisecond of speed.' },
    ],
  },
}

const icons = [LayoutDashboard, Sun, Users, Building2, TrendingUp, Calendar, BarChart3]

export default function Page() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)
  const [lang, setLang] = useState<'es' | 'en'>('es')

  // Estados para simular interactividad viva en los mockups
  const [activeTab, setActiveTab] = useState(0)
  const [completedTask, setCompletedTask] = useState<boolean[]>([false, false, false])

  const t = content[lang]
  const { displayed: typedH1b, done: typedDone } = useTypewriter(t.hero.h1b, 45, 800)

  // Efecto automático para cambiar tabs de reportes o simular interacción periódica
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Simulación de completar tareas en la vista 'Hoy'
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
    <div className="min-h-screen bg-[#110E08] text-white font-sans overflow-x-hidden selection:bg-[#CCFF00]/30 selection:text-[#CCFF00]">
      
      {/* Estilos CSS Inyectados para el Slider/Marquee infinito del Pipeline */}
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

      {/* Gradiente sutil de fondo al estilo Trading de Robinhood */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CCFF00]/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#CCFF00]/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">

        {/* Cintillo prelanzamiento */}
        <div className="bg-[#CCFF00]/10 border-b border-[#CCFF00]/20 py-2.5 px-4 text-center">
          <p className="text-[#CCFF00] text-xs font-bold uppercase tracking-widest">{t.prelaunsch}</p>
        </div>

        {/* Nav */}
        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-zinc-800/60">
          <div className="text-2xl font-black tracking-tighter text-[#CCFF00]">SECTOR</div>
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-zinc-500">
            <a href="#features" className="hover:text-white cursor-pointer transition-colors">{t.nav.features}</a>
            <a href="#faq" className="hover:text-white cursor-pointer transition-colors">{t.nav.faq}</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="text-xs font-bold text-zinc-400 hover:text-[#CCFF00] transition-colors border border-zinc-800 hover:border-[#CCFF00] px-3 py-1.5 rounded-lg"
            >
              {lang === 'es' ? '🇺🇸 EN' : '🇩🇴 ES'}
            </button>
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
                      <div className="w-full lg:w-80 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-800 bg-[#110E08] shadow-2xl transition-all group-hover:border-zinc-700">
                        {i === 0 && (
                          <div className="p-4 space-y-2.5">
                            <div className="flex gap-2">
                              {['Leads', 'Clientes', 'Propied.', 'Seguim.'].map((l, k) => (
                                <div key={k} className="flex-1 bg-black/40 rounded-lg p-2 text-center border border-zinc-800/60">
                                  <div className="text-[#CCFF00] font-black text-sm">{[3,12,8,5][k]}</div>
                                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider">{l}</div>
                                </div>
                              ))}
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 flex items-center justify-between transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                <span className="text-red-400 text-xs font-medium">3 leads sin responder</span>
                              </div>
                              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">¡Atender!</span>
                            </div>
                          </div>
                        )}
                        {i === 1 && (
                          <div className="p-4 space-y-2">
                            {[
                              ['📞', 'Llamada a María G.', '09:00', 'text-cyan-400'],
                              ['🏠', 'Visita Piantini', '11:30', 'text-[#CCFF00]'],
                              ['📄', 'Firma contrato', '15:00', 'text-[#CCFF00]']
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
                              ['L', 'Lizmarie B.', 'Buscando', 'bg-blue-950/40 text-blue-400 border-blue-900/40'],
                              ['J', 'Jean L.', 'En Oferta', 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'],
                              ['M', 'María N.', 'Lead', 'bg-black/30 text-zinc-400 border-zinc-800/80']
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
                              ['Penthouse en Piantini', 'US$350,000', 'Dispon.'],
                              ['Apto en Naco', 'US$185,000', 'Dispon.'],
                              ['Casa Arroyo Hondo', 'US$420,000', 'Reserv.']
                            ].map(([nom, precio, estado], k) => (
                              <div key={k} className="bg-black/30 rounded-lg p-2.5 border border-zinc-800/80 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-300 text-xs font-bold truncate max-w-[120px]">{nom}</span>
                                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${estado === 'Dispon.' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{estado}</span>
                                </div>
                                <span className="text-[#CCFF00] text-[11px] font-mono font-black">{precio}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {i === 4 && (
                          <div className="py-4 overflow-hidden relative bg-[#110E08] h-28 flex items-center">
                            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#110E08] to-transparent z-10 pointer-events-none" />
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#110E08] to-transparent z-10 pointer-events-none" />
                            <div className="animate-marquee gap-3 flex">
                              {[
                                { n: 'Luis B.', e: 'Lead → Buscando', p: 'US$215k' },
                                { n: 'Lizmarie B.', e: 'Buscando → Oferta', p: 'US$450k' },
                                { n: 'Jean L.', e: 'Oferta → Cierre 🎉', p: 'US$135k' },
                                { n: 'Maria N.', e: 'Nuevo Lead', p: 'US$300k' }
                              ].map((item, idx) => (
                                <div key={idx} className="bg-black/40 border border-zinc-800/80 rounded-xl p-3 w-40 shadow-xl flex flex-col gap-1">
                                  <div className="text-zinc-300 font-bold text-xs">{item.n}</div>
                                  <div className="text-[10px] text-[#CCFF00] flex items-center gap-1 font-medium">{item.e}</div>
                                  <div className="text-[10px] font-mono font-black text-zinc-500">{item.p}</div>
                                </div>
                              ))}
                              {[
                                { n: 'Luis B.', e: 'Lead → Buscando', p: 'US$215k' },
                                { n: 'Lizmarie B.', e: 'Buscando → Oferta', p: 'US$450k' },
                                { n: 'Jean L.', e: 'Oferta → Cierre 🎉', p: 'US$135k' },
                                { n: 'Maria N.', e: 'Nuevo Lead', p: 'US$300k' }
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
                              {['Mensual', 'Sectores', 'Conversión'].map((tab, idx) => (
                                <button key={idx} className={`flex-1 text-[9px] font-bold uppercase py-1 rounded transition-colors ${activeTab === idx ? 'bg-[#CCFF00] text-black' : 'text-zinc-500'}`}>
                                  {tab.slice(0, 5)}
                                </button>
                              ))}
                            </div>
                            <div className="bg-black/20 rounded-lg p-2.5 border border-zinc-800/80 h-16 flex flex-col justify-center">
                              {activeTab === 0 && (
                                <div>
                                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Cierres del Mes</div>
                                  <div className="text-emerald-400 text-sm font-black font-mono">US$1,225,000</div>
                                </div>
                              )}
                              {activeTab === 1 && (
                                <div>
                                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Top Sector Activo</div>
                                  <div className="text-[#CCFF00] text-xs font-bold truncate">Piantini & Naco (64%)</div>
                                </div>
                              )}
                              {activeTab === 2 && (
                                <div>
                                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider">Velocidad de Cierre</div>
                                  <div className="text-cyan-400 text-xs font-mono font-bold">2.4 días por Lead</div>
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
                <p className="text-zinc-600 text-xs">Sin spam. Sin tarjeta de crédito. Solo acceso anticipado.</p>
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