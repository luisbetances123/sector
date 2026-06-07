'use client'
import React from 'react'

interface DashboardMobileProps {
  leads: any[]
  fantasmas: any[]
  sinContactar: any[]
  propiedadesMatch: any[]
  followups: any[]
  contactos: any[]
  clientes: any[]
  SECTORES: string[]
  calcularMatch: (cliente: any, propiedad: any) => number
  properties: any[]
  formatPrice: (p: string, m?: string) => string
  formatFecha: (f: string) => string
  diasSinContacto: (cts: any[], cid: string) => number | null
  currentView: string  
  setView: (view: string) => void 
}

export default function DashboardMobile({
  leads,
  fantasmas,
  sinContactar,
  propiedadesMatch,
  followups,
  contactos,
  clientes,
  SECTORES,
  calcularMatch,
  properties,
  formatPrice,
  formatFecha,
  diasSinContacto,
  currentView,
  setView
}: DashboardMobileProps) {

  // 📱 Renderizado dinámico según la pestaña activa
  const renderContent = () => {
    switch (currentView) {
      case 'clientes':
        return (
          <div className="p-4 text-white animate-fadeIn">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">👥 Lista de Clientes</h2>
            <div className="flex flex-col gap-3">
              {clientes.length === 0 ? (
                <p className="text-zinc-500 text-sm">No hay clientes registrados.</p>
              ) : (
                clientes.map(c => (
                  <div key={c.id} className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-base text-white">{c.nombre}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{c.telefono || 'Sin número registrado'}</p>
                      <span className="inline-block text-[10px] px-2 py-0.5 bg-zinc-850 text-amber-400 font-black rounded-md mt-2 uppercase tracking-wider">
                        {c.etapa}
                      </span>
                    </div>
                    {c.telefono && (
                      <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="bg-green-600 text-white p-2.5 rounded-xl text-sm">
                        💬
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      
      case 'propiedades':
        return (
          <div className="p-4 text-white animate-fadeIn">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">🏢 Inventario de Propiedades</h2>
            <div className="flex flex-col gap-3">
              {properties.length === 0 ? (
                <p className="text-zinc-500 text-sm">No hay propiedades disponibles.</p>
              ) : (
                properties.map(p => (
                  <div key={p.id} className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl">
                    <p className="font-bold text-base text-white truncate">{p.title}</p>
                    <p className="text-amber-500 font-mono font-black text-sm mt-1">{formatPrice(p.price, p.currency)}</p>
                    <p className="text-zinc-400 text-xs mt-1.5 flex items-center gap-1">
                      <span>📍</span> <span className="truncate">{p.sector || 'Sector no especificado'}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case 'pipeline':
        return (
          <div className="p-4 text-white animate-fadeIn">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">📊 Pipeline de Ventas</h2>
            <p className="text-zinc-400 text-sm mb-6">Estado operacional de los flujos de trabajo activos.</p>
            
            <div className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl">
              {['Lead', 'Buscando', 'En Oferta', 'Cierre'].map(etapa => {
                const totalEtapa = clientes.filter(c => c.etapa === etapa).length
                const maxEtapa = Math.max(...['Lead', 'Buscando', 'En Oferta', 'Cierre'].map(e => clientes.filter(c => c.etapa === e).length), 1)
                return (
                  <div key={etapa}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-zinc-400 text-xs font-black uppercase tracking-wider">{etapa}</span>
                      <span className="text-white font-black text-sm">{totalEtapa}</span>
                    </div>
                    <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          etapa === 'Lead' ? 'bg-zinc-500' : etapa === 'Buscando' ? 'bg-blue-500' : etapa === 'En Oferta' ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(totalEtapa / maxEtapa) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'alertas':
        return (
          <div className="p-4 text-white animate-fadeIn">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">⚠️ Alertas del Sistema</h2>
            
            <div className="flex flex-col gap-3">
              {fantasmas.length === 0 && sinContactar.length === 0 && leads.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl text-center">
                  <span className="text-3xl">🎉</span>
                  <p className="text-zinc-400 text-sm font-bold mt-2">¡Todo al día! No tienes alertas pendientes.</p>
                </div>
              ) : (
                <>
                  {leads.map(l => (
                    <div key={l.id} className="bg-red-950/30 border border-red-900/60 p-4 rounded-2xl">
                      <p className="text-red-400 text-xs font-black uppercase tracking-wider">🔴 LEAD SIN RESPONDER</p>
                      <p className="text-white font-bold text-base mt-1">{l.nombre}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{l.telefono || 'Sin teléfono'}</p>
                    </div>
                  ))}

                  {fantasmas.map(f => (
                    <div key={f.id} className="bg-zinc-900/80 border border-red-900/40 p-4 rounded-2xl">
                      <p className="text-red-400 text-xs font-black uppercase tracking-wider">👻 CLIENTE FANTASMA</p>
                      <p className="text-white font-bold text-base mt-1">{f.nombre}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Más de 7 días sin contacto directo</p>
                    </div>
                  ))}

                  {sinContactar.map(s => (
                    <div key={s.id} className="bg-orange-950/20 border border-orange-900/40 p-4 rounded-2xl">
                      <p className="text-orange-400 text-xs font-black uppercase tracking-wider">⏳ DESATENDIDO</p>
                      <p className="text-white font-bold text-base mt-1">{s.nombre}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Requiere seguimiento de rutina</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )

      case 'dashboard':
      default:
        return (
          <div className="p-4 animate-fadeIn">
            {/* ── HEADER GIGANTE ── */}
            <div className="mb-6">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-black">BUENOS DÍAS, LUIS 👋</p>
              <h1 className="text-4xl font-black text-white tracking-tighter mt-0.5">SECTOR<br/>CENTER</h1>
            </div>

            {/* ── BLOQUES DEL DASHBOARD INTERACTIVOS GIGANTES ── */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setView('clientes')} className="bg-zinc-900/90 border-2 border-zinc-800 text-left p-5 rounded-3xl active:scale-95 transition-transform focus:outline-none">
                <p className="text-zinc-500 text-xs uppercase font-black tracking-wider">👥 Clientes</p>
                <p className="text-4xl font-black text-white mt-1.5">{clientes.length}</p>
              </button>
              
              <button onClick={() => setView('alertas')} className="bg-zinc-900/90 border-2 border-zinc-800 text-left p-5 rounded-3xl active:scale-95 transition-transform focus:outline-none">
                <p className="text-amber-500 text-xs uppercase font-black tracking-wider">🔴 Leads</p>
                <p className="text-4xl font-black text-amber-500 mt-1.5">{leads.length}</p>
              </button>
              
              <button onClick={() => setView('propiedades')} className="bg-zinc-900/90 border-2 border-zinc-800 text-left p-5 rounded-3xl active:scale-95 transition-transform focus:outline-none">
                <p className="text-green-500 text-xs uppercase font-black tracking-wider">🏠 Proped.</p>
                <p className="text-4xl font-black text-green-500 mt-1.5">{properties.length}</p>
              </button>
              
              <button onClick={() => setView('pipeline')} className="bg-zinc-900/90 border-2 border-zinc-800 text-left p-5 rounded-3xl active:scale-95 transition-transform focus:outline-none">
                <p className="text-blue-500 text-xs uppercase font-black tracking-wider">📅 Seguim.</p>
                <p className="text-4xl font-black text-blue-500 mt-1.5">{followups.length}</p>
              </button>
            </div>

            {/* ── SECTORES PRINCIPALES ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-6">
              <h3 className="text-white font-black text-sm uppercase tracking-wide mb-3">📍 Sectores Principales</h3>
              <div className="grid grid-cols-2 gap-2">
                {SECTORES.slice(0, 8).map(s => (
                  <button 
                    key={s} 
                    onClick={() => setView('propiedades')} 
                    className="bg-zinc-950 border border-zinc-800 text-zinc-300 py-3.5 px-2 rounded-2xl font-black text-xs uppercase truncate text-center active:bg-amber-500 active:text-black transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── ACCIONES RÁPIDAS GIGANTES ── */}
            <div className="mb-6">
              <h3 className="text-zinc-500 font-black text-xs uppercase tracking-wider mb-3">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setView('propiedades')} className="bg-amber-500 text-black p-5 rounded-3xl text-left font-black active:scale-95 transition-all focus:outline-none">
                  <span className="text-2xl">🏠</span>
                  <p className="text-sm uppercase font-black mt-3 tracking-wide">+ Propiedad</p>
                </button>
                <button onClick={() => setView('pipeline')} className="bg-zinc-900 border border-zinc-800 text-white p-5 rounded-3xl text-left font-black active:scale-95 transition-all focus:outline-none">
                  <span className="text-2xl">📅</span>
                  <p className="text-sm uppercase font-black mt-3 tracking-wide">+ Evento</p>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32 w-full overflow-x-hidden select-none">
      
      {/* Contenido Dinámico de la SPA */}
      {renderContent()}

      {/* ══ NAVBAR INFERIOR INTEGRAL DE GESTIÓN (SPA ACTIVA) ══ */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/95 border-t border-zinc-900 backdrop-blur-md grid grid-cols-5 items-center justify-center z-50 px-2">
        {[
          { id: 'dashboard', label: 'DASHBOARD', icon: '🏠' },
          { id: 'clientes', label: 'CLIENTES', icon: '👥' },
          { id: 'propiedades', label: 'PROPIEDADES', icon: '🏢' },
          { id: 'pipeline', label: 'PIPELINE', icon: '📊' },
          { id: 'alertas', label: 'ALERTAS', icon: '🔔' },
        ].map(item => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)} 
              className="flex flex-col items-center justify-center h-full transition-all active:scale-90 focus:outline-none"
            >
              <span className={`text-xl mb-0.5 transition-transform ${isActive ? 'scale-110' : 'opacity-50'}`}>
                {item.icon}
              </span>
              <span className={`text-[8px] font-black tracking-tighter uppercase transition-colors ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}