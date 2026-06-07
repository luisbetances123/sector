import React from 'react';
import { getPipelineDeals } from '@/app/actions/clientes';

export default async function PipelinePage() {
  const columns = await getPipelineDeals();

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
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

        {/* KANBAN GRID */}
        {/* KANBAN GRID */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col) => {
            // Lógica de Mock Data: Solo se activa si la columna está vacía
            const displayDeals = col.deals.length > 0 ? col.deals : [
              {
                id: 'demo-1',
                client: 'Inversiones Piantini',
                tag: 'VIP',
                status: 'En Negociación',
                statusType: 'success',
                property: 'Torre Residencial Naco',
                value: 'US$ 450,000',
                time: 'Hace 2h'
              }
            ];

            return (
              <div key={col.id} className="flex flex-col space-y-4 h-full min-h-[650px] bg-zinc-950/20 p-2 rounded-2xl">
                <div className="px-2 pb-2 border-b border-zinc-900/80 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono font-black tracking-wider text-zinc-400 uppercase">{col.title}</h3>
                    <span className="text-[11px] font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {col.totalValue}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-600">{col.count}</span>
                </div>

                <div className="space-y-4 flex-1">
                  {displayDeals.map((deal: any) => (
                    <div 
                      key={deal.id} 
                      className="bg-zinc-950 border border-zinc-900 hover:border-zinc-700 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 shadow-xl"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-lg font-bold text-white tracking-tight truncate">{deal.client}</h4>
                          <span className="text-[9px] font-mono font-black bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 tracking-wider uppercase shrink-0">
                            {deal.tag}
                          </span>
                        </div>
                        <div className="inline-block">
                          <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded uppercase ${
                            deal.statusType === 'danger' ? 'bg-red-950/50 text-red-400 border border-red-900/40' :
                            deal.statusType === 'info' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/40' :
                            deal.statusType === 'success' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20' :
                            deal.statusType === 'warning' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/40' : 'bg-purple-950/50 text-purple-400 border border-purple-900/40'
                          }`}>{deal.status}</span>
                        </div>
                      </div>

                      <div className="my-4 space-y-1 font-sans">
                        <p className="text-sm font-semibold text-zinc-300 truncate">🏢 <span className="text-white">{deal.property}</span></p>
                      </div>

                      <div className="border-t border-zinc-900/60 pt-4 flex justify-between items-center mt-auto">
                        <span className="text-xl font-black font-mono text-[#CCFF00] tracking-tight">{deal.value}</span>
                        <span className="text-[11px] font-mono text-zinc-600">{deal.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
    </div>
  );
}