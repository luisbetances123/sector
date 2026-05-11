'use client'
import { useState } from 'react'

const followups = [
  { id: '1', cliente: 'María R.', tipo: 'llamada', titulo: 'Llamada de seguimiento', detalle: 'Confirmar visita a Polanco 34', fecha: 'Hoy', hora: '10:00 AM', urgencia: 'alta', hecho: false },
  { id: '2', cliente: 'Carlos M.', tipo: 'visita', titulo: 'Visita a propiedad', detalle: 'Anatole France 78, Polanco', fecha: 'Hoy', hora: '12:30 PM', urgencia: 'alta', hecho: false },
  { id: '3', cliente: 'Ana P.', tipo: 'documento', titulo: 'Enviar carta oferta', detalle: 'Condiciones acordadas la semana pasada', fecha: 'Hoy', hora: '3:00 PM', urgencia: 'media', hecho: false },
  { id: '4', cliente: 'José L.', tipo: 'llamada', titulo: 'Llamada inicial', detalle: 'Primer contacto, entender necesidades', fecha: 'Mañana', hora: '9:00 AM', urgencia: 'baja', hecho: false },
  { id: '5', cliente: 'Carmen V.', tipo: 'documento', titulo: 'Revisión de contrato', detalle: 'Enviar al notario para revisión', fecha: 'Mañana', hora: '11:00 AM', urgencia: 'media', hecho: false },
  { id: '6', cliente: 'Pedro A.', tipo: 'visita', titulo: '2ª visita', detalle: 'Revisitar con esposa', fecha: 'Vie 9 mayo', hora: '4:00 PM', urgencia: 'baja', hecho: false },
]

const tipoIcono: Record<string, string> = { llamada: '📞', visita: '🏠', documento: '📄', otro: '📌' }

const tipoColor: Record<string, string> = {
  llamada: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  visita: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  documento: 'text-green-400 bg-green-400/10 border-green-400/20',
  otro: 'text-gray-400 bg-white/5 border-white/10',
}

const urgenciaColor: Record<string, string> = {
  alta: 'text-red-400 bg-red-400/10 border-red-400/20',
  media: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20',
  baja: 'text-green-400 bg-green-400/10 border-green-400/20',
}

const urgenciaLabel: Record<string, string> = {
  alta: 'Urgente',
  media: 'Esta semana',
  baja: 'Sin prisa',
}

const dias = ['Hoy', 'Mañana', 'Vie 9 mayo']

export default function FollowUps() {
  const [items, setItems] = useState(followups)
  const [filtro, setFiltro] = useState('todos')

  const toggle = (id: string) =>
    setItems((prev) => prev.map((f) => f.id === id ? { ...f, hecho: !f.hecho } : f))

  const filtrados = items.filter((f) => {
    if (filtro === 'hoy') return f.fecha === 'Hoy'
    if (filtro === 'pendientes') return !f.hecho
    return true
  })

  const hechos = items.filter((f) => f.hecho).length
  const total = items.length
  const progreso = Math.round((hechos / total) * 100)

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <main className="max-w-3xl mx-auto p-8">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight">Follow<span className="text-[#d4af37] italic">-ups</span></h1>
            <p className="text-gray-500 text-sm mt-2 font-light">{hechos} de {total} completados hoy</p>
          </div>
          <div className="flex gap-2">
            {['todos', 'hoy', 'pendientes'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                  filtro === f ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-500 hover:border-white/30'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* Barra de progreso */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Progreso del día</span>
            <span className="text-xs font-bold text-[#d4af37]">{progreso}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Lista por día */}
        {dias.map((dia) => {
          const delDia = filtrados.filter((f) => f.fecha === dia)
          if (delDia.length === 0) return null
          return (
            <div key={dia} className="mb-8">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">{dia}</h3>
              <div className="space-y-3">
                {delDia.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    className={`bg-[#0a0a0a] border rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:border-[#d4af37]/30 ${
                      f.hecho ? 'border-white/5 opacity-50' : 'border-white/5'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      f.hecho ? 'bg-green-400 border-green-400' : 'border-white/20'
                    }`}>
                      {f.hecho && <span className="text-black text-[10px] font-bold">✓</span>}
                    </div>

                    {/* Icono tipo */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border ${tipoColor[f.tipo]}`}>
                      {tipoIcono[f.tipo]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${f.hecho ? 'line-through text-gray-600' : 'text-white'}`}>
                        {f.titulo}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{f.cliente} · {f.detalle}</p>
                    </div>

                    {/* Hora y urgencia */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-[#d4af37] font-mono">{f.hora}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${urgenciaColor[f.urgencia]}`}>
                        {urgenciaLabel[f.urgencia]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
