'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Sun, Users, Building2, TrendingUp, Calendar, BarChart3, ChevronDown } from 'lucide-react'

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

// ── Counter hook ─────────────────────────────────────────────────────────────
function useCounter(target: string, duration = 1500, active = false) {
  const [value, setValue] = useState('0')
  useEffect(() => {
    if (!active) return
    const num = parseFloat(target.replace(/[^0-9.]/g, ''))
    const suffix = target.replace(/[0-9.,]/g, '')
    if (isNaN(num)) { setValue(target); return }
    let start = 0
    const steps = 60
    const increment = num / steps
    const interval = setInterval(() => {
      start += increment
      if (start >= num) { setValue(target); clearInterval(interval); return }
      const display = num >= 1000 ? Math.floor(start).toLocaleString() : start.toFixed(0)
      setValue(display + suffix)
    }, duration / steps)
    return () => clearInterval(interval)
  }, [active, target, duration])
  return value
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

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ num, label }: { num: string, label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); observer.disconnect() }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const value = useCounter(num, 1500, active)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black mb-2 text-white">{value}</p>
      <p className="text-zinc-500 text-xs uppercase tracking-widest">{label}</p>
    </div>
  )
}

const content = {
  es: {
    nav: { features: 'Funciones', faq: 'FAQ', cta: 'Comenzar' },
    hero: {
badge: '🇩🇴 CRM Inmobiliario · Santo Domingo',      h1a: 'Tu cartera de clientes,',
      h1b: 'bajo control total.',
      desc: 'Homvi es el CRM diseñado para agentes inmobiliarios que operan con estándares de lujo. Pipeline visual, seguimiento preciso, cierre inteligente.',
      btnPrimary: 'Empieza Gratis',
      btnSecondary: 'Ver Funciones',
    },
    stats: [['2,400+', 'Agentes activos'], ['$18B', 'Propiedades'], ['34%', 'Más cierres'], ['99%', 'Satisfacción']],
    featuresBadge: 'Todo lo que necesitas',
    featuresTitle: '7 herramientas. Un solo lugar.',
    faqBadge: 'Preguntas frecuentes',
    faqTitle: 'Todo lo que necesitas saber',
    ctaTitle: 'Empieza a cerrar más. Hoy.',
    ctaDesc: 'Sin tarjeta de crédito. Configura en 5 minutos.',
    ctaPlaceholder: 'tu@email.com',
    ctaBtn: 'Comenzar Gratis',
    ctaSent: '✓ ¡Apuntado!',
    ctaLoading: 'Guardando...',
    footer: '© 2026 HOMVI · CRM Inmobiliario · Santo Domingo',
    features: [
      { numero: '01', titulo: 'Dashboard', subtitulo: 'Visión total de tu negocio en un vistazo', descripcion: 'El dashboard de HOMVI te muestra en tiempo real todo lo que importa: leads sin responder, seguimientos del día, clientes activos y propiedades disponibles. Sin distracciones, solo lo esencial para tomar decisiones rápidas.', puntos: ['Leads sin responder destacados', 'Seguimientos pendientes del día', 'Pipeline de clientes activo', 'Propiedades disponibles vs vendidas'] },
      { numero: '02', titulo: 'Hoy', subtitulo: 'Tu agenda diaria inteligente', descripcion: 'La vista de Hoy centraliza todas tus actividades del día: citas, llamadas, cierres y notas rápidas. Programa nuevas actividades en segundos y marca lo completado sin salir de la pantalla.', puntos: ['Citas y llamadas del día ordenadas por hora', 'Notas rápidas que se guardan al instante', 'Programar nuevas actividades con modal rápido', 'Etiquetas por tipo: cita, llamada, urgente, cierre'] },
      { numero: '03', titulo: 'Clientes', subtitulo: 'Tu cartera completa, siempre organizada', descripcion: 'Gestiona cada cliente con su perfil completo: presupuesto, zonas de interés, tipo de propiedad y etapa en el proceso de compra. Asigna propiedades directamente desde el perfil del cliente.', puntos: ['Perfil completo con presupuesto y preferencias', 'Zonas de interés por sector', 'Asignación directa de propiedades', 'Etapas: Lead, Buscando, En Oferta, Cierre'] },
      { numero: '04', titulo: 'Propiedades', subtitulo: 'Catálogo de lujo siempre actualizado', descripcion: 'Administra tu inventario de propiedades con fotos, precio, sector, tipo y características. Filtra por cualquier criterio y conecta propiedades con los clientes correctos en segundos.', puntos: ['Fotos, precio y características completas', 'Filtros por sector, tipo y precio', 'Conexión directa cliente-propiedad', 'Historial de asignaciones'] },
      { numero: '05', titulo: 'Pipeline', subtitulo: 'El estado de cada negociación en tiempo real', descripcion: 'El pipeline visual te muestra en qué etapa está cada cliente. Arrastra, actualiza y prioriza sin esfuerzo. Nunca pierdas de vista una oportunidad de cierre.', puntos: ['Vista Kanban por etapas', 'Arrastrar y soltar entre etapas', 'Valor estimado por etapa', 'Alertas de clientes sin actividad'] },
      { numero: '06', titulo: 'Calendario', subtitulo: 'Todas tus citas en un solo lugar', descripcion: 'El calendario de HOMVI centraliza tus citas, visitas y seguimientos. Visualiza tu semana o mes completo y nunca llegues a una reunión sin estar preparado.', puntos: ['Vista semanal y mensual', 'Citas vinculadas a clientes', 'Recordatorios automáticos', 'Sincronización con tus actividades diarias'] },
      { numero: '07', titulo: 'Reportes', subtitulo: 'Métricas que impulsan tu crecimiento', descripcion: 'Analiza tu rendimiento con reportes por etapa, sector y período. Identifica qué zonas generan más cierres, cuánto tiempo tarda un lead en convertirse y cuáles son tus propiedades más solicitadas.', puntos: ['Reportes por etapa del pipeline', 'Análisis por sector geográfico', 'Tiempo promedio de conversión', 'Propiedades más consultadas'] },
    ],
    faqs: [
      { pregunta: '¿Necesito instalar algo?', respuesta: 'No. HOMVI es 100% web. Accedes desde cualquier navegador en tu computadora o teléfono, sin descargas ni instalaciones.' },
      { pregunta: '¿Puedo usar HOMVI con mi equipo?', respuesta: 'Sí. HOMVI soporta múltiples agentes. Cada uno tiene su propia cuenta y ve solo sus clientes, propiedades y actividades.' },
      { pregunta: '¿Mis datos están seguros?', respuesta: 'Totalmente. Usamos Supabase con Row Level Security, lo que significa que cada agente solo accede a sus propios datos. Toda la información está encriptada.' },
      { pregunta: '¿Puedo importar mis clientes actuales?', respuesta: 'Sí. HOMVI permite importar clientes desde Excel o CSV. También puedes agregarlos manualmente uno por uno desde la sección de Clientes.' },
      { pregunta: '¿Funciona en el teléfono?', respuesta: 'Sí. HOMVI tiene diseño responsivo y una navegación móvil optimizada para que puedas gestionar tu cartera desde cualquier lugar.' },
      { pregunta: '¿Qué pasa si tengo muchas propiedades?', respuesta: 'No hay límite. Puedes agregar todas las propiedades que necesites, con fotos, precios y características. El sistema está diseñado para manejar catálogos grandes sin perder velocidad.' },
    ],
  },
  en: {
    nav: { features: 'Features', faq: 'FAQ', cta: 'Get Started' },
    hero: {
badge: '🇩🇴 Real Estate CRM · Santo Domingo',      h1a: 'Your client portfolio,',
      h1b: 'under total control.',
      desc: 'Homvi is the CRM designed for real estate agents who operate at luxury standards. Visual pipeline, precise follow-ups, intelligent closing.',
      btnPrimary: 'Start Free',
      btnSecondary: 'See Features',
    },
    stats: [['2,400+', 'Active agents'], ['$18B', 'Properties'], ['34%', 'More closings'], ['99%', 'Satisfaction']],
    featuresBadge: 'Everything you need',
    featuresTitle: '7 tools. One place.',
    faqBadge: 'Frequently asked questions',
    faqTitle: 'Everything you need to know',
    ctaTitle: 'Start closing more. Today.',
    ctaDesc: 'No credit card required. Set up in 5 minutes.',
    ctaPlaceholder: 'you@email.com',
    ctaBtn: 'Start Free',
    ctaSent: '✓ You\'re in!',
    ctaLoading: 'Saving...',
    footer: '© 2026 HOMVI · Real Estate CRM · Santo Domingo',
    features: [
      { numero: '01', titulo: 'Dashboard', subtitulo: 'Total view of your business at a glance', descripcion: 'HOMVI\'s dashboard shows you in real time everything that matters: unanswered leads, today\'s follow-ups, active clients and available properties. No distractions, just what you need to make fast decisions.', puntos: ['Unanswered leads highlighted', 'Pending follow-ups for today', 'Active client pipeline', 'Available vs sold properties'] },
      { numero: '02', titulo: 'Today', subtitulo: 'Your smart daily agenda', descripcion: 'The Today view centralizes all your daily activities: appointments, calls, closings and quick notes. Schedule new activities in seconds and mark completed ones without leaving the screen.', puntos: ['Appointments and calls sorted by time', 'Quick notes saved instantly', 'Schedule new activities with quick modal', 'Tags by type: appointment, call, urgent, closing'] },
      { numero: '03', titulo: 'Clients', subtitulo: 'Your full portfolio, always organized', descripcion: 'Manage each client with their complete profile: budget, areas of interest, property type and stage in the buying process. Assign properties directly from the client profile.', puntos: ['Full profile with budget and preferences', 'Areas of interest by neighborhood', 'Direct property assignment', 'Stages: Lead, Searching, In Offer, Closing'] },
      { numero: '04', titulo: 'Properties', subtitulo: 'Luxury catalog always up to date', descripcion: 'Manage your property inventory with photos, price, area, type and features. Filter by any criteria and connect properties with the right clients in seconds.', puntos: ['Full photos, price and features', 'Filters by area, type and price', 'Direct client-property connection', 'Assignment history'] },
      { numero: '05', titulo: 'Pipeline', subtitulo: 'Status of every negotiation in real time', descripcion: 'The visual pipeline shows you what stage each client is at. Drag, update and prioritize effortlessly. Never lose sight of a closing opportunity.', puntos: ['Kanban view by stage', 'Drag and drop between stages', 'Estimated value per stage', 'Alerts for inactive clients'] },
      { numero: '06', titulo: 'Calendar', subtitulo: 'All your appointments in one place', descripcion: 'HOMVI\'s calendar centralizes your appointments, visits and follow-ups. View your full week or month and never arrive at a meeting unprepared.', puntos: ['Weekly and monthly view', 'Appointments linked to clients', 'Automatic reminders', 'Sync with your daily activities'] },
      { numero: '07', titulo: 'Reports', subtitulo: 'Metrics that drive your growth', descripcion: 'Analyze your performance with reports by stage, area and period. Identify which zones generate more closings, how long a lead takes to convert and which properties are most requested.', puntos: ['Reports by pipeline stage', 'Analysis by geographic area', 'Average conversion time', 'Most viewed properties'] },
    ],
    faqs: [
      { pregunta: 'Do I need to install anything?', respuesta: 'No. HOMVI is 100% web-based. Access it from any browser on your computer or phone, no downloads or installations needed.' },
      { pregunta: 'Can I use HOMVI with my team?', respuesta: 'Yes. HOMVI supports multiple agents. Each one has their own account and only sees their own clients, properties and activities.' },
      { pregunta: 'Is my data secure?', respuesta: 'Absolutely. We use Supabase with Row Level Security, meaning each agent can only access their own data. All information is encrypted.' },
      { pregunta: 'Can I import my current clients?', respuesta: 'Yes. HOMVI allows you to import clients from Excel or CSV. You can also add them manually one by one from the Clients section.' },
      { pregunta: 'Does it work on mobile?', respuesta: 'Yes. HOMVI has a responsive design and an optimized mobile navigation so you can manage your portfolio from anywhere.' },
      { pregunta: 'What if I have many properties?', respuesta: 'No limit. You can add as many properties as you need, with photos, prices and features. The system is designed to handle large catalogs without losing speed.' },
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

  const t = content[lang]
  const { displayed: typedH1b, done: typedDone } = useTypewriter(t.hero.h1b, 45, 800)

  const guardarEmail = async () => {
    if (!email.trim()) return
    setCargando(true)
    await supabase.from('beta_emails').insert({ email: email.trim() })
    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

      {/* Gradiente animado de fondo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-zinc-800">
          <div className="text-2xl font-black tracking-tighter text-amber-500">HOMVI</div>
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-zinc-500">
            <a href="#features" className="hover:text-white cursor-pointer transition-colors">{t.nav.features}</a>
            <a href="#faq" className="hover:text-white cursor-pointer transition-colors">{t.nav.faq}</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="text-xs font-bold text-zinc-400 hover:text-amber-500 transition-colors border border-zinc-700 hover:border-amber-500 px-3 py-1.5 rounded-lg"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <Link href="/dashboard" className="bg-amber-500 text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all uppercase tracking-wider">
              {t.nav.cta}
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-20 pb-10 px-6 text-center max-w-4xl mx-auto">
          <FadeIn delay={0}>
            <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-4 block">{t.hero.badge}</span>
          </FadeIn>
          <FadeIn delay={200}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
              {t.hero.h1a}{' '}
              <span className="italic text-amber-500">
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
              <Link href="/dashboard" className="bg-amber-500 text-black px-8 py-4 rounded-xl font-black hover:bg-white transition-all text-sm uppercase tracking-wider">
                {t.hero.btnPrimary}
              </Link>
              <a href="#features" className="border border-zinc-700 px-8 py-4 rounded-xl font-bold hover:border-amber-500 hover:text-amber-500 transition-all text-sm uppercase tracking-wider">
                {t.hero.btnSecondary}
              </a>
            </div>
          </FadeIn>
        </section>
        {/* RD Section */}
<FadeIn>
  <section className="py-12 px-6 max-w-4xl mx-auto text-center">
    <span className="text-2xl mb-4 block">🇩🇴</span>
    <h2 className="text-2xl md:text-3xl font-black mb-3">
      Construido para el ecosistema inmobiliario de la República Dominicana
    </h2>
    <p className="text-zinc-400 text-sm mb-6 italic">
      Desde Piantini hasta Punta Cana, HOMVI conoce tu territorio.
    </p>
    <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl mx-auto">
      Configurado con los sectores donde se mueve el dinero real:{' '}
      <span className="text-amber-400 font-bold">Piantini, Naco, Bella Vista, Serralles, Los Cacicazgos, La Esperilla, Mirador Norte</span>
      {' '}— y los destinos de inversión turística como{' '}
      <span className="text-amber-400 font-bold">Punta Cana, Bávaro y Bayahíbe</span>.
    </p>
  </section>
</FadeIn>

        {/* Stats */}
        <section className="py-10 px-6 max-w-6xl mx-auto border-y border-zinc-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.map(([num, label]) => (
              <StatCard key={label} num={num} label={label} />
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-3 block">{t.featuresBadge}</span>
              <h2 className="text-4xl font-black">{t.featuresTitle}</h2>
            </div>
          </FadeIn>
          <div className="space-y-6">
            {t.features.map((f, i) => {
              const Icon = icons[i]
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-amber-500/30 transition-all">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-amber-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-amber-500 text-xs font-black">{f.numero}</span>
                          <h3 className="text-xl font-black">{f.titulo}</h3>
                          <span className="text-zinc-500 text-sm">— {f.subtitulo}</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{f.descripcion}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {f.puntos.map((p, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                              {p}
                            </div>
                          ))}
                        </div>
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
              <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-3 block">{t.faqBadge}</span>
              <h2 className="text-4xl font-black">{t.faqTitle}</h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {t.faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-800/50 transition-all"
                  >
                    <span className="font-bold text-sm">{faq.pregunta}</span>
                    <ChevronDown className={`w-4 h-4 text-amber-500 flex-shrink-0 transition-transform ${faqAbierto === i ? 'rotate-180' : ''}`} />
                  </button>
                  {faqAbierto === i && (
                    <div className="px-6 pb-6">
                      <p className="text-zinc-400 text-sm leading-relaxed">{faq.respuesta}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <FadeIn>
          <section id="contacto" className="py-16 px-6 text-center bg-amber-500/5 border-t border-amber-500/10">
            <h2 className="text-4xl font-black mb-4">{t.ctaTitle}</h2>
            <p className="text-zinc-400 mb-10 max-w-md mx-auto text-sm">{t.ctaDesc}</p>
            <div className="max-w-md mx-auto flex flex-col gap-4">
              <input
                type="email"
                placeholder={t.ctaPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-4 text-sm focus:border-amber-500 outline-none transition-colors"
              />
              <button
                onClick={guardarEmail}
                disabled={cargando || enviado}
                className="bg-amber-500 text-black px-8 py-4 rounded-xl text-sm font-black hover:bg-white transition-all disabled:opacity-50 uppercase tracking-wider"
              >
                {enviado ? t.ctaSent : cargando ? t.ctaLoading : t.ctaBtn}
              </button>
            </div>
          </section>
        </FadeIn>

        <footer className="py-8 text-center text-zinc-600 text-xs tracking-widest uppercase border-t border-zinc-800">
          <p>{t.footer}</p>
        </footer>

        <a href="#" className="fixed bottom-6 right-6 bg-amber-500 text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-50 text-lg font-black">
          ↑
        </a>
      </div>
    </div>
  )
}