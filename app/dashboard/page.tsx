'use client'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Clock, 
  ArrowUpRight, 
  AlertCircle,
  Phone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function DashboardPage() {
  const [saludo, setSaludo] = useState('Buenos días')

  useEffect(() => {
    const hora = new Date().getHours()
    if (hora >= 12 && hora < 19) setSaludo('Buenas tardes')
    else if (hora >= 19 || hora < 5) setSaludo('Buenas noches')
  }, [])

  // Datos simulados de alto rendimiento para el Broker Elite en RD
  const stats = [
    { name: 'Volumen en Pipeline', value: 'US$2,450,000', change: '+12.5%', icon: TrendingUp, color: 'text-[#CCFF00]' },
    { name: 'Leads Activos', value: '18', change: '4 calientes', icon: Users, color: 'text-cyan-400' },
    { name: 'Propiedades en Exclusiva', value: '8', change: '3 en Piantini', icon: Building2, color: 'text-purple-400' },
    { name: 'Tasa de Cierre', value: '24%', change: 'Eficiencia alta', icon: Clock, color: 'text-emerald-400' },
  ]

  const urgentLeads = [
    { id: 1, name: 'Luis Betances', sector: 'Naco', budget: 'US$450,500', time: 'Hace 12 min', project: 'Torre Regatta' },
    { id: 2, name: 'Jean Lizardo', sector: 'Piantini', budget: 'US$820,000', time: 'Hace 45 min', project: 'Penthouse Exclusivo' },
    { id: 3, name: 'Mariela Núñez', sector: 'Las Terrenas', budget: 'US$310,000', time: 'Hace 2 horas', project: 'Villa Vista Mar' },
  ]

  const todayTasks = [
    { id: 1, time: '04:30 PM', type: 'Llamada', desc: 'Seguimiento a Luis B. sobre plano de la torre', phone: '+18095550123' },
    { id: 2, time: '06:00 PM', type: 'Visita', desc: 'Mostrar unidad 14-B en Serrallés a inversionista', phone: null },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* ── ENCABEZADO ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{saludo}, Asesor Premium 👋</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Tu central de mando para el mercado de lujo en RD</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs font-mono text-zinc-500">FASE DE PRELANZAMIENTO</p>
          <p className="text-[#CCFF00] text-xs font-bold font-mono">© 2026 HOMVI</p>
        </div>
      </div>

      {/* ── ALERTA CRÍTICA: LEADS SIN RESPONDER ─────────────────────────── */}
      <div className="bg-red-500/10 border-2 border-red-500/20 rounded-2xl p-4 flex items-start gap-4 shadow-lg shadow-red-500/2">
        <div className="p-2 bg-red-500/20 rounded-xl text-red-400 flex-shrink-0">
          <AlertCircle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">Atención Inmediata Requerida</h3>
          <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
            Tienes <span className="text-white font-bold underline">3 leads calificados</span> esperando respuesta en WhatsApp. No dejes que otro broker se quede con la comisión de esas unidades.
          </p>
        </div>
      </div>

      {/* ── TARJETAS DE MÉTRICAS ROBINHOOD STYLE ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-black/30 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all duration-300 shadow-xl group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{stat.name}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black tracking-tight font-mono">{stat.value}</h4>
              <p className="text-zinc-400 text-xs font-medium flex items-center gap-1">
                <span className={`${idx === 0 ? 'text-[#CCFF00]' : 'text-zinc-400'} font-bold`}>{stat.change}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── BLOQUE DIVIDIDO: LEADS URGENTES Y TAREAS DEL DÍA ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Leads Calientes (Ocupa 2 columnas en pantallas grandes) */}
        <div className="lg:col-span-2 bg-black/20 border border-zinc-800/60 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-200">Leads Calientes Recientes</h2>
              <p className="text-zinc-500 text-[11px]">Entraron hoy por campañas o portal exclusivo</p>
            </div>
            <button className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] hover:text-white flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {urgentLeads.map((lead) => (
              <div key={lead.id} className="bg-[#110E08]/60 border border-zinc-800/80 rounded-xl p-4 hover:border-[#CCFF00]/20 transition-all flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-100">{lead.name}</span>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 font-mono px-1.5 py-0.5 rounded font-bold uppercase">{lead.sector}</span>
                  </div>
                  <p className="text-zinc-400 text-xs">Interesado en: <span className="text-zinc-300 font-medium">{lead.project}</span></p>
                </div>
                <div className="text-left sm:text-right space-y-1 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                  <span className="text-[#CCFF00] font-mono text-xs font-black block">{lead.budget}</span>
                  <span className="text-zinc-500 text-[10px] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-600" /> {lead.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda Express del Día */}
        <div className="bg-black/20 border border-zinc-800/60 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-200">Próximas Acciones</h2>
            <p className="text-zinc-500 text-[11px]">Tu bloque de enfoque para las próximas horas</p>
          </div>

          <div className="space-y-3 flex-1">
            {todayTasks.map((task) => (
              <div key={task.id} className="bg-[#110E08]/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider bg-[#CCFF00]/10 text-[#CCFF00]">
                    {task.type}
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px] font-bold">{task.time}</span>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed font-medium">{task.desc}</p>
                {task.phone && (
                  <a 
                    href={`tel:${task.phone}`}
                    className="mt-1 w-full bg-zinc-900 hover:bg-[#CCFF00] hover:text-black transition-all border border-zinc-800 hover:border-transparent rounded-lg py-2 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider"
                  >
                    <Phone className="w-3 h-3" /> Llamar por Teléfono
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}