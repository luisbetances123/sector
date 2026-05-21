'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface FollowUp {
  id: string
  cliente_id: string
  tipo: string
  titulo: string
  detalle: string
  fecha: string
  hora: string
  urgencia: string
  hecho: boolean
}

const tipoIcono: Record<string, string> = { llamada: '📞', visita: '🏠', documento: '📄', otro: '📌' }
const urgenciaColor: Record<string, string> = {
  alta: 'bg-red-900 text-red-300',
  media: 'bg-amber-900 text-amber-300',
  baja: 'bg-green-900 text-green-300',
}
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab']

export default function CalendarPage() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(hoy.toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clientes, setClientes] = useState<{id: string, name: string}[]>([])
  const hoyStr = hoy.toISOString().split('T')[0]
  const [form, setForm] = useState({ cliente_id: '', tipo: 'llamada', titulo: '', detalle: '', fecha: hoyStr, hora: '09:00', urgencia: 'media' })

  useEffect(() => { fetchFollowups(); fetchClientes() }, [])

  async function fetchFollowups() {
    const { data } = await supabase.from('followups').select('*').order('fecha').order('hora')
    if (data) setFollowups(data)
  }

  async function fetchClientes() {
    const { data } = await supabase.from('clients').select('id, name')
    if (data) setClientes(data)
  }

  async function saveFollowup() {
    if (!form.titulo.trim()) return
    setSaving(true)
    const { error } = await supabase.from('followups').insert([{ ...form, hecho: false }])
    if (!error) {
      setForm({ cliente_id: '', tipo: 'llamada', titulo: '', detalle: '', fecha: diaSeleccionado || hoyStr, hora: '09:00', urgencia: 'media' })
      setShowForm(false)
      fetchFollowups()
    } else {
      alert('Error: ' + error.message)
    }
    setSaving(false)
  }

  async function toggleHecho(id: string, hecho: boolean) {
    await supabase.from('followups').update({ hecho: !hecho }).eq('id', id)
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, hecho: !f.hecho } : f))
  }

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = Array(primerDia).fill(null).concat(Array.from({ length: diasEnMes }, (_, i) => i + 1))
  const eventosDelDia = (dia: number) => {
    const f = `${anio}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    return followups.filter(fu => fu.fecha === f)
  }
  const eventosDiaSeleccionado = diaSeleccionado ? followups.filter(f => f.fecha === diaSeleccionado) : []
  const pendientes = followups.filter(f => !f.hecho).length
  const completados = followups.filter(f => f.hecho).length
  const nombreCliente = (id: string) => clientes.find(c => c.id === id)?.name || ''

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-amber-500 tracking-tighter uppercase">CALENDARIO</h1>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{pendientes} pendientes · {completados} completados</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, fecha: diaSeleccionado || hoyStr })) }} className="bg-amber-500 text-black px-3 py-2 rounded-xl font-black text-xs uppercase hover:bg-white transition-all">+ Evento</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 w-full">
        {[{ label: 'Total', value: followups.length, color: 'text-white' },{ label: 'Pendientes', value: pendientes, color: 'text-amber-500' },{ label: 'Completados', value: completados, color: 'text-green-400' },{ label: 'Hoy', value: followups.filter(f => f.fecha === hoyStr).length, color: 'text-blue-400' }].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a-1) } else setMes(m => m-1) }} className="text-zinc-400 hover:text-white text-xl px-2">&#8249;</button>
              <h2 className="text-white font-black uppercase tracking-wider text-sm md:text-base">{MESES[mes]} {anio}</h2>
              <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a+1) } else setMes(m => m+1) }} className="text-zinc-400 hover:text-white text-xl px-2">&#8250;</button>
            </div>
            <div className="grid grid-cols-7 mb-1">{DIAS.map(d => <div key={d} className="text-center text-zinc-500 text-[10px] uppercase tracking-wider py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {celdas.map((dia, i) => {
                if (!dia) return <div key={i} />
                const fechaStr = `${anio}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
                const eventos = eventosDelDia(dia)
                const esHoy = fechaStr === hoyStr
                const esSel = fechaStr === diaSeleccionado
                return (
                  <button key={i} onClick={() => setDiaSeleccionado(fechaStr)} className={`relative p-1 rounded-lg text-xs font-bold transition-all min-h-[44px] flex flex-col items-center ${esSel ? 'bg-amber-500 text-black' : esHoy ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>
                    <span>{dia}</span>
                    {eventos.length > 0 && <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">{eventos.slice(0,3).map((e,ei) => <div key={ei} className={`w-1 h-1 rounded-full ${esSel ? 'bg-black' : e.urgencia === 'alta' ? 'bg-red-400' : e.urgencia === 'media' ? 'bg-amber-400' : 'bg-green-400'}`} />)}</div>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">{diaSeleccionado ? new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un dia'}</h3>
            {eventosDiaSeleccionado.length === 0 ? <p className="text-zinc-500 text-sm text-center py-6">Sin eventos este dia</p> : (
              <div className="flex flex-col gap-3">
                {eventosDiaSeleccionado.sort((a,b) => a.hora.localeCompare(b.hora)).map(f => (
                  <div key={f.id} className={`border rounded-xl p-3 transition-all ${f.hecho ? 'border-zinc-800 opacity-50' : 'border-zinc-700'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2"><span>{tipoIcono[f.tipo] || '📌'}</span><span className={`text-sm font-bold ${f.hecho ? 'line-through text-zinc-500' : 'text-white'}`}>{f.titulo}</span></div>
                      <button onClick={() => toggleHecho(f.id, f.hecho)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${f.hecho ? 'bg-green-400 border-green-400' : 'border-zinc-500 hover:border-green-400'}`}>{f.hecho && <span className="text-black text-[10px] font-bold">✓</span>}</button>
                    </div>
                    {f.hora && <p className="text-amber-500 text-xs font-mono mt-1">{f.hora}</p>}
                    {f.cliente_id && nombreCliente(f.cliente_id) && <p className="text-zinc-400 text-xs mt-1">👤 {nombreCliente(f.cliente_id)}</p>}
                    {f.detalle && <p className="text-zinc-500 text-xs mt-1">{f.detalle}</p>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-2 inline-block ${urgenciaColor[f.urgencia] || urgenciaColor.media}`}>{f.urgencia}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setShowForm(true); setForm(f => ({ ...f, fecha: diaSeleccionado || hoyStr })) }} className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl text-xs font-black uppercase transition-all">+ Agregar evento</button>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full ">
            <h2 className="text-xl font-black text-amber-500 uppercase mb-6">Nuevo Evento</h2>
            <div className="flex flex-col gap-4">
              <input placeholder="Titulo *" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              <select value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                <option value="">Sin cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                  <option value="llamada">📞 Llamada</option>
                  <option value="visita">🏠 Visita</option>
                  <option value="documento">📄 Documento</option>
                  <option value="otro">📌 Otro</option>
                </select>
                <select value={form.urgencia} onChange={e => setForm({...form, urgencia: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none">
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                <input type="time" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
              </div>
              <textarea placeholder="Detalle (opcional)" value={form.detalle} onChange={e => setForm({...form, detalle: e.target.value})} rows={2} className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">Cancelar</button>
              <button onClick={saveFollowup} disabled={saving} className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
