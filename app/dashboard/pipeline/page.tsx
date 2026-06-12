'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Deal {
  id: string
  cliente_id: string | null
  nombre_cliente: string
  propiedad: string
  precio: number
  etapa: string
  notas: string
  telefono: string
  email: string
  created_at: string
  updated_at: string
}

const ETAPAS = ['Interesado', 'Separacion', 'En Cuotas', 'Pre-entrega', 'Entregado']

const ETAPA_COLORS: Record<string, string> = {
  'Interesado': '#4da6ff',
  'Separacion': '#CCFF00',
  'En Cuotas': '#ff9900',
  'Pre-entrega': '#cc66ff',
  'Entregado': '#00ff99',
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<{proximo_paso: string, mensaje_whatsapp: string, analisis: string} | null>(null)
  const [newDeal, setNewDeal] = useState({
    nombre_cliente: '', propiedad: '', precio: '', etapa: 'Interesado', telefono: '', email: '', notas: '',
    proyecto: '', unidad: '', proximo_pago_fecha: '', proximo_pago_monto: ''
  })

  useEffect(() => { fetchDeals() }, [])

  async function fetchDeals() {
    const { data, error } = await supabase.from('pipeline_deals').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setDeals(data || [])
    setLoading(false)
  }

  async function createDeal() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('pipeline_deals').insert([{
      nombre_cliente: newDeal.nombre_cliente,
      propiedad: newDeal.propiedad,
      precio: Number(newDeal.precio) || 0,
      etapa: newDeal.etapa,
      telefono: newDeal.telefono,
      email: newDeal.email,
      notas: newDeal.notas,
      user_id: user?.id
    }])
    if (!error) {
      setNewDeal({ nombre_cliente: '', propiedad: '', precio: '', etapa: 'Interesado', telefono: '', email: '', notas: '', proyecto: '', unidad: '', proximo_pago_fecha: '', proximo_pago_monto: '' })
      setShowForm(false)
      fetchDeals()
    }
    setSaving(false)
  }

  async function moveDeal(dealId: string, currentEtapa: string, direction: 'forward' | 'backward') {
    const idx = ETAPAS.indexOf(currentEtapa)
    const nextIdx = direction === 'forward' ? idx + 1 : idx - 1
    if (nextIdx < 0 || nextIdx >= ETAPAS.length) return
    await supabase.from('pipeline_deals').update({ etapa: ETAPAS[nextIdx], updated_at: new Date().toISOString() }).eq('id', dealId)
    fetchDeals()
  }

  async function updateDeal(deal: Deal) {
    await supabase.from('pipeline_deals').update({
      nombre_cliente: deal.nombre_cliente, propiedad: deal.propiedad, precio: deal.precio,
      notas: deal.notas, telefono: deal.telefono, email: deal.email, updated_at: new Date().toISOString()
    }).eq('id', deal.id)
    fetchDeals()
    setSelectedDeal(null)
    setAiResult(null)
  }

  async function deleteDeal(id: string) {
    await supabase.from('pipeline_deals').delete().eq('id', id)
    fetchDeals()
  }

  async function analizarConAI(deal: Deal) {
    setAiLoading(true)
    setAiResult(null)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Eres un asistente experto en ventas inmobiliarias de preventa en República Dominicana. Analiza este deal y responde SOLO en JSON sin markdown:

Deal:
- Cliente: ${deal.nombre_cliente}
- Proyecto/Propiedad: ${deal.propiedad}
- Precio: US$ ${deal.precio.toLocaleString()}
- Etapa actual: ${deal.etapa}
- Notas: ${deal.notas || 'Sin notas'}
- Teléfono: ${deal.telefono || 'No disponible'}

Etapas del pipeline de preventa: Interesado → Separacion → En Cuotas → Pre-entrega → Entregado

Responde SOLO con este JSON exacto:
{
  "proximo_paso": "Una acción concreta y específica para avanzar este deal en el contexto de preventa (máximo 2 oraciones)",
  "mensaje_whatsapp": "Mensaje listo para enviar al cliente por WhatsApp, natural y profesional en español dominicano considerando la etapa de preventa (máximo 3 oraciones)",
  "analisis": "Análisis breve del deal: probabilidad de cierre y riesgo principal considerando que es una venta en preventa (máximo 2 oraciones)"
}`
          }]
        })
      })
      const data = await response.json()
      if (!data.content || !data.content[0]) throw new Error('No content in response')
      const text = data.content[0].text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(text)
      setAiResult(parsed)
    } catch (e) {
      console.error(e)
      setAiResult({ proximo_paso: 'Error al analizar.', mensaje_whatsapp: '', analisis: '' })
    }
    setAiLoading(false)
  }

  const totalVolumen = deals.reduce((s, d) => s + (d.precio || 0), 0)
  const totalDeals = deals.length
  const dealsEntregados = deals.filter(d => d.etapa === 'Entregado').length
  const tasaConversion = totalDeals > 0 ? Math.round((dealsEntregados / totalDeals) * 100) : 0
  const maxEtapaDeals = Math.max(...ETAPAS.map(e => deals.filter(d => d.etapa === e).length), 1)

  return (
    <div className="text-zinc-100 font-sans">
      <div className="space-y-8">
        <header className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociacion</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
            <p className="text-xs text-zinc-500 mt-1 font-mono">Mercado de Preventa · República Dominicana</p>
          </div>
          <div className="flex items-end gap-6">
            <div className="text-right">
              <p className="text-xs font-mono text-zinc-500 uppercase">Volumen Total</p>
              <p className="text-2xl font-black text-white">US$ {totalVolumen.toLocaleString()}</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-3 hover:bg-[#b8e600] transition-colors whitespace-nowrap">
              + Nuevo Deal
            </button>
          </div>
        </header>

        {/* ── REPORTE EMBUDO ── */}
        {!loading && deals.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Reporte de Embudo</p>
                <p className="text-lg font-black text-white">{totalDeals} deals activos</p>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Tasa de Cierre</p>
                  <p className="text-2xl font-black" style={{ color: tasaConversion > 0 ? '#00ff99' : '#4da6ff' }}>
                    {tasaConversion}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Entregados</p>
                  <p className="text-2xl font-black text-white">{dealsEntregados}</p>
                </div>
              </div>
            </div>

            {/* Barras por etapa */}
            <div className="space-y-3">
              {ETAPAS.map(etapa => {
                const count = deals.filter(d => d.etapa === etapa).length
                const volumen = deals.filter(d => d.etapa === etapa).reduce((s, d) => s + (d.precio || 0), 0)
                const pct = Math.round((count / maxEtapaDeals) * 100)
                const color = ETAPA_COLORS[etapa]
                return (
                  <div key={etapa} className="flex items-center gap-3">
                    <div className="w-24 text-[10px] font-mono text-zinc-400 text-right shrink-0">{etapa}</div>
                    <div className="flex-1 bg-zinc-900 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                        style={{ width: count > 0 ? `${Math.max(pct, 8)}%` : '0%', background: color }}
                      >
                        {count > 0 && (
                          <span className="text-[9px] font-black text-black whitespace-nowrap">{count}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-28 text-[10px] font-mono text-zinc-500 shrink-0">
                      {volumen > 0 ? `US$ ${volumen.toLocaleString()}` : '—'}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Flecha conversión */}
            <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <span className="text-[#4da6ff]">Interesado</span>
              <span>→→→→</span>
              <span className="text-[#00ff99]">Entregado</span>
              <span className="ml-auto">
                {totalDeals > 0
                  ? `${totalDeals} entraron · ${dealsEntregados} cerraron · ${tasaConversion}% conversión`
                  : 'Sin datos aún'}
              </span>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Nuevo Deal de Preventa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="Nombre del cliente" value={newDeal.nombre_cliente} onChange={e => setNewDeal({...newDeal, nombre_cliente: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Proyecto (ej: Torres Piantini)" value={newDeal.propiedad} onChange={e => setNewDeal({...newDeal, propiedad: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Unidad (ej: Torre A, Piso 5, Apto 501)" value={newDeal.unidad} onChange={e => setNewDeal({...newDeal, unidad: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Precio total (USD)" type="number" value={newDeal.precio} onChange={e => setNewDeal({...newDeal, precio: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Teléfono" value={newDeal.telefono} onChange={e => setNewDeal({...newDeal, telefono: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Email" value={newDeal.email} onChange={e => setNewDeal({...newDeal, email: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Próximo pago (fecha)" type="date" value={newDeal.proximo_pago_fecha} onChange={e => setNewDeal({...newDeal, proximo_pago_fecha: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Monto próximo pago (USD)" type="number" value={newDeal.proximo_pago_monto} onChange={e => setNewDeal({...newDeal, proximo_pago_monto: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <select value={newDeal.etapa} onChange={e => setNewDeal({...newDeal, etapa: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none">
                {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <textarea placeholder="Notas" value={newDeal.notas} onChange={e => setNewDeal({...newDeal, notas: e.target.value})} rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={createDeal} disabled={saving || !newDeal.nombre_cliente}
                className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-6 py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Crear Deal'}
              </button>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 text-xs px-4 py-3">Cancelar</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-zinc-500 text-sm text-center py-20">Cargando pipeline...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ETAPAS.map(etapa => {
              const etapaDeals = deals.filter(d => d.etapa === etapa)
              const etapaTotal = etapaDeals.reduce((s, d) => s + (d.precio || 0), 0)
              const color = ETAPA_COLORS[etapa] || '#CCFF00'
              return (
                <div key={etapa} className="bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/50 flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="w-2 h-2 rounded-full mb-1" style={{ background: color }} />
                      <h3 className="text-xs font-mono font-black uppercase" style={{ color }}>{etapa}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono">{etapaDeals.length} deals</p>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-white">
                      US$ {etapaTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {etapaDeals.map(deal => (
                      <div key={deal.id} onClick={() => { setSelectedDeal(deal); setAiResult(null) }}
                        className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 p-4 rounded-xl cursor-pointer transition-all">
                        <div className="font-bold text-white text-xs">{deal.nombre_cliente}</div>
                        <div className="text-zinc-500 text-[11px] mt-0.5 truncate">{deal.propiedad}</div>
                        <div className="font-black text-sm mt-2" style={{ color }}>${(deal.precio || 0).toLocaleString()}</div>
                        {deal.notas && deal.notas.includes('Próximo pago:') && (
                          <div className="text-[10px] text-orange-400 font-mono mt-1">
                            {deal.notas.split('\n').find(l => l.includes('Próximo pago:'))}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-900" onClick={e => e.stopPropagation()}>
                          <button disabled={etapa === ETAPAS[0]} onClick={() => moveDeal(deal.id, deal.etapa, 'backward')}
                            className="text-[9px] p-1.5 bg-zinc-900 rounded disabled:opacity-20 text-zinc-400 hover:text-white">
                            ← Atrás
                          </button>
                          <button onClick={() => deleteDeal(deal.id)} className="text-[9px] text-red-500 hover:text-red-400">Borrar</button>
                          <button disabled={etapa === ETAPAS[ETAPAS.length-1]} onClick={() => moveDeal(deal.id, deal.etapa, 'forward')}
                            className="text-[9px] p-1.5 bg-zinc-900 rounded disabled:opacity-20 text-zinc-400 hover:text-white">
                            Siguiente →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedDeal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-end" onClick={() => { setSelectedDeal(null); setAiResult(null) }}>
          <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 h-full p-8 flex flex-col gap-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase">Editar Deal</h2>
              <button onClick={() => { setSelectedDeal(null); setAiResult(null) }} className="text-zinc-500 hover:text-white">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Nombre del Cliente</label>
                <input value={selectedDeal.nombre_cliente} onChange={e => setSelectedDeal({...selectedDeal, nombre_cliente: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Proyecto / Unidad</label>
                <input value={selectedDeal.propiedad} onChange={e => setSelectedDeal({...selectedDeal, propiedad: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Precio Total (USD)</label>
                <input type="number" value={selectedDeal.precio} onChange={e => setSelectedDeal({...selectedDeal, precio: Number(e.target.value)})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-[#CCFF00] font-black text-sm rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Teléfono</label>
                <input value={selectedDeal.telefono} onChange={e => setSelectedDeal({...selectedDeal, telefono: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Notas</label>
                <textarea rows={3} value={selectedDeal.notas} onChange={e => setSelectedDeal({...selectedDeal, notas: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-zinc-300 text-xs rounded-xl px-4 py-3 mt-1 outline-none resize-none" />
              </div>
            </div>

            {/* PRÓXIMO PAGO */}
            <div className="bg-zinc-900 border border-orange-500/20 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-mono text-orange-400 uppercase tracking-wider">⏰ Próximo Pago</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Fecha</label>
                  <input type="date"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-400 text-white text-xs rounded-xl px-3 py-2 mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Monto (USD)</label>
                  <input type="number" placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-400 text-orange-400 font-black text-sm rounded-xl px-3 py-2 mt-1 outline-none" />
                </div>
              </div>
            </div>

            {/* CALCULADORA DE COMISIÓN */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Calculadora de Comisión</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Porcentaje %</label>
                  <input type="number" defaultValue="3" min="0" max="100" step="0.5"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-[#CCFF00] text-white text-sm rounded-xl px-3 py-2 mt-1 outline-none"
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value) || 0
                      const result = document.getElementById("comision-result")
                      if (result) result.textContent = "US$ " + ((selectedDeal.precio * pct / 100)).toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})
                    }} />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Tu Comisión</label>
                  <div id="comision-result" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 mt-1 text-[#CCFF00] font-black text-sm font-mono">
                    US$ {Math.round(selectedDeal.precio * 3 / 100).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN AI */}
            <div className="bg-zinc-900 border border-[#CCFF00]/20 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono text-[#CCFF00] uppercase tracking-wider">✦ Asistente AI</h3>
                <button onClick={() => analizarConAI(selectedDeal)} disabled={aiLoading}
                  className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-2 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
                  {aiLoading ? 'Analizando...' : 'Analizar Deal'}
                </button>
              </div>
              {aiLoading && (
                <div className="text-zinc-500 text-xs font-mono animate-pulse text-center py-4">
                  Analizando el deal con AI...
                </div>
              )}
              {aiResult && (
                <div className="space-y-4">
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Próximo Paso</p>
                    <p className="text-sm text-white leading-relaxed">{aiResult.proximo_paso}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">Mensaje WhatsApp</p>
                      <button onClick={() => navigator.clipboard.writeText(aiResult.mensaje_whatsapp)}
                        className="text-[10px] text-[#CCFF00] font-mono hover:underline">Copiar</button>
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed">{aiResult.mensaje_whatsapp}</p>
                    {selectedDeal.telefono && (
                      <a href={`https://wa.me/${selectedDeal.telefono}?text=${encodeURIComponent(aiResult.mensaje_whatsapp)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-2 text-[10px] text-green-400 font-mono hover:underline">
                        → Enviar por WhatsApp
                      </a>
                    )}
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Análisis</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{aiResult.analisis}</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => updateDeal(selectedDeal)}
              className="w-full bg-[#CCFF00] text-black font-black text-xs rounded-xl py-4 hover:bg-[#b8e600] transition-colors">
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
