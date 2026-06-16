'use client'
import { useState } from 'react'

const BANCOS_RD = [
  { nombre: 'BanReservas', tasa: 9.95 },
  { nombre: 'Popular', tasa: 10.50 },
  { nombre: 'BHD León', tasa: 10.25 },
  { nombre: 'Scotiabank', tasa: 10.75 },
  { nombre: 'Asociación Popular', tasa: 9.75 },
  { nombre: 'Asociación La Nacional', tasa: 9.50 },
  { nombre: 'Banco Santa Cruz', tasa: 10.00 },
  { nombre: 'Personalizada', tasa: 0 },
]

export default function CalculadoraPage() {
  const [precio, setPrecio] = useState('')
  const [inicial, setInicial] = useState('20')
  const [plazo, setPlazo] = useState('20')
  const [bancoIdx, setBancoIdx] = useState(0)
  const [tasaCustom, setTasaCustom] = useState('')

  const precioNum = parseFloat(precio) || 0
  const inicialPct = parseFloat(inicial) || 20
  const plazoNum = parseInt(plazo) || 20
  const tasa = bancoIdx === BANCOS_RD.length - 1
    ? parseFloat(tasaCustom) || 0
    : BANCOS_RD[bancoIdx].tasa

  const montoInicial = precioNum * (inicialPct / 100)
  const montoFinanciado = precioNum - montoInicial
  const tasaMensual = tasa / 100 / 12
  const numPagos = plazoNum * 12

  const cuotaMensual = tasaMensual > 0 && montoFinanciado > 0
    ? montoFinanciado * (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / (Math.pow(1 + tasaMensual, numPagos) - 1)
    : 0

  const totalPagar = cuotaMensual * numPagos
  const totalIntereses = totalPagar - montoFinanciado

  const fmt = (n: number) => n > 0 ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) : '-'

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6">
        <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Herramientas</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Calculadora de Hipoteca</h1>
        <p className="text-white text-sm mt-1">Tasas reales de bancos de República Dominicana</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-mono text-white uppercase tracking-wider">Parámetros</h2>

            <div>
              <label className="text-[10px] font-mono text-white uppercase tracking-wider">Precio de la Propiedad (USD)</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                placeholder="Ej. 250000"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-lg font-black rounded-xl px-4 py-3 mt-2 outline-none placeholder-zinc-700" />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white uppercase tracking-wider">Inicial: {inicial}%</label>
              <input type="range" min="10" max="50" step="5" value={inicial} onChange={e => setInicial(e.target.value)}
                className="w-full mt-2 accent-[#CCFF00]" />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                <span>10%</span><span>50%</span>
              </div>
              {precioNum > 0 && (
                <p className="text-xs text-white mt-1">Inicial: <span className="text-[#CCFF00] font-black">{fmt(montoInicial)}</span> — Financiado: <span className="text-white font-black">{fmt(montoFinanciado)}</span></p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-mono text-white uppercase tracking-wider">Plazo: {plazo} años</label>
              <input type="range" min="5" max="30" step="5" value={plazo} onChange={e => setPlazo(e.target.value)}
                className="w-full mt-2 accent-[#CCFF00]" />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                <span>5 años</span><span>30 años</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-white uppercase tracking-wider">Banco / Tasa de Interés</label>
              <select value={bancoIdx} onChange={e => setBancoIdx(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 mt-2 outline-none">
                {BANCOS_RD.map((b, i) => (
                  <option key={i} value={i}>
                    {b.nombre}{b.tasa > 0 ? ` — ${b.tasa}%` : ''}
                  </option>
                ))}
              </select>
              {bancoIdx === BANCOS_RD.length - 1 && (
                <input type="number" value={tasaCustom} onChange={e => setTasaCustom(e.target.value)}
                  placeholder="Ej. 10.5" step="0.25"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 mt-2 outline-none placeholder-zinc-700" />
              )}
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-[#CCFF00]/20 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-mono text-[#CCFF00] uppercase tracking-wider">Resultado</h2>

            <div className="text-center py-4">
              <p className="text-xs font-mono text-white uppercase mb-2">Cuota Mensual Estimada</p>
              <p className="text-5xl font-black text-[#CCFF00] font-mono">{fmt(cuotaMensual)}</p>
              <p className="text-xs text-zinc-500 mt-2 font-mono">por {numPagos} meses</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-[10px] font-mono text-white uppercase">Monto Financiado</p>
                <p className="text-lg font-black text-white mt-1">{fmt(montoFinanciado)}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-[10px] font-mono text-white uppercase">Total Intereses</p>
                <p className="text-lg font-black text-red-400 mt-1">{fmt(totalIntereses)}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-[10px] font-mono text-white uppercase">Total a Pagar</p>
                <p className="text-lg font-black text-white mt-1">{fmt(totalPagar)}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-[10px] font-mono text-white uppercase">Tasa Anual</p>
                <p className="text-lg font-black text-white mt-1">{tasa > 0 ? tasa + '%' : '-'}</p>
              </div>
            </div>

            {cuotaMensual > 0 && (
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <p className="text-[10px] font-mono text-white uppercase mb-2">Banco Seleccionado</p>
                <p className="text-sm font-bold text-white">{BANCOS_RD[bancoIdx].nombre}</p>
                <p className="text-[11px] text-zinc-500 mt-1">Tasa: {tasa}% anual · Plazo: {plazo} años · Inicial: {inicial}%</p>
              </div>
            )}
          </div>

          <p className="text-[10px] text-zinc-600 font-mono text-center px-4">
            * Cálculo estimado. Las tasas pueden variar. Consulta directamente con el banco para condiciones exactas.
          </p>
        </div>
      </div>
    </div>
  )
}
