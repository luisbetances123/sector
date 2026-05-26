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
       <div className="fixed inset-0 w-full h-full bg-[#080808] text-white pb-36 font-sans overflow-y-auto z-50">
      
      {/* 1. CABECERA MÓVIL AMPLIA */}
      <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md px-5 pt-14 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm font-bold tracking-wide uppercase">{saludo}, Luis 👋</p>
            <h1 className="text-white font-black text-3xl tracking-tight mt-0.5">HOMVI center</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-7">

        {/* 2. CONTADORES MÉTRICOS AMPLIOS (Cuadrícula de 2 columnas legible) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <p className="text-zinc-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">👥 Clientes</p>
            <p className="text-3xl font-black mt-2 text-white">{clientes.length || 3}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <p className="text-amber-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">🔴 Leads</p>
            <p className="text-3xl font-black mt-2 text-amber-500">{leads.length || 1}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <p className="text-emerald-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">🏠 Propiedades</p>
            <p className="text-3xl font-black mt-2 text-emerald-500">{properties.length || 3}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <p className="text-blue-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">📅 Seguim.</p>
            <p className="text-3xl font-black mt-2 text-blue-500">{followups.length || 1}</p>
          </div>
        </div>

        {/* 3. AGENDA DE HOY (Más visible y limpia) */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">📅 Agenda de hoy</h2>
            <span className="text-xs text-amber-500 font-bold">Ver todo →</span>
          </div>
          <div className="bg-zinc-950/60 border border-zinc-800/40 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 font-medium">No tienes eventos programados para hoy</p>
          </div>
        </section>

        {/* 4. VISUALIZADOR DEL PIPELINE (Barras gruesas y letras grandes) */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300">📊 Estado del Pipeline</h2>
          
          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-sm font-bold text-zinc-300 mb-1.5">
                <span>Leads sin procesar</span>
                <span className="font-black text-amber-500 text-base">{pipelineCounts.lead}</span>
              </div>
              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-3 rounded-full" style={{ width: `${Math.min((pipelineCounts.lead/5)*100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-zinc-300 mb-1.5">
                <span>En Búsqueda Activa</span>
                <span className="font-black text-blue-400 text-base">{pipelineCounts.buscando}</span>
              </div>
              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-zinc-300 mb-1.5">
                <span>En Oferta / Cierre</span>
                <span className="font-black text-purple-400 text-base">{pipelineCounts.oferta}</span>
              </div>
              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* 5. BUSCAR POR SECTOR (Dos columnas más grandes, ideales para dedos) */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-4">📍 Sectores Principales</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {SECTORES.slice(0, 8).map((sector) => (
              <button
                key={sector}
                onClick={() => setSectorActivo(sectorActivo === sector ? null : sector)}
                className={`text-xs font-bold py-3 px-3 rounded-xl border transition-all truncate text-center ${
                  sectorActivo === sector
                    ? 'bg-amber-500 border-amber-400 text-black shadow-md font-black'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-300 active:bg-zinc-800'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </section>

        {/* 6. ACCIONES RÁPIDAS (Grandes botones corporativos) */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 px-1">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-zinc-900 border border-zinc-800 text-white font-bold text-sm py-4 px-4 rounded-xl text-left active:bg-zinc-800 shadow-sm flex flex-col justify-between h-20">
              <span className="text-xl">🏠</span>
              <span>+ Propiedad</span>
            </button>
            <button className="bg-zinc-900 border border-zinc-800 text-white font-bold text-sm py-4 px-4 rounded-xl text-left active:bg-zinc-800 shadow-sm flex flex-col justify-between h-20">
              <span className="text-xl">📆</span>
              <span>+ Evento</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}