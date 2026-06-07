'use client';

import React from 'react';

export default function PipelinePage() {
  // Estructura de columnas y tarjetas calcada de tu captura con esteroides visuales
  const columns = [
    {
      id: 'prospectos',
      title: '● PROSPECTOS',
      count: '2 casos',
      totalValue: 'US$930,000',
      deals: [
        {
          id: 'd1',
          client: 'Carlos Mendoza',
          tag: 'NACO',
          status: 'SIN RESPONDER',
          statusType: 'danger',
          property: 'Torre Naco Luxury',
          type: '🏢 Apartamento',
          value: 'US$280,000',
          time: 'Hace 2h',
        },
        {
          id: 'd2',
          client: 'Alejandro Sanz',
          tag: 'LAS TERRENAS',
          status: 'NUEVO LEAD',
          statusType: 'info',
          property: 'Villa Las Terrenas',
          type: '🏡 Villa / Casa',
          value: 'US$650,000',
          time: 'Hace 5h',
        },
      ],
    },
    {
      id: 'calificados',
      title: '● CALIFICADOS',
      count: '1 caso',
      totalValue: 'US$450,000',
      deals: [
        {
          id: 'd3',
          client: 'Luis Betances',
          tag: 'PIANTINI',
          status: 'BUSCANDO',
          statusType: 'success',
          property: 'Regatta Blue',
          type: '🔍 Penthouse',
          value: 'US$450,000',
          time: 'Ayer',
        },
      ],
    },
    {
      id: 'en-propuesta',
      title: '● EN PROPUESTA',
      count: '1 caso',
      totalValue: 'US$890,000',
      deals: [
        {
          id: 'd4',
          client: 'Jean Lizardo',
          tag: 'SERRALLÉS',
          status: 'PROPUESTA',
          statusType: 'warning',
          property: 'Penthouse Serrallés',
          type: '🏢 Apartamento',
          value: 'US$890,000',
          time: 'Hace 15m',
        },
      ],
    },
    {
      id: 'cierre',
      title: '● CIERRE 🎉',
      count: '1 caso',
      totalValue: 'US$310,000',
      deals: [
        {
          id: 'd5',
          client: 'Mariela Núñez',
          tag: 'JUAN DOLIO',
          status: 'CONTRATO',
          statusType: 'premium',
          property: 'Juan Dolio Beach Front',
          type: '🏖️ Solar / Playa',
          value: 'US$310,000',
          time: 'Esta semana',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER MONUMENTAL DEL PIPELINE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-10">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociación</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">Panel de control de datos, flujo de cierres corporativos e inteligencia comercial.</p>
          </div>
          <button className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-[0_4px_30px_rgba(204,255,0,0.15)]">
            <span>+ Nuevo Cliente</span>
          </button>
        </header>

        {/* KANBAN GRID - Columnas monumentales estiradas al fondo */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col space-y-4 h-full min-h-[650px] bg-zinc-950/20 p-2 rounded-2xl border border-transparent">
              
              {/* Encabezado de la columna */}
              <div className="px-2 pb-2 border-b border-zinc-900/80 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono font-black tracking-wider text-zinc-400 uppercase">{col.title}</h3>
                  <span className="text-[11px] font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {col.totalValue}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-600">{col.count}</span>
              </div>

              {/* Contenedor de Tarjetas */}
              <div className="space-y-4 flex-1">
                {col.deals.map((deal) => (
                  <div 
                    key={deal.id}
                    className="bg-zinc-950 border border-zinc-900 hover:border-zinc-700 p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[220px] cursor-grab active:cursor-grabbing"
                  >
                    {/* Efecto Glow en Hover */}
                    <div className="absolute -inset-px bg-gradient-to-r from-[#CCFF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500 rounded-2xl pointer-events-none"></div>

                    {/* Fila Superior: Cliente y Tag Geográfico */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-lg font-bold text-white tracking-tight truncate">{deal.client}</h4>
                        <span className="text-[9px] font-mono font-black bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 tracking-wider uppercase shrink-0">
                          {deal.tag}
                        </span>
                      </div>

                      {/* Badge de Estado Dinámico */}
                      <div className="inline-block">
                        <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded uppercase ${
                          deal.statusType === 'danger' ? 'bg-red-950/50 text-red-400 border border-red-900/40' :
                          deal.statusType === 'info' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/40' :
                          deal.statusType === 'success' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20' :
                          deal.statusType === 'warning' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/40' :
                          'bg-purple-950/50 text-purple-400 border border-purple-900/40' // Premium Cierre
                        }`}>
                          {deal.status}
                        </span>
                      </div>
                    </div>

                    {/* Información del Inmueble (Centro) */}
                    <div className="my-4 space-y-1 font-sans">
                      <p className="text-sm font-semibold text-zinc-300 flex items-center gap-1">
                        🏢 <span className="text-white">{deal.property}</span>
                      </p>
                      <p className="text-xs text-zinc-500 font-mono pl-5">// {deal.type}</p>
                    </div>

                    {/* Fila Inferior: Monto (Gigante) y Tiempo */}
                    <div className="border-t border-zinc-900/60 pt-4 flex justify-between items-center mt-auto">
                      <span className="text-xl font-black font-mono text-[#CCFF00] tracking-tight drop-shadow">
                        {deal.value}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-zinc-600">{deal.time}</span>
                        <button className="bg-zinc-900 hover:bg-zinc-850 p-2 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}

                {/* Zona fantasma para rellenar visualmente la columna si está vacía o tiene pocos elementos */}
                {col.deals.length < 2 && (
                  <div className="border border-dashed border-zinc-900/60 h-[220px] rounded-2xl flex items-center justify-center text-zinc-800 font-mono text-xs select-none">
                    // SOLTAR CASO AQUÍ
                  </div>
                )}
              </div>

            </div>
          ))}
        </main>

      </div>
    </div>
  );
}