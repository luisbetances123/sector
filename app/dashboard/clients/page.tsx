"use client";

import React, { useState } from 'react';
import { generateWhatsAppLink } from "@/utils/whatsapp";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: string;
  budgetNum: number;
  status: 'NUEVO' | 'ACTIVO' | 'ESTANCADO';
  origin: string;
  registeredAt: string;
}

export default function ClientsPage() {
  const [clients] = useState<Client[]>([
    {
      id: "c1",
      name: "Juan Manuel Peralta",
      email: "j.peralta@email.com",
      phone: "18095551234",
      propertyInterest: "Torre Serralles - 3BR",
      budget: "US$ 325,000",
      budgetNum: 325000,
      status: "NUEVO",
      origin: "Instagram Ads",
      registeredAt: "Hoy"
    },
    {
      id: "c2",
      name: "David Chen",
      email: "david.chen@global.com",
      phone: "18095551234",
      propertyInterest: "Villa en Cap Cana",
      budget: "US$ 1,250,000",
      budgetNum: 1250000,
      status: "NUEVO",
      origin: "Recomendado",
      registeredAt: "Hoy"
    },
    {
      id: "c3",
      name: "Dr. Marcos Rossi",
      email: "m.rossi@medicina.com",
      phone: "18095551234",
      propertyInterest: "Blue Mall Residences",
      budget: "US$ 580,000",
      budgetNum: 580000,
      status: "ACTIVO",
      origin: "Página Web",
      registeredAt: "Hace 1 día"
    },
    {
      id: "c4",
      name: "Sofía Rodríguez",
      email: "sofia.rod@diseno.com",
      phone: "18095551234",
      propertyInterest: "Apt Bella Vista Vista Mar",
      budget: "US$ 280,000",
      budgetNum: 280000,
      status: "ACTIVO",
      origin: "WhatsApp Business",
      registeredAt: "Hace 2 días"
    },
    {
      id: "c5",
      name: "Ricardo Arjona",
      email: "arjona@musica.com",
      phone: "18095551234",
      propertyInterest: "Casa de Campo - Dye Fore",
      budget: "US$ 3,500,000",
      budgetNum: 3500000,
      status: "ACTIVO",
      origin: "Directo",
      registeredAt: "Hace 1 día"
    },
    {
      id: "c6",
      name: "Elena de los Santos",
      email: "elena.santos@leyes.com",
      phone: "18095551234",
      propertyInterest: "Penthouse Evaristo Morales",
      budget: "US$ 540,000",
      budgetNum: 540000,
      status: "ESTANCADO",
      origin: "Google Search",
      registeredAt: "Hace 7 días"
    },
    {
      id: "c7",
      name: "Familia Bisonó",
      email: "bisono.contacto@familia.com",
      phone: "18095551234",
      propertyInterest: "Prados del Este - Casa",
      budget: "US$ 195,000",
      budgetNum: 195000,
      status: "ESTANCADO",
      origin: "Rótulo Propiedad",
      registeredAt: "Hace 12 días"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.propertyInterest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudget = clients.reduce((sum, c) => sum + c.budgetNum, 0);

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Cabecera */}
        <header className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Base de Datos Central</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Directorio de Clientes</h1>
          </div>
          
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar por nombre o propiedad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-zinc-100 placeholder-zinc-600 text-xs rounded-xl px-4 py-3 outline-none transition-colors"
            />
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Registrados</p>
            <p className="text-3xl font-black text-white mt-2">{clients.length} Inversionistas</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Capital de Interés Total</p>
            <p className="text-3xl font-black text-[#CCFF00] mt-2">US$ {totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Tasa de Respuesta Activa</p>
            <p className="text-3xl font-black text-white mt-2">
              {Math.round((clients.filter(c => c.status !== 'ESTANCADO').length / clients.length) * 100)}%
            </p>
          </div>
        </section>

        {/* Tabla Avanzada de Clientes */}
        <section className="bg-zinc-950/40 rounded-2xl border border-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="p-4 pl-6">Nombre e Información</th>
                  <th className="p-4">Propiedad de Interés</th>
                  <th className="p-4">Presupuesto</th>
                  <th className="p-4">Estado Temperatura</th>
                  <th className="p-4">Origen Lead</th>
                  <th className="p-4 pr-6 text-center">Canales de Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-xs">
                {filteredClients.map((client) => {
                  return (
                    <tr key={client.id} className="hover:bg-zinc-900/20 transition-colors group">
                      
                      <td className="p-4 pl-6">
                        <div className="font-bold text-white text-sm group-hover:text-[#CCFF00] transition-colors">{client.name}</div>
                        <div className="text-zinc-500 font-mono text-[11px] mt-0.5">{client.email}</div>
                      </td>

                      <td className="p-4">
                        <span className="text-zinc-300 font-medium">{client.propertyInterest}</span>
                        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">Registrado: {client.registeredAt}</div>
                      </td>

                      <td className="p-4">
                        <span className="text-[#CCFF00] font-black font-mono">{client.budget}</span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                          client.status === 'NUEVO' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20 animate-pulse' :
                          client.status === 'ESTANCADO' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}>
                          {client.status === 'NUEVO' && '🟢'}
                          {client.status === 'ESTANCADO' && '🥶'}
                          {client.status === 'ACTIVO' && '⚡'}
                          {client.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-zinc-500 font-mono text-[11px] bg-zinc-900/50 px-2 py-1 rounded border border-zinc-900">
                          {client.origin}
                        </span>
                      </td>

                      {/* CANALES DE CONTACTO OMNICANAL (WhatsApp, Llamada, Video) */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Chat de WhatsApp */}
                          <a
                            href={generateWhatsAppLink({
                              phone: client.phone,
                              clientName: client.name,
                              propertyName: client.propertyInterest,
                              propertyPrice: client.budget
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat de WhatsApp"
                            className="p-2 bg-zinc-900 hover:bg-[#CCFF00] border border-zinc-800 hover:border-[#CCFF00] text-zinc-400 hover:text-black rounded-lg transition-all"
                          >
                            💬
                          </a>

                          {/* Llamada Telefónica Nativa */}
                          <a
                            href={`tel:${client.phone}`}
                            title="Llamar por teléfono"
                            className="p-2 bg-zinc-900 hover:bg-blue-500 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-white rounded-lg transition-all"
                          >
                            📞
                          </a>

                          {/* Simulación de Videollamada (Google Meet / Zoom) */}
                          <button
                            onClick={() => alert(`🎥 Iniciando sala virtual de Sector para presentar "${client.propertyInterest}" a ${client.name}...`)}
                            title="Iniciar sala virtual / Videollamada"
                            className="p-2 bg-zinc-900 hover:bg-purple-500 border border-zinc-800 hover:border-purple-500 text-zinc-400 hover:text-white rounded-lg transition-all"
                          >
                            🎥
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}