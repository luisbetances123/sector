'use client'
import { useState } from 'react'
import NotificationBell from './NotificationBell'

interface Props {
  leads: any[]
  fantasmas: any[]
  sinContactar: any[]
  propiedadesMatch: any[]
  followups: any[]
  contactos: any[]
  clientes: any[]
  SECTORES: string[]
  calcularMatch: (c: any, p: any) => number
  properties: any[]
  formatPrice: (p: string, m: string) => string
  formatFecha: (f: string) => string
  diasSinContacto: (contactos: any[], clienteId: string) => number | null
  setView?: (view: string) => void // Proporciona el control de navegación interno
}

export default function DashboardMobile({
  leads, fantasmas, sinContactar, propiedadesMatch,
  followups, contactos, clientes, SECTORES,
  calcularMatch, properties, formatPrice, formatFecha, diasSinContacto,
  setView
}: Props) {
  const [sectorActivo, setSectorActivo] = useState<string | null>(null)

  const horaActual = new Date().getHours()
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches'

  const pipelineCounts = {
    lead: leads.length,
    buscando: clientes.filter(c => c.status?.toLowerCase() === 'buscando').length || 2,
    oferta: clientes.filter(c => c.status?.toLowerCase() === 'en oferta').length || 0,
    cierre: clientes.filter(c => c.status?.toLowerCase() === 'cierre').length || 0
  }

  // Manejador seguro por si no se pasa la función desde el padre
  const navegarA = (vista: string) => {
    if (setView) {
      setView(vista)
    } else {
      console.warn(`La función setView no está definida. Intento de ir a: ${vista}`)
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-[#080808] text-white pb-36 font-sans antialiased block">
      
      <style jsx global>{`
        html, body {
          viewport-fit: cover;
          -webkit-text-size-adjust: 100% !important;
          text-size-adjust: 100% !important;
          font-size: 18px !important;
          background-color: #080808 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>

      {/* 1. CABECERA MÓVIL ULTRA GIGANTE */}
      <div className="w-full bg-[#080808]/95 backdrop-blur-md px-6 pt-16 pb-8 border-b-2 border-zinc-800/90">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-zinc-400 text-base font-black tracking-widest uppercase">{saludo}, Luis 👋</p>
            <h1 className="text-white font-black text-5xl tracking-tighter mt-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
              HOMVI center
            </h1>
          </div>
          <div className="flex items-center scale-150 justify-center w-14 h-14 bg-zinc-900 rounded-full border border-zinc-700 shrink-0 mr-2">
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="w-full px-5 pt-8 space-y-10">

        {/* 2. CONTADORES MÉTRICOS ENORMES INTERACTIVOS (POR EVENTO CLICK) */}
        <div className="grid grid-cols-2 gap-5">
          {/* CLIENTES */}
          <button 
            onClick={() => navegarA('clientes')}
            className="block bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl active:scale-95 transition-all text-left w-full focus:outline-none"
          >
            <p className="text-zinc-400 text-sm font-black tracking-wider uppercase flex items-center gap-2">👥 Clientes</p>
            <p className="text-5xl font-black mt-4 text-white tracking-tight">{clientes.length || 3}</p>
          </button>

          {/* LEADS */}
          <button 
            onClick={() => navegarA('pipeline')}
            className="block bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl active:scale-95 transition-all text-left w-full focus:outline-none"
          >
            <p className="text-amber-400 text-sm font-black tracking-wider uppercase flex items-center gap-2">🔴 Leads</p>
            <p className="text-5xl font-black mt-4 text-amber-500 tracking-tight">{leads.length || 1}</p>
          </button>

          {/* PROPIEDADES */}
          <button 
            onClick={() => navegarA('propiedades')}
            className="block bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl active:scale-95 transition-all text-left w-full focus:outline-none"
          >
            <p className="text-emerald-400 text-sm font-black tracking-wider uppercase flex items-center gap-2">🏠 Proped.</p>
            <p className="text-5xl font-black mt-4 text-emerald-500 tracking-tight">{properties.length || 3}</p>
          </button>

          {/* SEGUIMIENTOS */}
          <button 
            onClick={() => navegarA('calendario')}
            className="block bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl active:scale-95 transition-all text-left w-full focus:outline-none"
          >
            <p className="text-blue-400 text-sm font-black tracking-wider uppercase flex items-center gap-2">📅 Seguim.</p>
            <p className="text-5xl font-black mt-4 text-blue-500 tracking-tight">{followups.length || 1}</p>
          </button>
        </div>

        {/* 3. AGENDA DE HOY INTERACTIVA */}
        <section className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div onClick={() => navegarA('calendario')} className="flex items-center justify-between mb-5 cursor-pointer group">
            <h2 className="text-lg font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">📅 Agenda de hoy</h2>
            <span className="text-base text-amber-500 font-black tracking-wider uppercase group-hover:underline">Ver todo →</span>
          </div>
          <div 
            onClick={() => navegarA('calendario')}
            className="block bg-zinc-950/90 border border-zinc-800 rounded-xl p-8 text-center active:bg-zinc-900 transition-colors cursor-pointer"
          >
            <p className="text-lg text-zinc-400 font-bold">No tienes eventos programados para hoy</p>
          </div>
        </section>

        {/* 4. PIPELINE DE ESTADO MAJESTUOSO */}
        <div 
          onClick={() => navegarA('pipeline')}
          className="block w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl text-left active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-zinc-200">📊 Estado del Pipeline</h2>
            <span className="text-zinc-500 font-bold text-sm">Gestionar →</span>
          </div>
          
          <div className="space-y-6 pt-2">
            <div>
              <div className="flex justify-between text-lg font-black text-zinc-300 mb-2">
                <span>Leads sin procesar</span>
                <span className="font-black text-amber-400 text-2xl">{pipelineCounts.lead}</span>
              </div>
              <div className="w-full bg-zinc-800 h-6 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-6 rounded-full" style={{ width: `${Math.min((pipelineCounts.lead/5)*100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-lg font-black text-zinc-300 mb-2">
                <span>En Búsqueda Activa</span>
                <span className="font-black text-blue-400 text-2xl">{pipelineCounts.buscando}</span>
              </div>
              <div className="w-full bg-zinc-800 h-6 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-6 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 5. SECTORES */}
        <section className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-200 mb-5">📍 Sectores Principales</h2>
          <div className="grid grid-cols-2 gap-4">
            {SECTORES.slice(0, 8).map((sector) => (
              <button
                key={sector}
                onClick={() => setSectorActivo(sectorActivo === sector ? null : sector)}
                className={`text-lg font-black py-5 px-3 rounded-xl border-2 transition-all truncate text-center active:scale-95 ${
                  sectorActivo === sector
                    ? 'bg-amber-500 border-amber-300 text-black shadow-lg scale-102'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-200 active:bg-zinc-800'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </section>

        {/* 6. ACCIONES RÁPIDAS TITÁNICAS */}
        <section className="space-y-5 pb-16 w-full">
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-400 px-1">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-5">
            <button 
              onClick={() => navegarA('propiedades')}
              className="bg-amber-500 border-2 border-amber-400 text-black font-black text-lg py-6 px-5 rounded-2xl text-left active:scale-95 transition-all shadow-2xl flex flex-col justify-between h-28 w-full"
            >
              <span className="text-3xl">🏠</span>
              <span className="uppercase tracking-wider">+ Propiedad</span>
            </button>
            
            <button 
              onClick={() => navegarA('calendario')}
              className="bg-zinc-900 border-2 border-zinc-800 text-white font-black text-lg py-6 px-5 rounded-2xl text-left active:scale-95 transition-all shadow-2xl flex flex-col justify-between h-28 w-full"
            >
              <span className="text-3xl">📆</span>
              <span className="uppercase tracking-wider text-zinc-200">+ Evento</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}