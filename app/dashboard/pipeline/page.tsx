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

const ETAPAS = ['Prospectos', 'Visitas', 'Negociacion', 'Cierre']

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newDeal, setNewDeal] = useState({
    nombre_cliente: '',
    propiedad: '',
    precio: '',
    etapa: 'Prospectos',
    telefono: '',
    email: '',
    notas: ''
  })

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    const { data, error } = await supabase
      .from('pipeline_deals')
      .select('*')
      .order('created_at', { ascending: false })
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
      setNewDeal({ nombre_cliente: '', propiedad: '', precio: '', etapa: 'Prospectos', telefono: '', email: '', notas: '' })
      setShowForm(false)
      fetchDeals()
    }
    setSaving(false)
  }

  async function moveDeal(dealId: string, currentEtapa: string, direction: 'forward' | 'backward') {
    const idx = ETAPAS.indexOf(currentEtapa)
    const nextIdx = direction === 'forward' ? idx + 1 : idx - 1
    if (nextIdx < 0 || nextIdx >= ETAPAS.length) return
    const nextEtapa = ETAPAS[nextIdx]
    await supabase.from('pipeline_deals').update({ etapa: nextEtapa, updated_at: new Date().toISOString() }).eq('id', dealId)
    fetchDeals()
  }

  async function updateDeal(deal: Deal) {
    await supabase.from('pipeline_deals').update({
      nombre_cliente: deal.nombre_cliente,
      propiedad: deal.propiedad,
      precio: deal.precio,
      notas: deal.notas,
      telefono: deal.telefono,
      email: deal.email,
      updated_at: new Date().toISOString()
    }).eq('id', deal.id)
    fetchDeals()
    setSelectedDeal(null)
  }

  async function deleteDeal(id: string) {
    await supabase.from('pipeline_deals').delete().eq('id', id)
    fetchDeals()
  }

  const totalVolumen = deals.reduce((s, d) => s + (d.precio || 0), 0)

  return (
    <div className="text-zinc-100 font-sans">
      <div className="space-y-8">
        <header className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia de Negociacion</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-2">Pipeline Visual</h1>
          </div>
          <div className="flex items-end gap-6">
            <div className="text-right">
              <p className="text-xs font-mono text-zinc-500 uppercase">Volumen Total</p>
              <p className="text-2xl font-black text-white">US$ {totalVolumen.toLocaleString()}</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-3 hover:bg-[#b8e600] transition-colors whitespace-nowrap"
            >
              + Nuevo Deal
            </button>
          </div>
        </header>

        {showForm && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Nuevo Deal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="Nombre del cliente" value={newDeal.nombre_cliente} onChange={e => setNewDeal({...newDeal, nombre_cliente: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Propiedad" value={newDeal.propiedad} onChange={e => setNewDeal({...newDeal, propiedad: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Precio (USD)" type="number" value={newDeal.precio} onChange={e => setNewDeal({...newDeal, precio: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Telefono" value={newDeal.telefono} onChange={e => setNewDeal({...newDeal, telefono: e.target.value})}
                className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none" />
              <input placeholder="Email" value={newDeal.email} onChange={e => setNewDeal({...newDeal, email: e.target.value})}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {ETAPAS.map(etapa => {
              const etapaDeals = deals.filter(d => d.etapa === etapa)
              const etapaTotal = etapaDeals.reduce((s, d) => s + (d.precio || 0), 0)
              return (
                <div key={etapa} className="bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/50 flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xs font-mono font-black text-zinc-400 uppercase">{etapa}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono">{etapaDeals.length} deals</p>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded text-white">
                      US$ {etapaTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {etapaDeals.map(deal => (
                      <div key={deal.id} onClick={() => setSelectedDeal(deal)}
                        className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 p-4 rounded-xl cursor-pointer transition-all">
                        <div className="font-bold text-white text-xs">{deal.nombre_cliente}</div>
                        <div className="text-zinc-500 text-[11px] mt-0.5 truncate">{deal.propiedad}</div>
                        <div className="text-[#CCFF00] font-black text-sm mt-2">US$ {(deal.precio || 0).toLocaleString()}</div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-900" onClick={e => e.stopPropagation()}>
                          <button disabled={etapa === ETAPAS[0]} onClick={() => moveDeal(deal.id, deal.etapa, 'backward')}
                            className="text-[9px] p-1.5 bg-zinc-900 rounded disabled:opacity-20 text-zinc-400 hover:text-white">
                            Back
                          </button>
                          <button onClick={() => deleteDeal(deal.id)} className="text-[9px] text-red-500 hover:text-red-400">Borrar</button>
                          <button disabled={etapa === ETAPAS[ETAPAS.length-1]} onClick={() => moveDeal(deal.id, deal.etapa, 'forward')}
                            className="text-[9px] p-1.5 bg-zinc-900 rounded disabled:opacity-20 text-zinc-400 hover:text-white">
                            Next
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-end" onClick={() => setSelectedDeal(null)}>
          <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 h-full p-8 flex flex-col gap-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-white uppercase">Editar Deal</h2>
              <button onClick={() => setSelectedDeal(null)} className="text-zinc-500 hover:text-white">X</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Nombre</label>
                <input value={selectedDeal.nombre_cliente} onChange={e => setSelectedDeal({...selectedDeal, nombre_cliente: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-sm rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Propiedad</label>
                <input value={selectedDeal.propiedad} onChange={e => setSelectedDeal({...selectedDeal, propiedad: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Precio (USD)</label>
                <input type="number" value={selectedDeal.precio} onChange={e => setSelectedDeal({...selectedDeal, precio: Number(e.target.value)})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-[#CCFF00] font-black text-sm rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Telefono</label>
                <input value={selectedDeal.telefono} onChange={e => setSelectedDeal({...selectedDeal, telefono: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 mt-1 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Notas</label>
                <textarea rows={4} value={selectedDeal.notas} onChange={e => setSelectedDeal({...selectedDeal, notas: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-zinc-300 text-xs rounded-xl px-4 py-3 mt-1 outline-none resize-none" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Calculadora de Comision</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Porcentaje %</label>
                  <input
                    type="number"
                    defaultValue="3"
                    id="comision-pct"
                    min="0" max="100" step="0.5"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-[#CCFF00] text-white text-sm rounded-xl px-3 py-2 mt-1 outline-none"
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value) || 0
                      const result = document.getElementById("comision-result")
                      if (result) result.textContent = "US$ " + ((selectedDeal.precio * pct / 100)).toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0})
                    }}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase">Tu Comision</label>
                  <div id="comision-result" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 mt-1 text-[#CCFF00] font-black text-sm font-mono">
                    US$ {Math.round(selectedDeal.precio * 3 / 100).toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono">Precio base: US$ {selectedDeal.precio.toLocaleString()}</p>
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
