'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'
// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80
      ? '#f59e0b'
      : score >= 60
      ? '#d97706'
      : score >= 40
      ? '#92400e'
      : '#44403c'

  return (
    <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#292524" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-amber-400">{score}</span>
    </div>
  )
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span className="text-zinc-400">{value}/{max}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false)

  const estratoLabel: Record<string, string> = {
    ultra_premium: 'Ultra Premium',
    premium: 'Premium',
    medio_alto: 'Medio Alto',
    medio: 'Medio',
  }

  const estratoColor: Record<string, string> = {
    ultra_premium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    premium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    medio_alto: 'text-zinc-300 bg-zinc-700/50 border-zinc-600',
    medio: 'text-zinc-500 bg-zinc-800 border-zinc-700',
  }

  const tipoLabel: Record<string, string> = {
    sector_exacto: 'Sector exacto',
    municipio: 'Municipio',
    tag_premium: 'Zona premium',
  }

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
      {/* Score accent bar */}
      <div
        className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
        style={{ width: `${match.score}%` }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          <ScoreRing score={match.score} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm leading-tight truncate">
                {match.title}
              </h3>
              <span
                className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                  estratoColor[match.estrato] ?? estratoColor.medio
                }`}
              >
                {estratoLabel[match.estrato] ?? match.estrato}
              </span>
            </div>

            <p className="text-zinc-500 text-xs mb-3">
              {match.sector} · {match.municipio}
            </p>

            {/* Key stats */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Precio</p>
                <p className="text-amber-400 font-bold text-sm">
                  {match.moneda === 'DOP' ? 'RD$' : '$'}
                  {Number(match.price).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">Tipo</p>
                <p className="text-zinc-300 text-sm capitalize">{match.type}</p>
              </div>
              {match.zona_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {match.zona_tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700"
                    >
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-between text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <span>Desglose del score</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            <ScoreBar label="Zona" value={match.score_zona} max={40} />
            <ScoreBar label="Tipo de propiedad" value={match.score_tipo} max={30} />
            <ScoreBar label="Presupuesto" value={match.score_presupuesto} max={30} />
            {match.detalle?.zona && (
              <p className="text-xs text-zinc-600 pt-1">
                Coincidencia:{' '}
                <span className="text-zinc-400">
                  {tipoLabel[match.detalle.zona] ?? match.detalle.zona}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Etapa Badge ──────────────────────────────────────────────────────────────

function EtapaBadge({ etapa }: { etapa: string }) {
  const map: Record<string, { label: string; className: string }> = {
    prospecto:  { label: 'Prospecto',  className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    contactado: { label: 'Contactado', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    calificado: { label: 'Calificado', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    negociacion:{ label: 'Negociación',className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    cerrado:    { label: 'Cerrado',    className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  }
  const config = map[etapa?.toLowerCase()] ?? { label: etapa, className: 'bg-zinc-800 text-zinc-400 border-zinc-700' }

  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClienteMatchesPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        // Fetch cliente profile
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', params.id)
          .single()

        if (clienteError) throw clienteError
        setCliente(clienteData)

        // Fetch matches via RPC
        const { data: matchData, error: matchError } = await supabase.rpc(
          'top_matches_cliente',
          {
            p_cliente_id: params.id,
            p_limit: 12,
            p_min_score: 20,
          }
        )

        if (matchError) throw matchError
        setMatches(matchData ?? [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id, supabase])

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm">Calculando matches…</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────

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

  const initials = cliente.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const topScore = matches[0]?.score ?? 0

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── Cliente Profile Card ── */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          {/* Background gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
                {topScore >= 70 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{cliente.nombre}</h1>
                  <EtapaBadge etapa={cliente.etapa} />
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500 mb-4">
                  {cliente.email && <span>{cliente.email}</span>}
                  {cliente.telefono && <span>{cliente.telefono}</span>}
                </div>

                {/* Preference pills */}
                <div className="flex flex-wrap gap-2">
                  {cliente.tipo_propiedad?.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 capitalize">
                      {t}
                    </span>
                  ))}
                  {cliente.zonas_interes?.map((z) => (
                    <span key={z} className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                      {z}
                    </span>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="shrink-0 text-right">
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Presupuesto</p>
                <p className="text-white font-semibold text-sm">
                  ${Number(cliente.presupuesto_min).toLocaleString()}
                </p>
                <p className="text-zinc-500 text-xs">–</p>
                <p className="text-amber-400 font-bold">
                  ${Number(cliente.presupuesto_max).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Notes */}
            {cliente.notas && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Notas</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{cliente.notas}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Matches Section ── */}
        <div>
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Propiedades sugeridas
              </h2>
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

          {/* Empty state */}
          {matches.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                </svg>
              </div>
              <p className="text-zinc-500 text-sm">No hay propiedades que coincidan con el perfil de este cliente aún.</p>
              <p className="text-zinc-700 text-xs mt-1">Agrega más propiedades al inventario para generar matches.</p>
            </div>
          )}

          {/* Matches grid */}
          {matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {matches.map((match) => (
                <MatchCard key={match.property_id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}