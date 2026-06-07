import React from 'react';
import { getPremiumClients } from '@/app/actions /clientes';

export default async function ClientesPage() {
  const clients = await getPremiumClients();

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

        {/* LISTADO DE CLIENTES */}
        <main className="space-y-6">
          {clients.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-mono">
              // NO SE DETECTARON CLIENTES EN LA TABLA REAL DE SUPABASE
            </div>
          ) : (
            clients.map((client) => (
              <div 
                key={client.id} 
                className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 transition-all group relative overflow-hidden shadow-2xl hover:border-zinc-700 duration-300"
              >
                <div className="flex items-center gap-6 max-w-md">
                  <div className="w-14 h-14 bg-zinc-900 group-hover:bg-zinc-850 border border-zinc-800 rounded-full flex items-center justify-center font-mono font-black text-zinc-400 group-hover:text-[#CCFF00] text-xl transition-all shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-white tracking-tight">{client.name}</h3>
                      <span className="text-[10px] font-mono font-black tracking-widest bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded border border-zinc-800 uppercase">
                        {client.perfil}
                      </span>
                      <span className={`text-[10px] font-mono font-black tracking-widest px-2.5 py-0.5 rounded border uppercase ${
                        client.temperatura === 'CALIENTE' ? 'bg-red-950/40 text-red-400 border-red-900/30' : 'bg-amber-950/40 text-amber-400 border-amber-900/30'
                      }`}>
                        {client.temperatura}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-zinc-500 space-y-0.5">
                      <p className="hover:text-white transition-colors">✉ {client.email}</p>
                      <p>📞 {client.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 border-t lg:border-t-0 border-zinc-900 pt-6 lg:pt-0 w-full lg:w-auto flex-1 max-w-3xl">
                  <div>
                    <span className="block text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Objetivo</span>
                    <span className="text-sm font-semibold text-zinc-200 truncate block">{client.objetivo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Estructura</span>
                    <span className="text-sm font-semibold text-zinc-200 truncate block">{client.estructura}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Zona de Interés</span>
                    <span className="text-sm font-semibold text-[#CCFF00] truncate block">📍 {client.zonaInteres}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Incentivo Fiscal</span>
                    <span className="text-sm font-semibold text-zinc-200 truncate block">{client.incentivoFiscal}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

        {/* SECCIÓN DEL MAPA */}
        <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter">🌐 Geolocalización Inmobiliaria Activa</h2>
              <p className="text-xs text-zinc-500 font-mono mt-1">// Ecosistema de cobertura patrimonial</p>
            </div>
            <span className="text-[10px] font-mono bg-zinc-900 text-[#CCFF00] px-3 py-1 rounded-full border border-zinc-800 font-bold">
              GOOGLE MAPS API READY
            </span>
          </div>
          <div className="w-full bg-zinc-900/50 h-[350px] rounded-xl border border-zinc-900 flex items-center justify-center relative overflow-hidden group shadow-inner">
            <span className="text-sm font-mono text-zinc-500 tracking-widest uppercase animate-pulse">
              [ Mapa interactivo activo ]
            </span>
          </div>
        </section>

      </div>
    </div>
  );
}