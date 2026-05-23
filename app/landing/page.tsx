'use client'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Sun, Users, Building2, TrendingUp, Calendar, BarChart3, ChevronDown } from 'lucide-react'

const features = [
  {
    icon: LayoutDashboard,
    numero: '01',
    titulo: 'Dashboard',
    subtitulo: 'Visión total de tu negocio en un vistazo',
    descripcion: 'El dashboard de HOMVI te muestra en tiempo real todo lo que importa: leads sin responder, seguimientos del día, clientes activos y propiedades disponibles. Sin distracciones, solo lo esencial para tomar decisiones rápidas.',
    puntos: ['Leads sin responder destacados', 'Seguimientos pendientes del día', 'Pipeline de clientes activo', 'Propiedades disponibles vs vendidas'],
  },
  {
    icon: Sun,
    numero: '02',
    titulo: 'Hoy',
    subtitulo: 'Tu agenda diaria inteligente',
    descripcion: 'La vista de Hoy centraliza todas tus actividades del día: citas, llamadas, cierres y notas rápidas. Programa nuevas actividades en segundos y marca lo completado sin salir de la pantalla.',
    puntos: ['Citas y llamadas del día ordenadas por hora', 'Notas rápidas que se guardan al instante', 'Programar nuevas actividades con modal rápido', 'Etiquetas por tipo: cita, llamada, urgente, cierre'],
  },
  {
    icon: Users,
    numero: '03',
    titulo: 'Clientes',
    subtitulo: 'Tu cartera completa, siempre organizada',
    descripcion: 'Gestiona cada cliente con su perfil completo: presupuesto, zonas de interés, tipo de propiedad y etapa en el proceso de compra. Asigna propiedades directamente desde el perfil del cliente.',
    puntos: ['Perfil completo con presupuesto y preferencias', 'Zonas de interés por sector', 'Asignación directa de propiedades', 'Etapas: Lead, Buscando, En Oferta, Cierre'],
  },
  {
    icon: Building2,
    numero: '04',
    titulo: 'Propiedades',
    subtitulo: 'Catálogo de lujo siempre actualizado',
    descripcion: 'Administra tu inventario de propiedades con fotos, precio, sector, tipo y características. Filtra por cualquier criterio y conecta propiedades con los clientes correctos en segundos.',
    puntos: ['Fotos, precio y características completas', 'Filtros por sector, tipo y precio', 'Conexión directa cliente-propiedad', 'Historial de asignaciones'],
  },
  {
    icon: TrendingUp,
    numero: '05',
    titulo: 'Pipeline',
    subtitulo: 'El estado de cada negociación en tiempo real',
    descripcion: 'El pipeline visual te muestra en qué etapa está cada cliente. Arrastra, actualiza y prioriza sin esfuerzo. Nunca pierdas de vista una oportunidad de cierre.',
    puntos: ['Vista Kanban por etapas', 'Arrastrar y soltar entre etapas', 'Valor estimado por etapa', 'Alertas de clientes sin actividad'],
  },
  {
    icon: Calendar,
    numero: '06',
    titulo: 'Calendario',
    subtitulo: 'Todas tus citas en un solo lugar',
    descripcion: 'El calendario de HOMVI centraliza tus citas, visitas y seguimientos. Visualiza tu semana o mes completo y nunca llegues a una reunión sin estar preparado.',
    puntos: ['Vista semanal y mensual', 'Citas vinculadas a clientes', 'Recordatorios automáticos', 'Sincronización con tus actividades diarias'],
  },
  {
    icon: BarChart3,
    numero: '07',
    titulo: 'Reportes',
    subtitulo: 'Métricas que impulsan tu crecimiento',
    descripcion: 'Analiza tu rendimiento con reportes por etapa, sector y período. Identifica qué zonas generan más cierres, cuánto tiempo tarda un lead en convertirse y cuáles son tus propiedades más solicitadas.',
    puntos: ['Reportes por etapa del pipeline', 'Análisis por sector geográfico', 'Tiempo promedio de conversión', 'Propiedades más consultadas'],
  },
]

const faqs = [
  {
    pregunta: '¿Necesito instalar algo?',
    respuesta: 'No. HOMVI es 100% web. Accedes desde cualquier navegador en tu computadora o teléfono, sin descargas ni instalaciones.',
  },
  {
    pregunta: '¿Puedo usar HOMVI con mi equipo?',
    respuesta: 'Sí. HOMVI soporta múltiples agentes. Cada uno tiene su propia cuenta y ve solo sus clientes, propiedades y actividades.',
  },
  {
    pregunta: '¿Mis datos están seguros?',
    respuesta: 'Totalmente. Usamos Supabase con Row Level Security, lo que significa que cada agente solo accede a sus propios datos. Toda la información está encriptada.',
  },
  {
    pregunta: '¿Puedo importar mis clientes actuales?',
    respuesta: 'Sí. HOMVI permite importar clientes desde Excel o CSV. También puedes agregarlos manualmente uno por uno desde la sección de Clientes.',
  },
  {
    pregunta: '¿Funciona en el teléfono?',
    respuesta: 'Sí. HOMVI tiene diseño responsivo y una navegación móvil optimizada para que puedas gestionar tu cartera desde cualquier lugar.',
  },
  {
    pregunta: '¿Qué pasa si tengo muchas propiedades?',
    respuesta: 'No hay límite. Puedes agregar todas las propiedades que necesites, con fotos, precios y características. El sistema está diseñado para manejar catálogos grandes sin perder velocidad.',
  },
]

export default function Page() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  const guardarEmail = async () => {
    if (!email.trim()) return
    setCargando(true)
    await supabase.from('beta_emails').insert({ email: email.trim() })
    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* Nav */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-zinc-800">
        <div className="text-2xl font-black tracking-tighter text-amber-500">HOMVI</div>
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-zinc-500">
          <a href="#features" className="hover:text-white cursor-pointer transition-colors">Funciones</a>
          <a href="#faq" className="hover:text-white cursor-pointer transition-colors">FAQ</a>
        </div>
        <Link href="/dashboard" className="bg-amber-500 text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all uppercase tracking-wider">
          Comenzar
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-10 px-6 text-center max-w-4xl mx-auto">
        <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-4 block">CRM Inmobiliario · Santo Domingo</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
          Tu cartera de clientes,{' '}
          <span className="italic text-amber-500">bajo control total.</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Homvi es el CRM diseñado para agentes inmobiliarios que operan con estándares de lujo. Pipeline visual, seguimiento preciso, cierre inteligente.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="bg-amber-500 text-black px-8 py-4 rounded-xl font-black hover:bg-white transition-all text-sm uppercase tracking-wider">
            Empieza Gratis
          </Link>
          <a href="#features" className="border border-zinc-700 px-8 py-4 rounded-xl font-bold hover:border-amber-500 hover:text-amber-500 transition-all text-sm uppercase tracking-wider">
            Ver Funciones
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-6 max-w-6xl mx-auto border-y border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[['2,400+', 'Agentes activos'], ['$18B', 'Propiedades'], ['34%', 'Más cierres'], ['99%', 'Satisfacción']].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-black mb-2 text-white">{num}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-3 block">Todo lo que necesitas</span>
          <h2 className="text-4xl font-black">7 herramientas. Un solo lugar.</h2>
        </div>
        <div className="space-y-6">
          {features.map((f, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-amber-500/30 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-3 block">Preguntas frecuentes</span>
          <h2 className="text-4xl font-black">Todo lo que necesitas saber</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
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
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contacto" className="py-16 px-6 text-center bg-amber-500/5 border-t border-amber-500/10">
        <h2 className="text-4xl font-black mb-4">Empieza a cerrar más. Hoy.</h2>
        <p className="text-zinc-400 mb-10 max-w-md mx-auto text-sm">Sin tarjeta de crédito. Configura en 5 minutos.</p>
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-4 text-sm focus:border-amber-500 outline-none transition-colors"
          />
          <button
            onClick={guardarEmail}
            disabled={cargando || enviado}
            className="bg-amber-500 text-black px-8 py-4 rounded-xl text-sm font-black hover:bg-white transition-all disabled:opacity-50 uppercase tracking-wider"
          >
            {enviado ? '✓ ¡Apuntado!' : cargando ? 'Guardando...' : 'Comenzar Gratis'}
          </button>
        </div>
      </section>

      <footer className="py-8 text-center text-zinc-600 text-xs tracking-widest uppercase border-t border-zinc-800">
        <p>© 2026 HOMVI · CRM Inmobiliario · Santo Domingo</p>
      </footer>

      <a href="#" className="fixed bottom-6 right-6 bg-amber-500 text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg z-50 text-lg font-black">
        ↑
      </a>

    </div>
  )
}