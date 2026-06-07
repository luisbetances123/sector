'use client';

import React, { useState } from 'react';

// Tipado del Cliente
interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  perfil: 'INVERSIONISTA' | 'COMPRADOR' | 'VENDEDOR';
  temperatura: 'CALIENTE' | 'TIBIO' | 'FRIO';
  objetivo: string;
  estructuraFinanciera: string;
  zonaInteres: string;
  confotur: boolean;
}

export default function ClientesPage() {
  // Datos simulados idénticos a tu estructura actual
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Luis Betances',
      email: 'luis@homvi.com',
      telefono: '+1 809-555-0123',
      perfil: 'INVERSIONISTA',
      temperatura: 'CALIENTE',
      objetivo: 'Renta Corta (Airbnb)',
      estructuraFinanciera: 'Fondos Propios',
      zonaInteres: 'Piantini, Santo Domingo',
      confotur: true,
    },
    {
      id: '2',
      nombre: 'Jean Lizardo',
      email: 'jean@homvi.com',
      telefono: '+1 829-555-4567',
      perfil: 'COMPRADOR',
      temperatura: 'TIBIO',
      objetivo: 'Vivienda Principal',
      estructuraFinanciera: 'Financiamiento Bancario',
      zonaInteres: 'Las Terrenas, Samaná',
      confotur: false,
    },
  ]);

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER MONUMENTAL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-10">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia Patrimonial</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">👥 Directorio De Clientes</h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">Segmentación avanzada y gestión de perfiles de alta gama de HOMVI.</p>
          </div>
          <button className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-[0_4px_30px_rgba(204,255,0,0.15)]">
            <span>+ Nuevo Cliente</span>
          </button>
        </header>

        {/* LISTADO DE CLIENTES - Tarjetas masivas con alta legibilidad */}
        <section className="space-y-6">
          {clientes.map((cliente) => (
            <div 
              key={cliente.id} 
              className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all duration-300 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Avatar e Identificación Principal (Col 3) */}
              <div className="lg:col-span-3 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-lg text-[#CCFF00] shadow-inner">
                  {cliente.nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">{cliente.nombre}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {cliente.perfil}
                    </span>
                    <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded ${
                      cliente.temperatura === 'CALIENTE' 
                        ? 'bg-red-950/40 border border-red-900/50 text-red-400' 
                        : 'bg-amber-950/40 border border-amber-900/50 text-amber-400'
                    }`}>
                      🔥 {cliente.temperatura}
                    </span>
                  </div>
                </div>
              </div>

              {/* Objetivos y Estructura (Col 4) */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-l border-zinc-900 pl-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Objetivo</span>
                  <span className="text-sm font-semibold text-zinc-200 block mt-1">{cliente.objetivo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Estructura</span>
                  <span className="text-sm font-semibold text-zinc-200 block mt-1">{cliente.estructuraFinanciera}</span>
                </div>
              </div>

              {/* Zona e Incentivo Fiscal (Col 3) */}
              <div className="lg:col-span-3 space-y-3 border-l border-zinc-900 pl-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Zona de Interés</span>
                  <span className="text-sm text-zinc-300 flex items-center gap-1.5 mt-1">
                    📍 <span className="font-medium text-white">{cliente.zonaInteres}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">Incentivo Fiscal</span>
                  {cliente.confotur ? (
                    <span className="text-[11px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/5 px-2 py-0.5 rounded border border-[#CCFF00]/10 inline-block mt-1">
                      🛡️ CONFOTUR APLICA
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500 inline-block mt-1">No Aplica</span>
                  )}
                </div>
              </div>

              {/* Datos de Contacto Resaltados y Acción (Col 2) */}
              <div className="lg:col-span-2 flex flex-col items-end gap-3 justify-center border-l border-zinc-900 pl-6 h-full">
                <div className="text-right space-y-1 w-full">
                  <span className="text-xs font-mono text-zinc-300 block truncate hover:text-[#CCFF00] transition-colors">
                    ✉️ {cliente.email}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 block">
                    📞 {cliente.telefono}
                  </span>
                </div>
                <button className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-200 font-mono text-xs py-2.5 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer text-center font-bold">
                  ✏️ EDITAR
                </button>
              </div>

            </div>
          ))}
        </section>

        {/* SECCIÓN DEL MAPA - Monumentalizada */}
        <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter">🌐 Geolocalización Inmobiliaria Activa</h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">// Enfocado actualmente en: Piantini, Santo Domingo, RD</p>
            </div>
            <span className="text-[10px] font-mono bg-zinc-900 text-[#CCFF00] px-3 py-1 rounded-full border border-zinc-800 font-bold">
              GOOGLE MAPS API OK
            </span>
          </div>
          
          {/* El contenedor del mapa ahora es masivo */}
          <div className="w-full bg-zinc-900/50 h-[350px] rounded-xl border border-zinc-900 flex items-center justify-center relative overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/20 pointer-events-none"></div>
            <span className="text-sm font-mono text-zinc-500 tracking-widest uppercase animate-pulse">
              [ Mapa interactivo de cobertura patrimonial ]
            </span>
          </div>
        </section>

      </div>
    </div>
  );
}