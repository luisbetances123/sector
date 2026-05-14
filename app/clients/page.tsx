'use client'
import React from 'react';
import { UserPlus, Upload, Search } from 'lucide-react';

export default function ClientsPage() {
  const clients = [
    { id: '1', name: 'King Betances', email: 'betancesluis@live.com', status: 'LEAD', type: 'Penthouse', price: '$500,000', initial: 'K' },
    { id: '2', name: 'Jean Luis Betances', email: 'betancesluis@live.com', status: 'CIERRE', type: 'Casa', price: '$69,000', initial: 'J' },
    { id: '3', name: 'Lizmarie Betances', email: 'betancesluis@live.com', status: 'EN OFERTA', type: 'En 1er piso.', price: '$65,000', initial: 'L' },
    { id: '4', name: 'Maria Nunez', email: 'betancesluis@live.com', status: 'BUSCANDO', type: 'Apartamento', price: '$60,000', initial: 'M' },
    { id: '5', name: 'Luis Betances', email: 'betancesluis@live.com', status: 'BUSCANDO', type: 'Terrazas de Boca Chica', price: '$61,000', initial: 'L' },
  ];

  return (
    <div className="p-8 ml-64 bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <div>
          <h1 className="text-5xl font-black italic text-amber-500 tracking-tighter">MIS CLIENTES</h1>
          <p className="text-zinc-500 text-xs mt-2 uppercase tracking-[0.2em]">Base de datos: {clients.length} activos</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => alert('Importador Excel Activado')}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Upload className="w-4 h-4" />
            IMPORTAR EXCEL
          </button>
          <button className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <UserPlus className="w-4 h-4" />
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl hover:border-amber-500 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500 font-bold text-xl">
                  {client.initial}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
                  <p className="text-zinc-600 text-[10px] uppercase font-mono">{client.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded border border-amber-500/20 text-amber-500 bg-amber-500/5 uppercase">
                {client.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
              <span className="text-zinc-500 text-sm italic">{client.type}</span>
              <span className="text-white font-black text-lg tracking-tighter">{client.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
