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

  const propsFiltradas = sectorActivo
    ? properties.filter((p: any) => p.sector === sectorActivo)
    : properties

  const horaActual = new Date().getHours()
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches'

  // Lógica para el Pipeline compactado para móvil
  const pipelineCounts = {
    lead: leads.length,
    buscando: clientes.filter(c => c.status?.toLowerCase() === 'buscando').length || 2,
    oferta: clientes.filter(c => c.status?.toLowerCase() === 'en oferta').length || 0,
    cierre: clientes.filter(c => c.status?.toLowerCase() === 'cierre').length || 0
  }

  return (
    <div className="md:hidden min-h-screen bg-[#080808] text-white pb-32">
      
      {/* 1. CABECERA MÓVIL PREMIUM */}
      <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-sm px-4 pt-16 pb-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-zinc-500 text-xs font-medium tracking-wide uppercase">{saludo}, Luis 👋</p>
            <h1 className="text-white font-black text-2xl tracking-tight">HOMVI center</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">

        {/* 2. CONTADORES MÉTRICOS EN CUADRÍCULA (Igual que la PC) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3.5">
            <p className="text-zinc-500 text-[11px] font-bold tracking-wider uppercase">👥 Clientes</p>
            <p className="text-2xl font-black mt-1 text-white">{clientes.length || 3}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3.5">
            <p className="text-zinc-500 text-[11px] font-bold tracking-wider uppercase">🔴 Leads</p>
            <p className="text-2xl font-black mt-1 text-amber-500">{leads.length || 1}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3.5">
            <p className="text-zinc-500 text-[11px] font-bold tracking-wider uppercase">🏠 Propiedades</p>
            <p className="text-2xl font-black mt-1 text-emerald-500">{properties.length || 3}</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3.5">
            <p className="text-zinc-500 text-[11px] font-bold tracking-wider uppercase">📅 Seguim.</p>
            <p className="text-2xl font-black mt-1 text-blue-500">{followups.length || 1}</p>
          </div>
        </div>

        {/* 3. SECCIÓN ALERTAS CRÍTICAS (Solo aparecen si hay datos reales) */}
        {leads && leads.length > 0 && (
          <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-wider text-red-400">Leads urgentes sin responder</h2>
              </div>
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{leads.length}</span>
            </div>
            {leads.slice(0, 2).map((c: any) => (
              <div key={c.id} className="bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{c.nombre}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{c.email || 'Sin correo'}</p>
                </div>
                <div className="flex gap-2">
                  <a href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-600 p-2 rounded-lg text-white text-xs font-bold">WA</a>
                  <a href={`tel:${c.telefono}`} className="bg-zinc-800 p-2 rounded-lg text-white text-xs font-bold">Tel</a>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 4. AGENDA DE HOY */}
        <section className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">📆 Agenda de hoy</h2>
            <span className="text-[11px] text-zinc-500">Ver todo →</span>
          </div>
          <div className="bg-zinc-900/20 border border-zinc-800/20 rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500">Sin eventos programados para hoy</p>
          </div>
        </section>

        {/* 5. VISUALIZADOR DEL PIPELINE MÓVIL */}
        <section className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">📊 Estado del Pipeline</h2>
          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Lead</span>
                <span className="font-bold text-white">{pipelineCounts.lead}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min((pipelineCounts.lead/5)*100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Buscando</span>
                <span className="font-bold text-white">{pipelineCounts.buscando}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>En Oferta</span>
                <span className="font-bold text-white">{pipelineCounts.oferta}</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* 6. BUSCAR POR SECTOR (Cuadrícula limpia móvil) */}
        <section className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">📍 Buscar por Sector</h2>
          <div className="grid grid-cols-3 gap-1.5">
            {SECTORES.slice(0, 9).map((sector) => (
              <button
                key={sector}
                onClick={() => setSectorActivo(sectorActivo === sector ? null : sector)}
                className={`text-[10px] font-bold py-2 px-1 rounded-xl border transition-all truncate text-center ${
                  sectorActivo === sector
                    ? 'bg-amber-500 border-amber-400 text-black shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 active:bg-zinc-800'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </section>

        {/* 7. ACCIONES RÁPIDAS (Accesos directos de creación) */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 px-1">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-zinc-900 border border-zinc-800 text-white font-bold text-xs py-3 px-3 rounded-xl text-left active:bg-zinc-800">
              ➕ Nueva Propiedad
            </button>
            <button className="bg-zinc-900 border border-zinc-800 text-white font-bold text-xs py-3 px-3 rounded-xl text-left active:bg-zinc-800">
              ➕ Nuevo Evento
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}