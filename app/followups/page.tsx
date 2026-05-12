'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../app/lib/supabase'
import Link from 'next/link'

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
  clienteNombre?: string
}

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
const urgenciaLabel: Record<string, string> = { alta: 'Urgente', media: 'Esta semana', baja: 'Sin prisa' }

function formatFechaLabel(fecha: string) {
  const hoy = new Date().toISOString().split('T')[0]
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  if (fecha === hoy) return 'Hoy'
  if (fecha === manana) return 'Mañana'
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-DO', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function FollowUps() {
  const [items, setItems] = useState<FollowUp[]>([])
  const [filtro, setFiltro] = useState('pendientes')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('followups')
      .select('*, clientes(nombre)')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })

    if (data) {
      setItems(data.map((f) => ({
        id: f.id,
        cliente_id: f.cliente_id,
        tipo: f.tipo,
        titulo: f.titulo,
        detalle: f.detalle || '',
        fecha: f.fecha,
        hora: f.hora || '',
        urgencia: f.urgencia,
        hecho: f.hecho,
        clienteNombre: f.clientes?.nombre || '',
      })))
    }
    setCargando(false)
  }

  const toggle = async (id: string, hecho: boolean) => {
    await supabase.from('followups').update({ hecho: !hecho }).eq('id', id)
    setItems((prev) => prev.map((f) => f.id === id ? { ...f, hecho: !f.hecho } : f))
  }

  const filtrados = items.filter((f) => {
    const hoy = new Date().toISOString().split('T')[0]
    if (filtro === 'hoy') return f.fecha === hoy
    if (filtro === 'pendientes') return !f.hecho
    if (filtro === 'hechos') return f.hecho
    return true
  })

  // Agrupar por fecha
  const fechas = [...new Set(filtrados.map((f) => f.fecha))].sort()
  const hechos = items.filter((f) => f.hecho).length
  const total = items.length
  const progreso = total > 0 ? Math.round((hechos / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <main className="max-w-3xl mx-auto p-8">

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight">Follow<span className="text-[#d4af37] italic">-ups</span></h1>
            <p className="text-gray-500 text-sm mt-2 font-light">
              {cargando ? 'Cargando...' : `${hechos} de ${total} completados`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {['pendientes', 'hoy', 'hechos', 'todos'].map((f) => (
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
        {total > 0 && (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Progreso total</span>
              <span className="text-xs font-bold text-[#d4af37]">{progreso}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#d4af37] rounded-full transition-all duration-500" style={{ width: `${progreso}%` }} />
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!cargando && filtrados.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-sm mb-2">
              {filtro === 'pendientes' ? 'No hay follow-ups pendientes 🎉' : 'No hay follow-ups en esta vista'}
            </p>
            <p className="text-gray-700 text-xs">Créalos desde el perfil de cada cliente</p>
          </div>
        )}

        {/* Lista agrupada por fecha */}
        {fechas.map((fecha) => {
          const delDia = filtrados.filter((f) => f.fecha === fecha)
          if (delDia.length === 0) return null
          return (
            <div key={fecha} className="mb-8">
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">
                {formatFechaLabel(fecha)}
              </h3>
              <div className="space-y-3">
                {delDia.map((f) => (
                  <div
                    key={f.id}
                    className={`bg-[#0a0a0a] border rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-[#d4af37]/30 ${
                      f.hecho ? 'border-white/5 opacity-50' : 'border-white/5'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggle(f.id, f.hecho)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        f.hecho ? 'bg-green-400 border-green-400' : 'border-white/20 hover:border-green-400'
                      }`}
                    >
                      {f.hecho && <span className="text-black text-[10px] font-bold">✓</span>}
                    </button>

                    {/* Icono tipo */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border ${tipoColor[f.tipo] || tipoColor.otro}`}>
                      {tipoIcono[f.tipo] || '📌'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${f.hecho ? 'line-through text-gray-600' : 'text-white'}`}>
                        {f.titulo}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {f.clienteNombre && (
                          <Link href={`/clients/${f.cliente_id}`}
                            className="text-xs text-[#d4af37] hover:underline truncate"
                            onClick={(e) => e.stopPropagation()}>
                            {f.clienteNombre.split(' ').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')}
                          </Link>
                        )}
                        {f.detalle && <span className="text-gray-600 text-xs truncate">· {f.detalle}</span>}
                      </div>
                    </div>

                    {/* Hora y urgencia */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {f.hora && <span className="text-xs text-[#d4af37] font-mono">{f.hora}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${urgenciaColor[f.urgencia] || urgenciaColor.media}`}>
                        {urgenciaLabel[f.urgencia] || f.urgencia}
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
