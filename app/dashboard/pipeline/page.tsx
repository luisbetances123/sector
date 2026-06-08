import React from 'react';

export default function PipelinePage() {
  // Datos locales directos para asegurar que siempre se vea el UI
  const columns = [
    { id: '1', title: 'Prospectos', count: '2 deals', total: 'US$ 0' },
    { id: '2', title: 'Visitas', count: '1 deal', total: 'US$ 450,000' },
    { id: '3', title: 'Negociación', count: '0 deals', total: 'US$ 0' },
    { id: '4', title: 'Cierre', count: '0 deals', total: 'US$ 0' }
  ];

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="border-b border-zinc-900 pb-10">
          <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociación</span>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="bg-zinc-950/20 p-4 rounded-2xl min-h-[600px] border border-zinc-900/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-mono font-black text-zinc-400 uppercase">{col.title}</h3>
                <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded">{col.total}</span>
              </div>
              
              {/* Tarjeta de demo en la columna 2 */}
              {col.id === '2' && (
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl shadow-lg">
                  <h4 className="font-bold text-white">Inversiones Piantini</h4>
                  <p className="text-xs text-zinc-400 mt-1">Torre Naco</p>
                  <p className="text-[#CCFF00] font-black mt-3">US$ 450,000</p>
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}