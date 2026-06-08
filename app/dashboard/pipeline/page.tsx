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
         <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          <div className="bg-zinc-950/20 p-2 rounded-2xl min-h-[650px]">
            <h3 className="text-xs font-mono text-zinc-400 uppercase">PRUEBA DE PANTALLA</h3>
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl mt-4">
              <h4 className="text-white font-bold">Inversiones Piantini</h4>
              <p className="text-[#CCFF00]">US$ 450,000</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}