'use client'
import React from 'react'
import { Users, Plus, Mail, Phone, Tag } from 'lucide-react'

export default function ClientsPage() {
  const clients = [
    { id: 1, name: 'Luis Betances', email: 'luis@homvi.com', phone: '+1 809-555-0123', status: 'Inversionista' },
    { id: 2, name: 'Jean Lizardo', email: 'jean@homvi.com', phone: '+1 829-555-4567', status: 'Comprador' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Directorio de Clientes</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Gestión y perfiles de compradores premium</p>
        </div>
        <button className="bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-black/20 border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-900">
          {clients.map((client) => (
            <div key={client.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-zinc-400">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-200">{client.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-900 text-[#CCFF00] px-2 py-0.5 rounded border border-zinc-800 mt-1">
                    <Tag className="w-2.5 h-2.5" /> {client.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-600" /> {client.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-600" /> {client.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}