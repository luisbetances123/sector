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
    <div className="p-8 ml-64 bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold italic tracking-tighter text-amber-500">Mis Clientes</h1>
          <p className="text-zinc-500 text-sm mt-1">{clients.length} clientes en cartera</p>
        </div>
        <div className="flex gap-3 mt-2">
          {/* BOTÓN DE IMPORTAR */}
          <button 
            onClick={() => alert('Función de importación próximamente')}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg border border-zinc-800 transition-all text-sm font-medium"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            Importar desde Excel/CRM
          </button>
          
          <button className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
            <UserPlus className="w-4 h-4" /> + NUEVO CLIENTE
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Buscar por nombre, email o teléfono..." 
          className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl hover:border-amber-500/40 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500 font-bold text-xl">
                  {client.initial}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-amber-500 transition-colors">{client.name}</h3>
                  <p className="text-zinc-500 text-xs mt-1">{client.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                client.status === 'CIERRE' ? 'text-green-500 border-green-500/20 bg-green-500/5' :
                'text-zinc-400 border-zinc-800 bg-zinc-900'
              }`}>
                {client.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800/30">
              <span className="text-zinc-500 text-sm italic">{client.type}</span>
              <span className="text-amber-500 font-bold tracking-tight">{client.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
