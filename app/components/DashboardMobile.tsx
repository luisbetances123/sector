'use client'
import { useState } from 'react'
import Link from 'next/link'
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
}

export default function DashboardMobile({
  leads, fantasmas, sinContactar, propiedadesMatch,
  followups, contactos, clientes, SECTORES,
  calcularMatch, properties, formatPrice, formatFecha, diasSinContacto
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

  return (
    <div className="fixed inset-0 w-full h-full bg-[#080808] text-white pb-40 font-sans overflow-y-auto z-50 antialiased selection:bg-amber-500 selection:text-black">
      
      {/* Forzar escala móvil real e inyección de Viewport agresiva */}
      <style jsx global>{`
        html, body {
          viewport-fit: cover;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
          font-size: 16px !important; /* Base sólida para evitar fuentes microscópicas */
        }
      `}</style>

      {/* 1. CABECERA MÓVIL GIGANTE */}
      <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md px-6 pt-16 pb-6 border-b border-zinc-800/90">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm font-black tracking-widest uppercase">{saludo}, Luis 👋</p>
            <h1 className="text-white font-black text-4xl tracking-tighter mt-1 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
              HOMVI center
            </h1>
          </div>
          <div className="flex items-center scale-125 justify-center w-12 h-12 bg-zinc-900 rounded-full border border-zinc-800 shrink-0">
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-8">

        {/* 2. CONTADORES MÉTRICOS ENORMES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border-2 border-zinc-800/80 rounded-2xl p-6 shadow-xl active:scale-95 transition-all">
            <p className="text-zinc-400 text-xs font-black tracking-wider uppercase flex items-center gap-2">👥 Clientes</p>
            <p className="text-4xl font-black mt-3 text-white tracking-tight">{clientes.length || 3}</p>
          </div>
          <div className="bg-zinc-900 border-2 border-zinc-800/80 rounded-2xl p-6 shadow-xl active:scale-95 transition-all">
            <p className="text-amber-400 text-xs font-black tracking-wider uppercase flex items-center gap-2">🔴 Leads</p>
            <p className="text-4xl font-black mt-3 text-amber-500 tracking-tight">{leads.length || 1}</p>
          </div>
          <div className="bg-zinc-900 border-2 border-zinc-800/80 rounded-2xl p-6 shadow-xl active:scale-95 transition-all">
            <p className="text-emerald-400 text-xs font-black tracking-wider uppercase flex items-center gap-2">🏠 Propiedades</p>
            <p className="text-4xl font-black mt-3 text-emerald-500 tracking-tight">{properties.length || 3}</p>
          </div>
          <div className="bg-zinc-900 border-2 border-zinc-800/80 rounded-2xl p-6 shadow-xl active:scale-95 transition-all">
            <p className="text-blue-400 text-xs font-black tracking-wider uppercase flex items-center gap-2">📅 Seguim.</p>
            <p className="text-4xl font-black mt-3 text-blue-500 tracking-tight">{followups.length || 1}</p>
          </div>
        </div>

        {/* 3. AGENDA DE HOY */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">📅 Agenda de hoy</h2>
            <span className="text-sm text-amber-500 font-black tracking-wider uppercase hover:underline">Ver todo →</span>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800/60 rounded-xl p-6 text-center">
            <p className="text-base text-zinc-400 font-bold">No tienes eventos programados para hoy</p>
          </div>
        </section>

        {/* 4. VISUALIZADOR DEL PIPELINE CON BARRA GRUESA */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-md">
          <h2 className="text-base font-black uppercase tracking-widest text-zinc-300">📊 Estado del Pipeline</h2>
          
          <div className="space-y-5 pt-1">
            <div>
              <div className="flex justify-between text-base font-black text-zinc-300 mb-2">
                <span>Leads sin procesar</span>
                <span className="font-black text-amber-500 text-xl">{pipelineCounts.lead}</span>
              </div>
              <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-4 rounded-full" style={{ width: `${Math.min((pipelineCounts.lead/5)*100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-base font-black text-zinc-300 mb-2">
                <span>En Búsqueda Activa</span>
                <span className="font-black text-blue-400 text-xl">{pipelineCounts.buscando}</span>
              </div>
              <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-base font-black text-zinc-300 mb-2">
                <span>En Oferta / Cierre</span>
                <span className="font-black text-purple-400 text-xl">{pipelineCounts.oferta}</span>
              </div>
              <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-4 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECTORES PRINCIPALES (BOTONES ENORMES) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-black uppercase tracking-widest text-zinc-300 mb-4">📍 Sectores Principales</h2>
          <div className="grid grid-cols-2 gap-3">
            {SECTORES.slice(0, 8).map((sector) => (
              <button
                key={sector}
                onClick={() => setSectorActivo(sectorActivo === sector ? null : sector)}
                className={`text-base font-black py-4 px-3 rounded-xl border transition-all truncate text-center active:scale-95 ${
                  sectorActivo === sector
                    ? 'bg-amber-500 border-amber-400 text-black shadow-lg scale-102'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-200 active:bg-zinc-800'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </section>

        {/* 6. ACCIONES RÁPIDAS EXTRAGRANDE */}
        <section className="space-y-4 pb-4">
          <h2 className="text-base font-black uppercase tracking-widest text-zinc-400 px-1">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-amber-500 border-2 border-amber-400 text-black font-black text-base py-5 px-5 rounded-2xl text-left active:scale-95 transition-all shadow-lg flex flex-col justify-between h-24">
              <span className="text-2xl">🏠</span>
              <span className="uppercase tracking-wide">+ Propiedad</span>
            </button>
            <button className="bg-zinc-900 border-2 border-zinc-800 text-white font-black text-base py-5 px-5 rounded-2xl text-left active:scale-95 transition-all shadow-lg flex flex-col justify-between h-24">
              <span className="text-2xl">📆</span>
              <span className="uppercase tracking-wide text-zinc-200">+ Evento</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}