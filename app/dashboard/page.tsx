'use client'
import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Clock, 
  AlertCircle,
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
    { id: 1, time: '04:30 PM', type: 'Llamada', desc: 'Seguimiento a Luis B. sobre plano de la torre' },
    { id: 2, time: '06:00 PM', type: 'Visita', desc: 'Mostrar unidad 14-B en Serrallés a inversionista' },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            ¡{saludo}, Broker!
          </h1>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1.5 font-bold">Resumen operativo y control de inventario premium</p>
        </div>
      </div>

      {/* METRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-all shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">{stat.name}</p>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-baseline justify-between mt-3 gap-2">
                <span className="text-2xl font-mono font-black text-white tracking-tight">{stat.value}</span>
                <span className="text-xs font-bold text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEADS RECIENTES (REQUERIMIENTOS URGENTES) */}
        <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#CCFF00]" /> Requerimientos Urgentes
            </h3>
          </div>
          <div className="divide-y divide-zinc-900/80">
            {urgentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-black text-white">{lead.name}</h4>
                  <p className="text-xs text-zinc-300 font-medium mt-1">
                    {lead.project} <span className="text-zinc-500">•</span> <span className="text-[#CCFF00] font-bold">{lead.sector}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-1 rounded border border-[#CCFF00]/20">{lead.budget}</span>
                  <p className="text-[11px] text-zinc-400 font-medium mt-1.5">{lead.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TAREAS DEL DIA */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Agenda de Hoy
          </h3>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="bg-black/40 border border-zinc-800/60 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black bg-zinc-900 text-white px-2 py-0.5 rounded border border-zinc-700">
                    {task.time}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#CCFF00]">{task.type}</span>
                </div>
                <p className="text-sm text-zinc-200 font-semibold pt-1 leading-relaxed">{task.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}