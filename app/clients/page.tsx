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
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold italic text-amber-500 tracking-tighter">Mis Clientes</h1>
          <p className="text-zinc-500 text-sm mt-1">{clients.length} contactos activos</p>
        </div>
        <div className="flex items-center gap-4">
          {/* BOTÓN DE IMPORTAR - AHORA MÁS VISIBLE */}
          <button 
            onClick={() => alert('Sistema de importación activado')}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-amber-500 hover:text-black text-white px-4 py-2.5 rounded-xl border border-zinc-700 transition-all text-sm font-bold shadow-lg"
          >
            <Upload className="w-4 h-4" />
            IMPORTAR EXCEL
          </button>
          
          <button className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/10">
            <UserPlus className="w-4 h-4" /> + NUEVO CLIENTE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-amber-500 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500 font-bold text-xl">
                  {client.initial}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
                  <p className="text-zinc-500 text-xs">{client.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400">
                {client.status}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
              <span className="text-zinc-500 text-sm italic">{client.type}</span>
              <span className="text-amber-500 font-bold">{client.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
