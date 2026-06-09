'use client'
import { useState } from 'react'
import Link from 'next/link'

const CLIENTES_DEMO = [
  { id: '1', nombre: 'Carlos Medina', email: 'c.medina@gmail.com', telefono: '8091234567', etapa: 'ACTIVO', presupuesto_min: '250000', presupuesto_max: '350000', proxima_accion: 'Llamar el lunes' },
  { id: '2', nombre: 'Maria Santos', email: 'msantos@email.com', telefono: '8097654321', etapa: 'NUEVO', presupuesto_min: '500000', presupuesto_max: '800000', proxima_accion: 'Agendar visita Cap Cana' },
  { id: '3', nombre: 'Roberto Familia', email: 'r.familia@empresa.com', telefono: '8093456789', etapa: 'ESTANCADO', presupuesto_min: '150000', presupuesto_max: '200000', proxima_accion: 'Seguimiento pendiente' },
  { id: '4', nombre: 'Ana Guerrero', email: 'ana.g@hotmail.com', telefono: '8096543210', etapa: 'ACTIVO', presupuesto_min: '1000000', presupuesto_max: '2000000', proxima_accion: 'Enviar ficha Penthouse' },
]

const PROPIEDADES_DEMO = [
  { id: '1', titulo: 'Penthouse Evaristo Morales', precio: '4250000', sector: 'Evaristo Morales, SD', recamaras: '5', banos: '4', metros_cuadrados: '480', imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
  { id: '2', titulo: 'Villa Cap Cana Golf View', precio: '1800000', sector: 'Cap Cana, Punta Cana', recamaras: '4', banos: '5', metros_cuadrados: '620', imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
  { id: '3', titulo: 'Apartamento Naco 3BR', precio: '320000', sector: 'Naco, Santo Domingo', recamaras: '3', banos: '2', metros_cuadrados: '180', imagen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800' },
]

const DEALS_DEMO = [
  { id: '1', nombre_cliente: 'Carlos Medina', propiedad: 'Apto Naco 3BR', precio: 320000, etapa: 'Visitas' },
  { id: '2', nombre_cliente: 'Maria Santos', propiedad: 'Villa Cap Cana', precio: 1800000, etapa: 'Negociacion' },
  { id: '3', nombre_cliente: 'Ana Guerrero', propiedad: 'Penthouse Evaristo', precio: 4250000, etapa: 'Prospectos' },
  { id: '4', nombre_cliente: 'Pedro Nunez', propiedad: 'Casa Piantini', precio: 650000, etapa: 'Cierre' },
]

const ETAPAS = ['Prospectos', 'Visitas', 'Negociacion', 'Cierre']

type Tab = 'dashboard' | 'clientes' | 'propiedades' | 'pipeline'

export default function DemoPage() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-white">
      <aside className="hidden md:flex w-64 border-r border-zinc-900 bg-black/40 flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-lg font-black tracking-tighter uppercase">SECTOR</span>
            <span className="text-[9px] font-mono bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 px-2 py-0.5 rounded-full">DEMO</span>
          </div>
          <nav className="space-y-1.5">
            {(['dashboard', 'clientes', 'propiedades', 'pipeline'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={"flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider w-full transition-all " + (tab === t ? 'bg-[#CCFF00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40')}>
                {t}
              </button>
            ))}
          </nav>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] text-zinc-500 font-mono text-center">Modo demo — datos de ejemplo</p>
          <Link href="/register" className="w-full bg-[#CCFF00] text-black font-black text-xs rounded-xl py-3 hover:bg-[#b8e600] transition-colors block text-center">
            Crear Cuenta Gratis
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {tab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Vision General</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Dashboard</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Propiedades</p>
                  <p className="text-3xl font-black text-white mt-1">7</p>
                </div>
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Clientes</p>
                  <p className="text-3xl font-black text-[#CCFF00] mt-1">4</p>
                </div>
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Deals Activos</p>
                  <p className="text-3xl font-black text-white mt-1">4</p>
                </div>
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
                  <p className="text-xs font-mono text-zinc-500 uppercase">Volumen</p>
                  <p className="text-2xl font-black text-white mt-1">US$ 7.1M</p>
                </div>
              </div>
              <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl p-6 text-center space-y-3">
                <p className="text-[#CCFF00] font-black text-lg">Esta es una demo con datos de ejemplo.</p>
                <p className="text-zinc-400 text-sm">Crea tu cuenta gratis y empieza a usar SECTOR con tus propios clientes y propiedades.</p>
                <Link href="/register" className="inline-block bg-[#CCFF00] text-black font-black text-sm rounded-xl px-8 py-3 hover:bg-[#b8e600] transition-colors">
                  Crear Cuenta Gratis — Sin tarjeta
                </Link>
              </div>
            </div>
          )}

          {tab === 'clientes' && (
            <div className="space-y-6">
              <div>
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Base de Datos</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Clientes</h1>
              </div>
              <div className="bg-zinc-950/40 rounded-2xl border border-zinc-900/50 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Cliente</th>
                      <th className="p-4">Presupuesto</th>
                      <th className="p-4">Etapa</th>
                      <th className="p-4">Proxima Accion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/40 text-xs">
                    {CLIENTES_DEMO.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-bold text-white">{c.nombre}</div>
                          <div className="text-zinc-500 font-mono text-[11px]">{c.email}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-[#CCFF00] font-black font-mono text-xs">
                            US$ {Number(c.presupuesto_min).toLocaleString()} - {Number(c.presupuesto_max).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={"inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border " + (c.etapa === 'NUEVO' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20' : c.etapa === 'ESTANCADO' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-900 text-zinc-400 border-zinc-800')}>
                            {c.etapa}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400 text-[11px]">{c.proxima_accion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'propiedades' && (
            <div className="space-y-6">
              <div>
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inventario</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Propiedades</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROPIEDADES_DEMO.map(p => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
                    <img src={p.imagen} alt={p.titulo} className="w-full h-48 object-cover" />
                    <div className="p-5 space-y-3">
                      <div className="text-xs font-mono text-zinc-500 uppercase">{p.sector}</div>
                      <div className="font-bold text-white">{p.titulo}</div>
                      <div className="text-[#CCFF00] font-black font-mono">US$ {Number(p.precio).toLocaleString()}</div>
                      <div className="flex gap-4 text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                        <span>{p.recamaras} rec</span>
                        <span>{p.banos} ban</span>
                        <span>{p.metros_cuadrados} m2</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'pipeline' && (
            <div className="space-y-6">
              <div>
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Negociacion</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Pipeline Visual</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ETAPAS.map(etapa => {
                  const etapaDeals = DEALS_DEMO.filter(d => d.etapa === etapa)
                  const total = etapaDeals.reduce((s, d) => s + d.precio, 0)
                  return (
                    <div key={etapa} className="bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/50 min-h-[300px]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-mono font-black text-zinc-400 uppercase">{etapa}</h3>
                        <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-white">US$ {total.toLocaleString()}</span>
                      </div>
                      <div className="space-y-3">
                        {etapaDeals.map(deal => (
                          <div key={deal.id} className="border border-zinc-800 bg-zinc-950 p-4 rounded-xl">
                            <div className="font-bold text-white text-xs">{deal.nombre_cliente}</div>
                            <div className="text-zinc-500 text-[11px] mt-0.5">{deal.propiedad}</div>
                            <div className="text-[#CCFF00] font-black text-sm mt-2">US$ {deal.precio.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
