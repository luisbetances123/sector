'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
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
  isMovement?: boolean
  colorBorde?: string
}

const tipoIcono: Record<string, string> = { 
  llamada: '📞', 
  visita: '🏠', 
  documento: '📄', 
  otro: '📌',
  movimiento: '🏷️' 
}

const tipoColor: Record<string, string> = {
  llamada: 'bg-blue-400',
  visita: 'bg-amber-400',
  documento: 'bg-purple-400',
  otro: 'bg-zinc-400',
  movimiento: 'bg-zinc-500',
}

const tipoBorde: Record<string, string> = {
  llamada: 'border-l-blue-400',
  visita: 'border-l-amber-400',
  documento: 'border-l-purple-400',
  otro: 'border-l-zinc-400',
}

const urgenciaColor: Record<string, string> = {
  alta: 'bg-red-900 text-red-300',
  media: 'bg-amber-900 text-amber-300',
  baja: 'bg-green-900 text-green-300',
  LEAD: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  BUSCANDO: 'bg-blue-950 text-blue-400 border border-blue-900',
  'EN OFERTA': 'bg-amber-950 text-amber-400 border border-amber-900',
  CIERRE: 'bg-green-950 text-green-400 border border-green-900'
}

const puntitoColor: Record<string, string> = {
  LEAD: 'bg-zinc-500',
  BUSCANDO: 'bg-blue-600',
  'EN OFERTA': 'bg-amber-500',
  CIERRE: 'bg-green-600'
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
  // Añadimos phone a la interfaz local del estado de clientes
  const [clientes, setClientes] = useState<{id: string, name: string, phone?: string}[]>([])
  const hoyStr = hoy.toISOString().split('T')[0]
  const [form, setForm] = useState({ cliente_id: '', tipo: 'llamada', titulo: '', detalle: '', fecha: hoyStr, hora: '09:00', urgencia: 'media' })

  useEffect(() => { 
    fetchClientes().then(() => {
      fetchData()
    })
  }, [])

  async function fetchClientes() {
    // Jalamos también el campo 'phone' para poder disparar los WhatsApps
    const { data } = await supabase.from('clients').select('id, name, phone')
    if (data) setClientes(data)
  }

  async function fetchData() {
    const { data: followupsData } = await supabase.from('followups').select('*').order('fecha').order('hora')
    
    const { data: movementsData } = await supabase
      .from('client_movements')
      .select('id, client_id, etapa, moved_at')

    let combinados: FollowUp[] = []

    if (followupsData) {
      combinados = [...followupsData]
    }

    if (movementsData) {
      const movimientosFormateados: FollowUp[] = movementsData.map(mov => {
        const fechaJusta = mov.moved_at ? mov.moved_at.split('T')[0] : ''
        const horaJusta = mov.moved_at ? mov.moved_at.split('T')[1]?.substring(0, 5) : '12:00'
        
        let colorB = 'border-l-zinc-500'
        if (mov.etapa === 'BUSCANDO') colorB = 'border-l-blue-600'
        if (mov.etapa === 'EN OFERTA') colorB = 'border-l-amber-500'
        if (mov.etapa === 'CIERRE') colorB = 'border-l-green-600'

        return {
          id: `mov-${mov.id}`,
          cliente_id: mov.client_id,
          tipo: 'movimiento',
          titulo: `Cambio a etapa: ${mov.etapa}`,
          detalle: `El cliente fue movido en el Pipeline.`,
          fecha: fechaJusta,
          hora: horaJusta,
          urgencia: mov.etapa, 
          hecho: true,         
          isMovement: true,
          colorBorde: colorB
        }
      })
      combinados = [...combinados, ...movimientosFormateados]
    }

    setFollowups(combinados)
  }

  async function saveFollowup() {
    if (!form.titulo.trim()) return
    setSaving(true)
    const { error } = await supabase.from('followups').insert([{ ...form, hecho: false }])
    if (!error) {
      setForm({ cliente_id: '', tipo: 'llamada', titulo: '', detalle: '', fecha: diaSeleccionado || hoyStr, hora: '09:00', urgencia: 'media' })
      setShowForm(false)
      fetchData()
    } else {
      alert('Error: ' + error.message)
    }
    setSaving(false)
  }

  async function toggleHecho(id: string, hecho: boolean) {
    if (id.startsWith('mov-')) return 
    await supabase.from('followups').update({ hecho: !hecho }).eq('id', id)
    setFollowups(prev => prev.map(f => f.id === id ? { ...f, hecho: !f.hecho } : f))
  }

  // Función mágica para disparar recordatorios por WhatsApp
  const enviarRecordatorioWhatsApp = (f: FollowUp) => {
    const clienteObj = clientes.find(c => c.id === f.cliente_id)
    if (!clienteObj || !clienteObj.phone) {
      alert('Este cliente no tiene un número de teléfono registrado.')
      return
    }

    // Limpiamos el número por seguridad (quitando espacios o guiones)
    const numeroLimpio = clienteObj.phone.replace(/[^0-9]/g, '')
    
    // Formateamos la fecha amigable
    const fechaAmigable = new Date(f.fecha + 'T12:00:00').toLocaleDateString('es-DO', { 
      day: 'numeric', 
      month: 'long' 
    })

    // Construimos la plantilla automática dependiendo del tipo de cita
    let mensaje = `Hola ${clienteObj.name}, te saludo de HOMVI. `
    if (f.tipo === 'visita') {
      mensaje += `Te confirmo nuestra cita programada para ver la propiedad el próximo ${fechaAmigable} a las ${f.hora}. ¡Nos vemos allá!`
    } else if (f.tipo === 'llamada') {
      mensaje += `Te recuerdo que tenemos pautada una llamada de seguimiento el ${fechaAmigable} a las ${f.hora}. Quedo atento.`
    } else {
      mensaje += `Te escribo para dar seguimiento a nuestro pendiente de "${f.titulo}" pautado para el ${fechaAmigable} a las ${f.hora}.`
    }

    window.open(`https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = Array(primerDia).fill(null).concat(Array.from({ length: diasEnMes }, (_, i) => i + 1))
  
  const eventosDelDia = (dia: number) => {
    const f = `${anio}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    return followups.filter(fu => fu.fecha === f)
  }
  
  const eventosDiaSeleccionado = diaSeleccionado ? followups.filter(f => f.fecha === diaSeleccionado) : []
  const pendientes = followups.filter(f => !f.hecho && !f.isMovement).length
  const completados = followups.filter(f => f.hecho || f.isMovement).length
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {[{ label: 'Total', value: followups.length, color: 'text-white' },{ label: 'Pendientes', value: pendientes, color: 'text-amber-500' },{ label: 'Completados', value: completados, color: 'text-green-400' },{ label: 'Hoy', value: followups.filter(f => f.fecha === hoyStr).length, color: 'text-blue-400' }].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full min-w-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 md:p-6 w-full overflow-hidden">
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
                    {eventos.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {eventos.slice(0,3).map((e,ei) => {
                          let dotBg = tipoColor[e.tipo] || 'bg-zinc-400'
                          if (e.isMovement) {
                            dotBg = puntitoColor[e.urgencia] || 'bg-zinc-400'
                          }
                          return <div key={ei} className={`w-1.5 h-1.5 rounded-full ${esSel ? 'bg-black' : dotBg}`} />
                        })}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="w-full min-w-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">{diaSeleccionado ? new Date(diaSeleccionado + 'T12:00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona un dia'}</h3>
            {eventosDiaSeleccionado.length === 0 ? <p className="text-zinc-500 text-sm text-center py-6">Sin eventos este dia</p> : (
              <div className="flex flex-col gap-3">
                {eventosDiaSeleccionado.sort((a,b) => a.hora.localeCompare(b.hora)).map(f => (
                  <div key={f.id} className={`border rounded-xl p-3 transition-all ${f.colorBorde ? `border-zinc-800 border-l-4 ${f.colorBorde}` : f.hecho ? 'border-zinc-800 opacity-50' : `border-zinc-700 border-l-4 ${tipoBorde[f.tipo] || 'border-l-zinc-500'}`}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>{tipoIcono[f.tipo] || '📌'}</span>
                        <span className={`text-sm font-bold ${f.hecho && !f.isMovement ? 'line-through text-zinc-500' : 'text-white'}`}>{f.titulo}</span>
                      </div>
                      
                      {/* Contenedor de Botones de Acción */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* BOTÓN DE WHATSAPP AUTOMÁTICO (Solo aparece si tiene cliente asignado y no es un movimiento crudo de pipeline) */}
                        {f.cliente_id && !f.isMovement && (
                          <button 
                            onClick={() => enviarRecordatorioWhatsApp(f)}
                            className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            title="Enviar recordatorio automático por WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>Avisar</span>
                          </button>
                        )}

                        {!f.isMovement && (
                          <button onClick={() => toggleHecho(f.id, f.hecho)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${f.hecho ? 'bg-green-400 border-green-400' : 'border-zinc-500 hover:border-green-400'}`}>{f.hecho && <span className="text-black text-[10px] font-bold">✓</span>}</button>
                        )}
                      </div>
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