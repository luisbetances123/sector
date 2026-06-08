import React from 'react';
import { getPipelineDeals } from '@/app/actions/clientes';

export default async function PipelinePage() {
  const columns = await getPipelineDeals();

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-10">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociación</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
          </div>
          <button className="bg-[#CCFF00] text-black font-mono font-bold text-xs uppercase py-4 px-6 rounded-xl">+ Nuevo Cliente</button>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((col: any) => {
            const displayDeals = col.deals.length > 0 ? col.deals : [
              { id: 'demo-1', client: 'Inversiones Piantini', tag: 'VIP', status: 'En Negociación', statusType: 'success', property: 'Torre Naco', value: 'US$ 450,000', time: 'Hace 2h' }
            ];

            return (
              <div key={col.id} className="flex flex-col space-y-4 h-full min-h-[650px] bg-zinc-950/20 p-2 rounded-2xl">
                <div className="px-2 pb-2 border-b border-zinc-900/80">
                  <h3 className="text-xs font-mono font-black text-zinc-400 uppercase">{col.title}</h3>
                </div>
                <div className="space-y-4 flex-1">
                  {displayDeals.map((deal: any) => (
                    <div key={deal.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
                      <h4 className="font-bold text-white">{deal.client}</h4>
                      <p className="text-sm text-zinc-300">{deal.property}</p>
                      <span className="text-xl font-black text-[#CCFF00]">{deal.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}