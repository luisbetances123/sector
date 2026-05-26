'use client'
import { useState } from 'react'
import Link from 'next/link'

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

  return (
    <div className="md:hidden min-h-screen bg-[#080808] text-white pb-24">

      {/* Cabecera Móvil - Añadimos pt-16 para empujar el contenido abajo y evitar que lo tape el botón flotante global */}
      <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-sm px-4 pt-16 pb-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-zinc-500 text-xs">{saludo}</p>
            <h1 className="text-white font-black text-2xl tracking-tight">HOMVI</h1>
          </div>
          
          {/* Indicador de urgencia reubicado de forma segura a la derecha */}
          {leads.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 shrink-0">
              <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse block text-center">
                {leads.length} URGENTE{leads.length > 1 ? 'S' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">

        {/* LEADS - Tarjetas fijas y directas sin Swipe */}
        {leads.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Leads urgentes</h2>
              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{leads.length}</span>
            </div>
            
            <div className="space-y-3">
              {leads.slice(0, 5).map((c: any) => (
                <div key={c.id} className="rounded-2xl bg-zinc-900 border border-red-900/40 p-4">
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-lg shrink-0">
                      {c.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-base truncate">{c.nombre}</p>
                      <p className="text-zinc-400 text-xs truncate">{c.email}</p>
                    </div>
                  </div>

                  {/* Botones de acción directos */}
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 bg-green-600 active:bg-green-500 text-white font-black py-4 rounded-xl text-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      💬 WhatsApp
                    </a>

                    <a
                      href={`tel:${c.telefono}`}
                      className="flex items-center justify-center gap-2 bg-zinc-700 active:bg-zinc-600 text-white font-black py-4 rounded-xl text-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📞 Llamar
                    </a>
                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* FANTASMAS - Corregido para evitar solapamientos */}
        {fantasmas.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-base mb-0.5">👻</span>
                <div className="flex flex-col">
                  <h2 className="text-white font-black text-sm uppercase tracking-widest">Fantasmas</h2>
                  <span className="text-[10px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 mt-1 w-max">
                    {fantasmas.length} sin contacto +7 días
                  </span>
                </div>
              </div>
              
              <Link 
                href="/clients?filter=fantasmas" 
                className="text-zinc-500 active:text-zinc-300 text-xs font-bold py-1 pl-4 shrink-0"
              >
                Ver todos →
              </Link>
            </div>

            <div className="space-y-2">
              {fantasmas.slice(0, 3).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between bg-red-950/30 border border-red-900/40 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                      {c.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{c.nombre}</p>
                      <p className="text-red-400 text-xs">+7 días sin contacto</p>
                    </div>
                  </div>
                  
                  <a
                    href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`}
                    target="_blank"
                    className="bg-green-600 text-white font-black px-4 py-3 rounded-xl text-xs"
                  >
                    WA
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MATCHES */}
        {propiedadesMatch.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span>🔥</span>
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Matches</h2>
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">{propiedadesMatch.length}</span>
            </div>
            <div className="space-y-3">
              {propiedadesMatch.slice(0, 3).map((item: any) => (
                <div key={item.cliente.id} className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-black">
                      {item.cliente.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.cliente.nombre}</p>
                      <p className="text-amber-400 text-xs">{item.matches.length} propiedad{item.matches.length > 1 ? 'es' : ''} compatible{item.matches.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <Link
                    href="/clients"
                    className="flex items-center justify-center gap-2 w-full bg-amber-500 active:bg-amber-400 text-black font-black py-4 rounded-xl text-sm"
                  >
                    Ver matches →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTORES */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span>📍</span>
            <h2 className="text-white font-black text-sm uppercase tracking-widest">Sectores</h2>
            {sectorActivo && (
              <button onClick={() => setSectorActivo(null)} className="ml-auto text-zinc-500 text-xs">Limpiar</button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {SECTORES.map(s => (
              <button
                key={s}
                onClick={() => setSectorActivo(sectorActivo === s ? null : s)}
                className={`shrink-0 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  sectorActivo === s
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {sectorActivo && (
            <div className="mt-3 space-y-2">
              {propsFiltradas.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-3">
                  {p.image_url ? (
                    <img src={p.image_url} className="w-14 h-14 rounded-xl object-cover shrink-0" alt={p.title} />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl shrink-0">🏠</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{p.title}</p>
                    <p className="text-amber-400 text-xs font-bold">{formatPrice(p.price, p.moneda)}</p>
                    <p className="text-zinc-500 text-xs">{p.sector}</p>
                  </div>
                </div>
              ))}
              {propsFiltradas.length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-4">Sin propiedades en {sectorActivo}</p>
              )}
            </div>
          )}
        </section>

        {/* AGENDA HOY */}
        {followups.filter((f: any) => {
          const hoy = new Date().toDateString()
          return new Date(f.fecha).toDateString() === hoy && !f.completado
        }).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span>📅</span>
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Agenda hoy</h2>
            </div>
            <div className="space-y-2">
              {followups.filter((f: any) => {
                const hoy = new Date().toDateString()
                return new Date(f.fecha).toDateString() === hoy && !f.completado
              }).map((f: any) => {
                const cliente = clientes.find((c: any) => c.id === f.cliente_id)
                return (
                  <div key={f.id} className="flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 py-3">
                    <div className="text-xl">{f.tipo === 'llamada' ? '📞' : f.tipo === 'visita' ? '🏠' : '📋'}</div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{cliente?.nombre || 'Cliente'}</p>
                      <p className="text-zinc-400 text-xs capitalize">{f.tipo} · {formatFecha(f.fecha)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}