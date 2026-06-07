'use client';

import React from 'react';

export default function DashboardPage() {
  // Datos simulados para el embudo y actividad (Luego los puedes conectar a Supabase)
  const funnelStages = [
    { name: 'Prospectos / Leads', count: 120, percentage: '100%', value: 'US$3.6M' },
    { name: 'Captación / Propiedades', count: 42, percentage: '65%', value: 'US$2.1M' },
    { name: 'En Negociación', count: 18, percentage: '35%', value: 'US$1.2M' },
    { name: 'Cierres Este Mes', count: 6, percentage: '12%', value: 'US$450K' },
  ];

  const recentActivity = [
    { id: 1, user: 'Luis Betances', action: 'movió propiedad a', target: 'En Proceso', time: '14:32' },
    { id: 2, user: 'Sistema HOMVI', action: 'registró nuevo lead desde', target: 'Landing Page', time: '12:05' },
    { id: 3, user: 'Jean Lizardo', action: 'actualizó estatus de cliente', target: 'Inversionista', time: '09:45' },
    { id: 4, user: 'Sistema HOMVI', action: 'detectó interacción en pipeline con', target: 'Torre Piantini', time: '08:15' },
  ];

  return (
    <div className="min-h-screen text-zinc-100 p-1 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER DEL DASHBOARD */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-mono text-[#CCFF00] uppercase tracking-widest">Escritorio Interno</span>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Dashboard</h1>
            <p className="text-xs text-zinc-500 mt-1">Bienvenido a HOMVI. Aquí tienes el resumen general de tu actividad inmobiliaria.</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400 bg-zinc-900/40 px-3 py-2 rounded-lg border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
            <span>PIPELINE CONECTADO // 100% OPERATIVO</span>
          </div>
        </header>

        {/* CUADRÍCULA PRINCIPAL (Asimétrica 70% / 30%) */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA Y CENTRAL: Analítica y Embudo (70%) */}
          <section className="lg:col-span-2 space-y-8">
            
            {/* SECCIÓN 1: MÉTRICAS CLAVE AVANZADAS (BENTO GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tarjeta 1: Volumen de Cartera */}
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                <div className="absolute -inset-px bg-gradient-to-r from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 rounded-xl pointer-events-none"></div>
                <div className="flex justify-between items-start">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Volumen Cartera Activa</p>
                  <span className="text-[10px] font-mono bg-[#CCFF00]/10 text-[#CCFF00] px-2 py-0.5 rounded border border-[#CCFF00]/20">+18.2%</span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white mt-4 tracking-tight">US$14.2M</h3>
                <p className="text-[11px] text-zinc-500 mt-2 font-mono">// 12 propiedades en catálogo</p>
              </div>

              {/* Tarjeta 2: Comisiones Estimadas */}
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                <div className="absolute -inset-px bg-gradient-to-r from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 rounded-xl pointer-events-none"></div>
                <div className="flex justify-between items-start">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Comisiones Est. (Pipeline)</p>
                  <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">Proyección</span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white mt-4 tracking-tight">US$427,500</h3>
                <p className="text-[11px] text-zinc-500 mt-2 font-mono">// Promedio est. 3% de cierres</p>
              </div>

              {/* Tarjeta 3: Leads Calificados */}
              <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                <div className="absolute -inset-px bg-gradient-to-r from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 rounded-xl pointer-events-none"></div>
                <div className="flex justify-between items-start">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Leads Calificados</p>
                  <span className="text-[10px] font-mono bg-[#CCFF00]/10 text-[#CCFF00] px-2 py-0.5 rounded border border-[#CCFF00]/20">Este mes</span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white mt-4 tracking-tight">84 <span className="text-xs text-zinc-600">/ 120</span></h3>
                <p className="text-[11px] text-zinc-500 mt-2 font-mono">// 70% conversión de contacto</p>
              </div>
            </div>

            {/* SECCIÓN 2: GRÁFICO DINÁMICO DE EMBUDO */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Embudo Operativo de Propiedades</h2>
                  <p className="text-xs text-zinc-500 font-mono">// Distribución de volumen por estado de conversión</p>
                </div>
                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-1 rounded border border-zinc-800">Actualizado hace un momento</span>
              </div>

              <div className="space-y-4 pt-2">
                {funnelStages.map((stage, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono px-1 text-zinc-400">
                      <span>{stage.name} <span className="text-zinc-600">({stage.count})</span></span>
                      <span className="text-white font-bold">{stage.value}</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-7 rounded-lg overflow-hidden border border-zinc-900/50 relative flex items-center group cursor-pointer">
                      {/* Barra de progreso con hover dinámico */}
                      <div 
                        className="bg-gradient-to-r from-zinc-800 to-[#CCFF00]/20 group-hover:to-[#CCFF00]/40 h-full border-r-2 border-[#CCFF00] transition-all duration-500 flex items-center pl-3" 
                        style={{ width: stage.percentage }}
                      >
                        <span className="text-[10px] font-mono font-bold text-[#CCFF00] drop-shadow">{stage.percentage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* COLUMNA DERECHA: Control Inmediato y Feed (30%) */}
          <section className="space-y-8">
            
            {/* SECCIÓN 3: ACCIONES RÁPIDAS PREMIUM */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-4">
              <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-mono">// Acciones Rápidas</h2>
              
              <div className="grid grid-cols-1 gap-2">
                {/* Botón Principal Destacado */}
                <button className="w-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-between transition-all duration-200 group cursor-pointer shadow-[0_4px_20px_rgba(204,255,0,0.1)]">
                  <span>Nueva Captación / Propiedad</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>

                {/* Botones Secundarios */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-[11px] p-3 rounded-lg flex flex-col items-start gap-2 transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-zinc-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    <span>+ Registrar Lead</span>
                  </button>

                  <button className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-[11px] p-3 rounded-lg flex flex-col items-start gap-2 transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-zinc-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span>Exportar Reporte</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: FEED DE ACTIVIDAD RECIENTE */}
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-4">
              <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-mono">// Actividad en Tiempo Real</h2>
              
              <div className="relative border-l border-zinc-800 ml-2 pl-4 space-y-6 pt-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="relative group">
                    {/* Indicador de actividad fosforito */}
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-950 group-hover:bg-[#CCFF00] transition-colors duration-200"></div>
                    <div className="text-xs">
                      <span className="font-bold text-zinc-300">{activity.user}</span>{' '}
                      <span className="text-zinc-500">{activity.action}</span>{' '}
                      <span className="text-[#CCFF00] font-mono text-[11px] bg-[#CCFF00]/5 px-1.5 py-0.5 rounded border border-[#CCFF00]/10">{activity.target}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 block mt-1">{activity.time} AST</span>
                  </div>
                ))}
              </div>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}