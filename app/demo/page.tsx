'use client'
import { useState } from 'react'
import Link from 'next/link'

const CLIENTES_DEMO = [
  { id: '1', nombre: 'Carlos Medina', email: 'c.medina@gmail.com', etapa: 'ACTIVO', presupuesto_min: '250000', presupuesto_max: '350000', proxima_accion: 'Llamar el lunes' },
  { id: '2', nombre: 'Maria Santos', email: 'msantos@email.com', etapa: 'NUEVO', presupuesto_min: '500000', presupuesto_max: '800000', proxima_accion: 'Agendar visita Cap Cana' },
  { id: '3', nombre: 'Roberto Familia', email: 'r.familia@empresa.com', etapa: 'ESTANCADO', presupuesto_min: '150000', presupuesto_max: '200000', proxima_accion: 'Seguimiento pendiente' },
  { id: '4', nombre: 'Ana Guerrero', email: 'ana.g@hotmail.com', etapa: 'ACTIVO', presupuesto_min: '1000000', presupuesto_max: '2000000', proxima_accion: 'Enviar ficha Penthouse' },
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
const BANCOS = [
  { nombre: 'BanReservas', tasa: 9.95 },
  { nombre: 'Popular', tasa: 10.50 },
  { nombre: 'BHD León', tasa: 10.25 },
]

type Tab = 'dashboard' | 'clientes' | 'propiedades' | 'pipeline' | 'calculadora' | 'ai'

const NAV: { key: Tab, label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'propiedades', label: 'Propiedades' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'calculadora', label: 'Calculadora' },
  { key: 'ai', label: '✦ AI' },
]

export default function DemoPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [precio, setPrecio] = useState('250000')
  const [inicial, setInicial] = useState('20')
  const [plazo, setPlazo] = useState('20')
  const [bancoIdx, setBancoIdx] = useState(0)

  const precioNum = parseFloat(precio) || 0
  const inicialPct = parseFloat(inicial) || 20
  const plazoNum = parseInt(plazo) || 20
  const tasa = BANCOS[bancoIdx].tasa
  const montoInicial = precioNum * (inicialPct / 100)
  const montoFinanciado = precioNum - montoInicial
  const tasaMensual = tasa / 100 / 12
  const numPagos = plazoNum * 12
  const cuotaMensual = tasaMensual > 0 && montoFinanciado > 0
    ? montoFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / (Math.pow(1 + tasaMensual, numPagos) - 1)
    : 0
  const fmt = (n: number) => n > 0 ? 'US$ ' + Math.round(n).toLocaleString() : '-'

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-white">
      <aside className="hidden md:flex w-56 border-r border-zinc-900 bg-black/40 flex-col justify-between p-5 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-base font-black tracking-tighter">SEC<span className="text-[#CCFF00]">TOR</span></span>
            <span className="text-[9px] font-mono bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 px-2 py-0.5 rounded-full">DEMO</span>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider w-full transition-all " + (tab === key ? 'bg-[#CCFF00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40')}>
                {label}
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
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Visión General</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Dashboard</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Propiedades', value: '7', color: 'text-white' },
                  { label: 'Clientes', value: '4', color: 'text-[#CCFF00]' },
                  { label: 'Deals Activos', value: '4', color: 'text-white' },
                  { label: 'Volumen', value: 'US$ 7.1M', color: 'text-white' },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
                    <p className="text-xs font-mono text-zinc-500 uppercase">{s.label}</p>
                    <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
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
                      <th className="p-4">Próxima Acción</th>
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
                  <div key={p.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all">
                    <img src={p.imagen} alt={p.titulo} className="w-full h-48 object-cover" />
                    <div className="p-5 space-y-3">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">{p.sector}</div>
                      <div className="font-bold text-white">{p.titulo}</div>
                      <div className="text-[#CCFF00] font-black font-mono">US$ {Number(p.precio).toLocaleString()}</div>
                      <div className="flex gap-4 text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                        <span>{p.recamaras} rec</span>
                        <span>{p.banos} baños</span>
                        <span>{p.metros_cuadrados} m²</span>
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
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Negociación</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Pipeline Visual</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ETAPAS.map(etapa => {
                  const etapaDeals = DEALS_DEMO.filter(d => d.etapa === etapa)
                  const total = etapaDeals.reduce((s, d) => s + d.precio, 0)
                  return (
                    <div key={etapa} className="bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/50 min-h-[280px]">
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

          {tab === 'calculadora' && (
            <div className="space-y-6">
              <div>
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Herramientas</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Calculadora de Hipoteca</h1>
                <p className="text-zinc-500 text-sm mt-1">Tasas reales de bancos de República Dominicana</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Precio de la Propiedad (USD)</label>
                    <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-lg font-black rounded-xl px-4 py-3 mt-2 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Inicial: {inicial}%</label>
                    <input type="range" min="10" max="50" step="5" value={inicial} onChange={e => setInicial(e.target.value)} className="w-full mt-2 accent-[#CCFF00]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Plazo: {plazo} años</label>
                    <input type="range" min="5" max="30" step="5" value={plazo} onChange={e => setPlazo(e.target.value)} className="w-full mt-2 accent-[#CCFF00]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">Banco</label>
                    <select value={bancoIdx} onChange={e => setBancoIdx(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-3 mt-2 outline-none">
                      {BANCOS.map((b, i) => <option key={i} value={i}>{b.nombre} — {b.tasa}%</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-[#CCFF00]/20 rounded-2xl p-6 space-y-5">
                  <h2 className="text-xs font-mono text-[#CCFF00] uppercase">Resultado</h2>
                  <div className="text-center py-4">
                    <p className="text-xs font-mono text-zinc-500 uppercase mb-2">Cuota Mensual Estimada</p>
                    <p className="text-5xl font-black text-[#CCFF00] font-mono">{fmt(cuotaMensual)}</p>
                    <p className="text-xs text-zinc-500 mt-2">por {numPagos} meses</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">Financiado</p>
                      <p className="text-sm font-black text-white mt-1">{fmt(montoFinanciado)}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">Tasa Anual</p>
                      <p className="text-sm font-black text-white mt-1">{tasa}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div className="space-y-6">
              <div>
                <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia Artificial</span>
                <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Asistente AI</h1>
                <p className="text-zinc-500 text-sm mt-1">La función que ningún competidor en RD tiene</p>
              </div>
              <div className="bg-zinc-950 border border-[#CCFF00]/20 rounded-2xl p-6 space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Deal Analizado</p>
                  <p className="text-white font-bold">Maria Santos — Villa Cap Cana</p>
                  <p className="text-[#CCFF00] font-black font-mono">US$ 1,800,000 · Etapa: Negociación</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-mono text-[#CCFF00] uppercase">✦ Próximo Paso Recomendado</p>
                  <p className="text-sm text-white leading-relaxed">Programar una visita presencial a la Villa Cap Cana esta semana. El cliente ha mostrado interés consistente y el precio está dentro de su rango. Es el momento de cerrar.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-mono text-[#CCFF00] uppercase">✦ Mensaje WhatsApp Listo para Enviar</p>
                  <p className="text-sm text-zinc-200 leading-relaxed italic">"Hola Maria, ¿cómo estás? Quería coordinar contigo para que puedas conocer la Villa de Cap Cana esta semana. Creo que cuando la veas en persona, vas a enamorarte. ¿Cuándo tienes disponibilidad?"</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-2">→ En la versión real, este mensaje se genera con IA en tiempo real basado en el historial del cliente</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-mono text-[#CCFF00] uppercase">✦ Análisis del Deal</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">Probabilidad de cierre: Alta. El cliente tiene presupuesto confirmado y lleva 3 semanas en negociación. Riesgo principal: demora en visita presencial podría enfriar el interés.</p>
                </div>
              </div>
              <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl p-6 text-center space-y-3">
                <p className="text-[#CCFF00] font-black">Esta función está disponible en todos los planes de SECTOR.</p>
                <p className="text-zinc-400 text-sm">Crea tu cuenta y úsala con tus deals reales.</p>
                <Link href="/register" className="inline-block bg-[#CCFF00] text-black font-black text-sm rounded-xl px-8 py-3 hover:bg-[#b8e600] transition-colors">
                  Crear Cuenta Gratis
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
