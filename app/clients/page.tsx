'use client'
import React from 'react';
import { UserPlus, Search, Upload } from 'lucide-react';

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
      {/* CABECERA REORGANIZADA */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic text-amber-500">CLIENTES</h1>
            <p className="text-zinc-500 font-mono text-xs mt-1">BASE DE DATOS ACTIVA ({clients.length})</p>
          </div>
          
          <div className="flex gap-4">
            {/* ESTE ES EL BOTÓN QUE VAMOS A FORZAR */}
            <button 
              onClick={() => alert('Importador activado')}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Upload className="w-4 h-4" />
              Importar Excel
            </button>
            
            <button className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all">
              <UserPlus className="w-4 h-4" />
              Nuevo Registro
            </button>
          </div>
        </div>
      </div>

      {/* GRID DE CLIENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-amber-500 transition-all">
            <div className="flex justify-between items-start mb-4 text-sm font-bold">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center">
                  {client.initial}
                </div>
                <div>
                  <h3 className="text-lg">{client.name}</h3>
                  <p className="text-zinc-600 text-[10px] uppercase">{client.email}</p>
                </div>
              </div>
              <span className="text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                {client.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <span className="text-zinc-500 text-xs">{client.type}</span>
              <span className="text-white font-mono">{client.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
