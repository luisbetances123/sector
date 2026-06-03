'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// —— Types ——————————————————————————————————————————————————
interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  etapa: string
  tipo_propiedad: string[]
  presupuesto_min: string
  presupuesto_max: string
  zonas_interes: string[]
  notas: string
  created_at: string
}

interface MatchResult {
  property_id: string
  title: string
  sector: string
  municipio: string
  price: string
  moneda: string
  type: string
  estrato: string
  zona_tags: string[]
  score: number
  score_zona: number
  score_tipo: number
  score_presupuesto: number
  detalle: Record<string, string>
}

interface Tarea {
  id: string
  cliente_id: string
  titulo: string
  completada: boolean
  created_at: string
}

interface Bitacora {
  id: string
  cliente_id: string
  nota: string
  created_at: string
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#f59e0b' : score >= 60 ? '#d97706' : score >= 40 ? '#92400e' : '#44403c'

  return (
    <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#292524" strokeWidth="4" />
        <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className="absolute text-sm font-bold text-amber-400">{score}</span>
    </div>
  )
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span className="text-zinc-400">{value}/{max}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false)
  const estratoLabel: Record<string, string> = { ultra_premium: 'Ultra Premium', premium: 'Premium', medio_alto: 'Medio Alto', medio: 'Medio' }
  const estratoColor: Record<string, string> = {
    ultra_premium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    premium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    medio_alto: 'text-zinc-300 bg-zinc-700/50 border-zinc-600',
    medio: 'text-zinc-500 bg-zinc-800 border-zinc-700',
  }
  const tipoLabel: Record<string, string> = { sector_exacto: 'Sector exacto', municipio: 'Municipio', tag_premium: 'Zona premium' }

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
      <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700" style={{ width: `${match.score}%` }} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={match.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm leading-tight truncate">{match.title}</h3>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${estratoColor[match.estrato] ?? estratoColor.medio}`}>
                {estratoLabel[match.estrato] ?? match.estrato}
              </span>
            </div>
            <p className="text-zinc-500 text-xs mb-3">{match.sector} · {match.municipio}</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Precio</p>
                <p className="text-amber-400 font-bold text-sm">{match.moneda === 'DOP' ? 'RD$' : '$'}{Number(match.price).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Tipo</p>
                <p className="text-zinc-300 text-sm capitalize">{match.type}</p>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-between text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          <span>Desglose del score</span>
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            <ScoreBar label="Zona" value={match.score_zona} max={40} />
            <ScoreBar label="Tipo de propiedad" value={match.score_tipo} max={30} />
            <ScoreBar label="Presupuesto" value={match.score_presupuesto} max={30} />
            {match.detalle?.zona && (
              <p className="text-xs text-zinc-600 pt-1">Coincidencia: <span className="text-zinc-400">{tipoLabel[match.detalle.zona] ?? match.detalle.zona}</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EtapaBadge({ etapa }: { etapa: string }) {
  const map: Record<string, { label: string; className: string }> = {
    prospecto:   { label: 'Prospecto',   className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    contactado:  { label: 'Contactado',  className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    calificado:  { label: 'Calificado',  className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    negociacion: { label: 'Negociación', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    cerrado:     { label: 'Cerrado',     className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  }
  const config = map[etapa?.toLowerCase()] ?? { label: etapa, className: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
  return <span className={`text-xs px-3 py-1 rounded-full border font-medium ${config.className}`}>{config.label}</span>
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClienteMatchesPage({ params }: { params: { id: string } }) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [bitacora, setBitacora] = useState<Bitacora[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [guardandoTarea, setGuardandoTarea] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes').select('*').eq('id', params.id).single()
        if (clienteError) throw clienteError
        setCliente(clienteData)

        const { data: matchData } = await supabase.rpc('top_matches_cliente', {
          p_cliente_id: params.id, p_limit: 12, p_min_score: 20,
        })
        setMatches(matchData ?? [])

        const { data: tareasData } = await supabase
          .from('tareas_cliente').select('*').eq('cliente_id', params.id).order('created_at', { ascending: false })
        setTareas(tareasData ?? [])

        const { data: bitacoraData } = await supabase
          .from('bitacora_cliente').select('*').eq('cliente_id', params.id).order('created_at', { ascending: false })
        setBitacora(bitacoraData ?? [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function agregarTarea() {
    if (!nuevaTarea.trim()) return
    setGuardandoTarea(true)
    const { data, error } = await supabase
      .from('tareas_cliente')
      .insert({ cliente_id: params.id, titulo: nuevaTarea.trim(), completada: false })
      .select().single()
    if (!error && data) { setTareas(prev => [data, ...prev]); setNuevaTarea('') }
    setGuardandoTarea(false)
  }

  async function toggleTarea(tarea: Tarea) {
    const { error } = await supabase.from('tareas_cliente').update({ completada: !tarea.completada }).eq('id', tarea.id)
    if (!error) setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, completada: !t.completada } : t))
  }

  async function eliminarTarea(id: string) {
    const { error } = await supabase.from('tareas_cliente').delete().eq('id', id)
    if (!error) setTareas(prev => prev.filter(t => t.id !== id))
  }

  async function agregarNota() {
    if (!nuevaNota.trim()) return
    setGuardandoNota(true)
    const { data, error } = await supabase
      .from('bitacora_cliente')
      .insert({ cliente_id: params.id, nota: nuevaNota.trim() })
      .select().single()
    if (!error && data) { setBitacora(prev => [data, ...prev]); setNuevaNota('') }
    setGuardandoNota(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm">Cargando cliente…</p>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-zinc-400 text-sm">No se pudo cargar el cliente</p>
          <p className="text-zinc-700 text-xs">{error}</p>
        </div>
      </div>
    )
  }

  const initials = cliente.nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const topScore = matches[0]?.score ?? 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── Perfil ── */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{cliente.nombre}</h1>
                  <EtapaBadge etapa={cliente.etapa} />
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500 mb-4">
                  {cliente.email && <span>{cliente.email}</span>}
                  {cliente.telefono && <span>{cliente.telefono}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cliente.tipo_propiedad?.map(t => (
                    <span key={t} className="text-xs px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 capitalize">{t}</span>
                  ))}
                  {cliente.zonas_interes?.map(z => (
                    <span key={z} className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">{z}</span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Presupuesto</p>
                <p className="text-white font-semibold text-sm">${Number(cliente.presupuesto_min).toLocaleString()}</p>
                <p className="text-zinc-500 text-xs">–</p>
                <p className="text-amber-400 font-bold">${Number(cliente.presupuesto_max).toLocaleString()}</p>
              </div>
            </div>
            {cliente.notas && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Notas</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{cliente.notas}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Tareas ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2">
            <span>✅</span> Tareas Pendientes
            <span className="ml-auto text-xs font-normal text-zinc-600">
              {tareas.filter(t => !t.completada).length} pendiente{tareas.filter(t => !t.completada).length !== 1 ? 's' : ''}
            </span>
          </h2>
          <div className="flex gap-2 mb-5">
            <input value={nuevaTarea} onChange={e => setNuevaTarea(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarTarea()}
              placeholder="Ej: Llamar el jueves, enviar contrato..."
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 placeholder:text-zinc-600" />
            <button onClick={agregarTarea} disabled={guardandoTarea || !nuevaTarea.trim()}
              className="px-4 py-2.5 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-all">
              + Agregar
            </button>
          </div>
          {tareas.length === 0 ? (
            <p className="text-zinc-700 text-sm text-center py-4">Sin tareas — agrega la primera arriba.</p>
          ) : (
            <div className="space-y-2">
              {tareas.map(tarea => (
                <div key={tarea.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${tarea.completada ? 'bg-zinc-900/50 border-zinc-800/50 opacity-50' : 'bg-zinc-800/50 border-zinc-700'}`}>
                  <button onClick={() => toggleTarea(tarea)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${tarea.completada ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 hover:border-amber-500'}`}>
                    {tarea.completada && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${tarea.completada ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{tarea.titulo}</span>
                  <button onClick={() => eliminarTarea(tarea.id)} className="text-zinc-700 hover:text-red-400 transition-colors text-xs px-2">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bitácora ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2">
            <span>📋</span> Bitácora de Interacciones
          </h2>
          <div className="flex gap-2 mb-5">
            <textarea value={nuevaNota} onChange={e => setNuevaNota(e.target.value)}
              placeholder="Ej: Llamé hoy y me dijo que prefiere ver el penthouse el jueves..."
              rows={2}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 placeholder:text-zinc-600 resize-none" />
            <button onClick={agregarNota} disabled={guardandoNota || !nuevaNota.trim()}
              className="px-4 py-2.5 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-all self-start">
              + Nota
            </button>
          </div>
          {bitacora.length === 0 ? (
            <p className="text-zinc-700 text-sm text-center py-4">Sin notas — registra la primera interacción arriba.</p>
          ) : (
            <div className="space-y-3">
              {bitacora.map(entrada => (
                <div key={entrada.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                  <p className="text-zinc-300 text-sm leading-relaxed">{entrada.nota}</p>
                  <p className="text-zinc-600 text-xs mt-2">
                    {new Date(entrada.created_at).toLocaleDateString('es-DO', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Matches ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Propiedades sugeridas</h2>
              <p className="text-zinc-600 text-sm mt-0.5">
                {matches.length > 0
                  ? `${matches.length} coincidencia${matches.length !== 1 ? 's' : ''} encontrada${matches.length !== 1 ? 's' : ''}`
                  : 'Sin coincidencias por ahora'}
              </p>
            </div>
            {matches.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Score máximo: <span className="text-amber-400 font-medium">{topScore}</span></span>
              </div>
            )}
          </div>
          {matches.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
              <p className="text-zinc-500 text-sm">No hay propiedades que coincidan con el perfil de este cliente aún.</p>
            </div>
          )}
          {matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {matches.map(match => <MatchCard key={match.property_id} match={match} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}