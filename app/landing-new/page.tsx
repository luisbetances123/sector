'use client'
import { supabase } from '../lib/supabase'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react'

// ── Typewriter cíclico del hero ──────────────────────────────────────────────
function useCyclingTypewriter(words: string[]) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    const speed = deleting ? 35 : 55
    const timeout = setTimeout(() => {
      if (!deleting && text.length < current.length) {
        setText(current.slice(0, text.length + 1))
      } else if (!deleting && text.length === current.length) {
        setTimeout(() => setDeleting(true), 1400)
      } else if (deleting && text.length > 0) {
        setText(text.slice(0, -1))
      } else {
        setDeleting(false)
        setWordIndex((wordIndex + 1) % words.length)
      }
    }, speed)
    return () => clearTimeout(timeout)
  }, [text, deleting, wordIndex, words])

  return text
}

// ── Sparkline de 7 puntos para cada unidad ───────────────────────────────────
function Sparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  const w = 64, h = 20
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={positive ? '#CCFF00' : '#666666'} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── Gráfico de absorción estilo terminal de trading ──────────────────────────
function AbsorptionChart() {
  const data = [12, 14, 13, 18, 22, 21, 26, 30, 29, 34, 38, 41, 39, 45, 50, 54, 58, 56, 61, 65]
  const w = 100, h = 100
  const max = Math.max(...data)
  const min = Math.min(...data)
  const coords = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * h * 0.85 - 8
    return [x, y]
  })
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `0,${h} ${line} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height="100%">
      <defs>
        <linearGradient id="absFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#absFill)" />
      <polyline points={line} fill="none" stroke="#CCFF00" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Datos estáticos ──────────────────────────────────────────────────────────
const UNITS = [
  { id: 'PNT-014', proyecto: 'Torre Piantini', piso: '14', m2: 142, estado: 'Libre', trend: [2, 3, 3, 5, 4, 6, 7] },
  { id: 'PNT-021', proyecto: 'Torre Piantini', piso: '21', m2: 98, estado: 'Reservado', trend: [4, 4, 5, 5, 6, 6, 6] },
  { id: 'NCO-007', proyecto: 'Naco Residences', piso: '07', m2: 110, estado: 'Libre', trend: [6, 5, 6, 7, 7, 8, 9] },
  { id: 'NCO-012', proyecto: 'Naco Residences', piso: '12', m2: 156, estado: 'Vendido', trend: [3, 4, 6, 6, 7, 9, 9] },
  { id: 'PNT-005', proyecto: 'Torre Piantini', piso: '05', m2: 87, estado: 'Reservado', trend: [5, 5, 4, 5, 6, 6, 7] },
]

const ZONES = [
  { zona: 'Piantini', coord: 'SDE · 18.47N', idx: '0.92', status: '[ ALTA ABSORCIÓN ]', nivel: 'alta' },
  { zona: 'Naco', coord: 'SDE · 18.46N', idx: '0.88', status: '[ ALTA ABSORCIÓN ]', nivel: 'alta' },
  { zona: 'Bella Vista', coord: 'SDE · 18.45N', idx: '0.61', status: '[ MEDIA ABSORCIÓN ]', nivel: 'media' },
  { zona: 'Los Cacicazgos', coord: 'SDE · 18.48N', idx: '0.57', status: '[ MEDIA ABSORCIÓN ]', nivel: 'media' },
  { zona: 'La Esperilla', coord: 'SDE · 18.47N', idx: '0.44', status: '[ ESTABLE ]', nivel: 'media' },
  { zona: 'Mirador Norte', coord: 'SDE · 18.49N', idx: '0.51', status: '[ ESTABLE ]', nivel: 'media' },
  { zona: 'Las Terrenas', coord: 'SAM · 19.31N', idx: '0.95', status: '[ ALTA PLUSVALÍA ]', nivel: 'alta' },
  { zona: 'Punta Cana', coord: 'LAA · 18.58N', idx: '0.97', status: '[ ALTA PLUSVALÍA ]', nivel: 'alta' },
]

const FLOOR_15: ('libre' | 'reservado' | 'vendido')[] = ['libre', 'vendido', 'vendido', 'libre', 'vendido', 'libre', 'vendido', 'vendido']
const FLOOR_14: ('libre' | 'reservado' | 'vendido')[] = ['libre', 'libre', 'reservado', 'libre', 'libre', 'vendido', 'libre', 'vendido']

const KANBAN = [
  { titulo: '01. LEAD', cards: [
    { nm: 'Maria Núñez', pr: 'Torre Piantini · 4A', am: 'US$250,000' },
    { nm: 'Seung Lee', pr: 'Naco Residences · 12', am: 'US$220,000' },
  ]},
  { titulo: '02. RESERVA', cards: [
    { nm: 'Eric Peña', pr: 'Torre Piantini · 21', am: 'US$210,000' },
  ]},
  { titulo: '03. CIERRE', cards: [
    { nm: 'Liz Betances', pr: 'Naco Residences · 07', am: 'US$195,000' },
  ]},
]

const LOG_EVENTS = [
  '[09:14] Broker Luz Minier reservó unidad PNT-014 — Torre Piantini',
  '[10:02] Cliente Maria Núñez firmó contrato — Naco Residences',
  '[11:47] Broker Clara Núñez cerró venta NCO-012 — US$210,000',
  '[13:15] Sistema liberó reserva vencida PNT-021',
]

const FAQS = [
  { q: '¿Necesito instalar algo?', a: 'No. SECTOR es 100% en la nube. Accedes desde tu computadora, tablet o celular desde cualquier lugar de Santo Domingo o el interior, sin descargar nada.' },
  { q: '¿Puedo usar SECTOR con mi equipo de brokers?', a: 'Sí. El sistema está hecho para constructoras con redes de venta externas. Cada broker puede tener acceso controlado a las unidades disponibles, con total trazabilidad de cada venta.' },
  { q: '¿Mis datos de proyectos están protegidos?', a: 'Totalmente. Implementamos encriptación de nivel bancario y políticas estrictas de privacidad en Supabase.' },
  { q: '¿Cómo migro mis unidades desde un Excel?', a: 'SECTOR cuenta con un proceso de importación rápido para tu inventario actual. Sube tu base de datos y estarás operando en minutos.' },
  { q: '¿Cómo funciona el envío por WhatsApp?', a: 'Desde la ficha de cualquier unidad en Mi Empresa, generas un PDF profesional listo para enviar directo a tu broker o cliente por WhatsApp.' },
  { q: '¿Hay un límite de proyectos o unidades?', a: 'Ninguno. Sube todo el inventario de preventas y proyectos en construcción que manejes.' },
]

const PILL_CLASS: Record<string, string> = {
  Libre: 'pill libre',
  Reservado: 'pill reservado',
  Vendido: 'pill vendido',
}

export default function Page() {
  const typed = useCyclingTypewriter(['constructoras.', 'ingenieros.', 'desarrolladoras.'])
  const [activeTab, setActiveTab] = useState<'a' | 'b' | 'c'>('a')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const clockRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const tick = () => {
      if (clockRef.current) clockRef.current.textContent = new Date().toLocaleTimeString('es-DO', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const guardarEmail = async () => {
    if (!email.trim()) return
    setCargando(true)
    await supabase.from('beta_emails').insert({ email: email.trim() })
    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="sector-landing">
      <style jsx global>{`
        .sector-landing {
          --mono: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
          --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #09090b;
          color: #fff;
          font-family: var(--sans);
          overflow-x: hidden;
        }
        .sector-landing * { box-sizing: border-box; }
        .sector-landing a { text-decoration: none; color: inherit; }
        .sector-landing button { font-family: inherit; cursor: pointer; }
        .frame { max-width: 1152px; margin: 0 auto; border-left: 1px solid #1a1a1a; border-right: 1px solid #1a1a1a; }
        .h-nav { position: sticky; top: 0; z-index: 20; background: rgba(0,0,0,0.92); backdrop-filter: blur(4px); border-bottom: 1px solid #1a1a1a; }
        .h-nav-inner { max-width: 1152px; margin: 0 auto; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
        .h-logo { display: flex; align-items: center; gap: 10px; }
        .h-logo-mark { width: 20px; height: 20px; border-radius: 3px; background: #CCFF00; display: flex; align-items: center; justify-content: center; }
        .h-logo-text { font-size: 15px; font-weight: 600; letter-spacing: -0.2px; }
        .h-status { display: none; align-items: center; gap: 6px; border: 1px solid #222; border-radius: 999px; padding: 4px 12px; font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.65); }
        @media (min-width: 640px) { .h-status { display: flex; } }
        .h-dot { width: 6px; height: 6px; border-radius: 50%; background: #CCFF00; flex-shrink: 0; }
        .h-status .acc { color: #CCFF00; letter-spacing: 0.3px; }
        .h-status .sep { color: #444; }
        .h-cta-btn { background: #fff; color: #000 !important; border: none; border-radius: 6px; padding: 7px 14px; font-size: 13px; font-weight: 500; transition: background .15s; }
        .h-cta-btn:hover { background: #CCFF00; color: #000 !important; }
        .h-hero { position: relative; border-bottom: 1px solid #1a1a1a; }
        .h-grid-bg { position: absolute; inset: 0; opacity: 0.35; pointer-events: none; background-image: linear-gradient(to right, #161616 1px, transparent 1px), linear-gradient(to bottom, #161616 1px, transparent 1px); background-size: 64px 64px; }
        .h-hero-row { position: relative; display: grid; grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .h-hero-row { grid-template-columns: 5fr 7fr; } }
        .h-copy { padding: 64px 24px; border-bottom: 1px solid #1a1a1a; display: flex; flex-direction: column; justify-content: center; }
        @media (min-width: 1024px) { .h-copy { padding: 96px 40px; border-bottom: none; border-right: 1px solid #1a1a1a; } }
        .h-badge { display: inline-flex; align-items: center; gap: 8px; width: fit-content; border: 1px solid #222; border-radius: 999px; padding: 5px 12px; font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.65); margin-bottom: 20px; }
        .h-badge svg { width: 12px; height: 12px; color: #CCFF00; }
        .h-title { font-size: 36px; font-weight: 500; line-height: 1.12; letter-spacing: -0.5px; margin: 0; }
        @media (min-width: 1024px) { .h-title { font-size: 48px; } }
        .h-title .acc { color: #CCFF00; }
        .h-cursor { display: inline-block; width: 1px; height: 0.9em; background: #CCFF00; margin-left: 2px; vertical-align: -2px; animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .h-desc { max-width: 420px; margin: 20px 0 0; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.6); }
        .h-actions { display: flex; align-items: center; gap: 16px; margin-top: 32px; }
        .h-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #CCFF00; color: #000 !important; border: none; border-radius: 6px; padding: 10px 16px; font-size: 14px; font-weight: 500; transition: transform .15s; }
        .h-btn-primary:hover { transform: translateX(2px); color: #000 !important; }
        .h-btn-primary svg { color: #000; stroke: #000; }
        .h-btn-secondary { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: rgba(255,255,255,0.65); font-size: 14px; transition: color .15s; }
        .h-btn-secondary:hover { color: #fff; }
        .h-stats { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; border: 1px solid #1a1a1a; font-family: var(--mono); }
        .h-stat { background: #0a0a0a; padding: 12px; }
        .h-stat-num { font-size: 16px; font-weight: 600; color: #fff; }
        .h-stat-label { margin-top: 2px; font-size: 10px; line-height: 1.3; color: rgba(255,255,255,0.55); }
        .h-artifact-wrap { display: flex; align-items: center; justify-content: center; background: #050505; padding: 48px 24px; }
        @media (min-width: 1024px) { .h-artifact-wrap { padding: 64px 40px; } }
        .h-monitor { width: 100%; max-width: 560px; border: 1px solid #222; border-radius: 8px; background: #0a0a0a; box-shadow: 0 40px 80px -40px rgba(0,0,0,0.9); overflow: hidden; }
        .h-monitor-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1a1a1a; padding: 10px 16px; }
        .h-monitor-dots { display: flex; gap: 6px; }
        .h-monitor-dots span { width: 8px; height: 8px; border-radius: 50%; background: #2a2a2a; }
        .h-monitor-url { font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.5); }
        .h-monitor-live { font-family: var(--mono); font-size: 11px; color: #CCFF00; }
        .h-monitor-body { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .h-monitor-body { grid-template-columns: 1fr 120px; } }
        .h-table-col { border-bottom: 1px solid #1a1a1a; }
        @media (min-width: 640px) { .h-table-col { border-bottom: none; border-right: 1px solid #1a1a1a; } }
        .h-table-head { padding: 10px 16px; font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.55); border-top: 1px solid #1a1a1a; }
        table.h-table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 11px; }
        table.h-table th { padding: 6px 16px; text-align: left; color: rgba(255,255,255,0.5); font-weight: 400; border-bottom: 1px solid #1a1a1a; }
        table.h-table th:last-child { text-align: right; }
        table.h-table td { padding: 8px 16px; border-bottom: 1px solid #141414; vertical-align: middle; }
        table.h-table tr:last-child td { border-bottom: none; }
        .unit-id { color: #fff; }
        .unit-meta { font-size: 10px; color: rgba(255,255,255,0.55); margin-top: 1px; }
        .pill { display: inline-block; border-radius: 3px; padding: 2px 6px; font-size: 10px; border: 1px solid; }
        .pill.libre { color: #CCFF00; border-color: rgba(204,255,0,0.3); background: rgba(204,255,0,0.06); }
        .pill.reservado { color: #888; border-color: #333; background: rgba(255,255,255,0.02); }
        .pill.vendido { color: #555; border-color: #222; background: transparent; }
        .h-abs-col { padding: 16px; display: flex; flex-direction: column; }
        .h-abs-label { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.55); }
        .h-abs-label svg { width: 12px; height: 12px; color: #CCFF00; }
        .h-abs-num { margin-top: 4px; font-family: var(--mono); font-size: 20px; font-weight: 600; color: #fff; }
        .h-abs-delta { font-family: var(--mono); font-size: 10px; color: #CCFF00; }
        .h-abs-chart { margin-top: 12px; height: 80px; width: 100%; }
        .h-abs-dates { margin-top: auto; display: flex; justify-content: space-between; font-family: var(--mono); font-size: 9px; color: rgba(255,255,255,0.45); }
        .sec { border-bottom: 1px solid #1a1a1a; padding: 56px 24px; }
        @media (min-width: 1024px) { .sec { padding: 72px 40px; } }
        .sec-eyebrow { font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 1px; }
        .sec-eyebrow .n { color: #CCFF00; }
        .sec-title { font-size: 26px; font-weight: 500; letter-spacing: -0.3px; margin: 8px 0 0; }
        @media (min-width: 1024px) { .sec-title { font-size: 30px; } }
        .sec-desc { margin: 10px 0 0; max-width: 480px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); }
        .loc-row { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 32px; }
        @media (min-width: 1024px) { .loc-row { grid-template-columns: 4fr 8fr; gap: 0; margin-top: 40px; } }
        .loc-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1a1a1a; border: 1px solid #1a1a1a; }
        @media (min-width: 640px) { .loc-matrix { grid-template-columns: 1fr 1fr 1fr 1fr; } }
        .loc-node { background: #0a0a0a; padding: 14px 16px; font-family: var(--mono); }
        .loc-node .zone { font-size: 12px; color: #fff; }
        .loc-node .coord { margin-top: 2px; font-size: 10px; color: rgba(255,255,255,0.45); }
        .loc-node .idx { margin-top: 12px; font-size: 18px; font-weight: 600; color: #fff; }
        .loc-node .status { margin-top: 4px; font-size: 10px; letter-spacing: 0.3px; }
        .loc-node .status.alta { color: #CCFF00; }
        .loc-node .status.media { color: rgba(255,255,255,0.65); }
        .tabs-row { display: flex; gap: 0; margin-top: 32px; border: 1px solid #1a1a1a; border-bottom: none; }
        .tab-btn { flex: 1; background: #0a0a0a; border: none; border-right: 1px solid #1a1a1a; color: rgba(255,255,255,0.5); font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 14px; text-align: left; transition: color .15s, background .15s; }
        .tab-btn:last-child { border-right: none; }
        .tab-btn .lbl { display: block; color: #fff; font-size: 12px; font-family: var(--sans); text-transform: none; margin-top: 3px; }
        .tab-btn.active { background: #111; color: #CCFF00; }
        .tab-btn.active .lbl { color: #fff; }
        .tab-panel { border: 1px solid #1a1a1a; background: #0a0a0a; padding: 24px; }
        .floor-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #1a1a1a; }
        .floor-row:last-child { border-bottom: none; }
        .floor-label { font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.55); width: 52px; flex-shrink: 0; }
        .floor-units { display: flex; gap: 4px; flex: 1; flex-wrap: wrap; }
        .unit-sq { width: 22px; height: 22px; border-radius: 2px; border: 1px solid; flex-shrink: 0; }
        .unit-sq.libre { border-color: rgba(204,255,0,0.5); background: rgba(204,255,0,0.08); }
        .unit-sq.reservado { border-color: #333; background: #1c1c1c; }
        .unit-sq.vendido { border-color: #222; background: #161616; }
        .floor-summary { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.55); white-space: nowrap; }
        .floor-summary .acc { color: #CCFF00; }
        .floor-legend { display: flex; gap: 16px; margin-top: 16px; font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.55); }
        .floor-legend span { display: inline-flex; align-items: center; gap: 6px; }
        .leg-sq { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
        .kanban { display: grid; grid-template-columns: 1fr; gap: 1px; background: #1a1a1a; }
        @media (min-width: 768px) { .kanban { grid-template-columns: 1fr 1fr 1fr; } }
        .kanban-col { background: #0a0a0a; padding: 14px; }
        .kanban-head { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 0.5px; margin-bottom: 12px; }
        .kanban-card { border: 1px solid #1a1a1a; border-radius: 4px; padding: 10px 12px; margin-bottom: 8px; }
        .kanban-card .nm { font-size: 12px; color: #fff; }
        .kanban-card .pr { font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,0.55); margin-top: 3px; }
        .kanban-card .am { font-family: var(--mono); font-size: 11px; color: #CCFF00; margin-top: 4px; }
        .log-list { font-family: var(--mono); font-size: 12px; line-height: 1.9; }
        .log-list .t { color: rgba(255,255,255,0.5); margin-right: 8px; }
        .log-list div { color: #999; }
        .log-cursor { margin-top: 8px; color: #CCFF00; }
        .log-cursor .blk { display: inline-block; width: 6px; height: 12px; background: #CCFF00; margin-left: 4px; vertical-align: -2px; animation: blink 1s step-end infinite; }
        .faq-row { margin-top: 24px; }
        .faq-item { border-top: 1px solid #1a1a1a; }
        .faq-item:last-child { border-bottom: 1px solid #1a1a1a; }
        .faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: none; border: none; color: #ddd; font-size: 13px; text-align: left; padding: 16px 0; }
        .faq-chevron { width: 14px; height: 14px; color: #666; flex-shrink: 0; transition: transform .15s; }
        .faq-item.open .faq-chevron { transform: rotate(180deg); color: #CCFF00; }
        .faq-a { overflow: hidden; transition: max-height .2s ease; }
        .faq-a p { font-size: 13px; line-height: 1.65; color: rgba(255,255,255,0.6); margin: 0; padding: 0 0 18px; max-width: 600px; }
        .cta-sec { padding: 56px 24px; }
        .cta-box { background: #0e0e0e; border: 1px solid #1a1a1a; border-radius: 6px; padding: 32px 28px; display: flex; flex-direction: column; gap: 18px; }
        @media (min-width: 768px) { .cta-box { flex-direction: row; align-items: center; justify-content: space-between; padding: 36px 40px; } }
        .cta-copy h2 { font-size: 20px; font-weight: 500; margin: 0; letter-spacing: -0.2px; }
        .cta-copy p { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.6); max-width: 360px; }
        .cta-form { display: flex; gap: 10px; flex-direction: column; }
        @media (min-width: 480px) { .cta-form { flex-direction: row; } }
        .cta-input { background: #050505; border: 1px solid #222; border-radius: 4px; padding: 10px 14px; font-size: 13px; color: #fff; min-width: 220px; }
        .cta-input::placeholder { color: #555; }
        .foot-email { color: rgba(255,255,255,0.5); text-decoration: none; transition: color .15s; }
        .foot-email:hover { color: #CCFF00; }
        .cta-btn { background: #CCFF00; color: #000; border: none; border-radius: 4px; padding: 10px 18px; font-size: 13px; font-weight: 500; white-space: nowrap; }
        .cta-btn:disabled { opacity: 0.6; }
        .foot { padding: 24px; text-align: center; font-family: var(--mono); font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.5px; }
      `}</style>

      <header className="h-nav">
        <div className="h-nav-inner">
          <div className="h-logo">
            <Image src="/sector-logo.png" alt="SECTOR" width={1520} height={311} priority style={{ height: '36px', width: 'auto', maxWidth: 'none', maxHeight: 'none', display: 'block' }} />
          </div>
          <div className="h-status">
            <span className="h-dot" />
            <span className="acc">STATUS: LIVE</span>
            <span className="sep">·</span>
            <span ref={clockRef} />
          </div>
          <Link href="/dashboard" className="h-cta-btn" style={{ color: '#000', position: 'relative', top: '3px' }}>Acceder</Link>
        </div>
      </header>

      <div className="frame">
        {/* HERO */}
        <section className="h-hero">
          <div className="h-grid-bg" />
          <div className="h-hero-row">
            <div className="h-copy">
              <div className="h-badge">
                <MapPin size={12} />
                <span>Hecho para constructoras dominicanas</span>
              </div>
              <h1 className="h-title">
                El sistema de control<br />
                de inventario para <span className="acc">{typed}</span><span className="h-cursor" />
              </h1>
              <p className="h-desc">Un solo lugar para tu inventario, tus finanzas y tu pipeline. Datos en tiempo real sobre cada unidad, cada torre, cada proyecto — sin hojas de Excel que se desactualizan.</p>
              <div className="h-actions">
                <a href="#contacto" className="h-btn-primary" style={{ color: '#000' }}>Solicitar acceso <ArrowUpRight size={14} color="#000" /></a>
                <a href="#modulos" className="h-btn-secondary">Ver demo <ChevronRight size={14} /></a>
              </div>
              <div className="h-stats">
                <div className="h-stat"><div className="h-stat-num">1,204</div><div className="h-stat-label">unidades activas</div></div>
                <div className="h-stat"><div className="h-stat-num">38</div><div className="h-stat-label">proyectos</div></div>
                <div className="h-stat"><div className="h-stat-num">99.2%</div><div className="h-stat-label">uptime</div></div>
              </div>
            </div>
            <div className="h-artifact-wrap">
              <div className="h-monitor">
                <div className="h-monitor-bar">
                  <div className="h-monitor-dots"><span /><span /><span /></div>
                  <span className="h-monitor-url">sector.do/inventario</span>
                  <span className="h-monitor-live">● live</span>
                </div>
                <div className="h-monitor-body">
                  <div className="h-table-col">
                    <div className="h-table-head">Inventario · 2 proyectos</div>
                    <table className="h-table">
                      <thead><tr><th>Unidad</th><th>m²</th><th>Estado</th><th>30d</th></tr></thead>
                      <tbody>
                        {UNITS.map((u) => (
                          <tr key={u.id}>
                            <td><div className="unit-id">{u.id}</div><div className="unit-meta">{u.proyecto} · piso {u.piso}</div></td>
                            <td>{u.m2}</td>
                            <td><span className={PILL_CLASS[u.estado]}>{u.estado}</span></td>
                            <td style={{ textAlign: 'right' }}><Sparkline data={u.trend} positive={u.estado !== 'Vendido'} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="h-abs-col">
                    <div className="h-abs-label"><TrendingUp size={12} />Absorción</div>
                    <div className="h-abs-num">65%</div>
                    <div className="h-abs-delta">+12.4% · 30d</div>
                    <div className="h-abs-chart"><AbsorptionChart /></div>
                    <div className="h-abs-dates"><span>1 may</span><span>30 may</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 01 — LOCALIZACION */}
        <section className="sec">
          <div className="sec-eyebrow"><span className="n">01</span> · Cobertura geográfica</div>
          <div className="loc-row">
            <div>
              <h2 className="sec-title">Densidad y plusvalía.</h2>
              <p className="sec-desc">SECTOR está calibrado con los nodos donde se concentra la actividad inmobiliaria real del país — desde las torres de Santo Domingo hasta los polos turísticos de mayor inversión.</p>
            </div>
            <div className="loc-matrix">
              {ZONES.map((z) => (
                <div className="loc-node" key={z.zona}>
                  <div className="zone">{z.zona}</div>
                  <div className="coord">{z.coord}</div>
                  <div className="idx">{z.idx}</div>
                  <div className={`status ${z.nivel}`}>{z.status}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 — PIPELINE TECNICO */}
        <section className="sec" id="modulos">
          <div className="sec-eyebrow"><span className="n">02</span> · Operación</div>
          <h2 className="sec-title">Tres módulos. Un solo sistema.</h2>
          <p className="sec-desc">Inventario, ventas y red de brokers conectados entre sí — sin hojas sueltas ni reportes manuales.</p>

          <div className="tabs-row">
            <button className={`tab-btn ${activeTab === 'a' ? 'active' : ''}`} onClick={() => setActiveTab('a')}>MÓDULO A<span className="lbl">Control de unidades</span></button>
            <button className={`tab-btn ${activeTab === 'b' ? 'active' : ''}`} onClick={() => setActiveTab('b')}>MÓDULO B<span className="lbl">Pipeline comercial</span></button>
            <button className={`tab-btn ${activeTab === 'c' ? 'active' : ''}`} onClick={() => setActiveTab('c')}>MÓDULO C<span className="lbl">Red de brokers</span></button>
          </div>

          {activeTab === 'a' && (
            <div className="tab-panel">
              <div className="floor-row">
                <div className="floor-label">Piso 15</div>
                <div className="floor-units">{FLOOR_15.map((s, i) => <div key={i} className={`unit-sq ${s}`} />)}</div>
                <div className="floor-summary"><span className="acc">3</span> libres / 5 vendidas</div>
              </div>
              <div className="floor-row">
                <div className="floor-label">Piso 14</div>
                <div className="floor-units">{FLOOR_14.map((s, i) => <div key={i} className={`unit-sq ${s}`} />)}</div>
                <div className="floor-summary"><span className="acc">6</span> libres / 2 vendidas</div>
              </div>
              <div className="floor-legend">
                <span><span className="leg-sq" style={{ border: '1px solid rgba(204,255,0,0.5)', background: 'rgba(204,255,0,0.08)' }} />Libre</span>
                <span><span className="leg-sq" style={{ background: '#1c1c1c', border: '1px solid #333' }} />Reservado</span>
                <span><span className="leg-sq" style={{ background: '#161616', border: '1px solid #222' }} />Vendido</span>
              </div>
            </div>
          )}

          {activeTab === 'b' && (
            <div className="tab-panel">
              <div className="kanban">
                {KANBAN.map((col) => (
                  <div className="kanban-col" key={col.titulo}>
                    <div className="kanban-head">{col.titulo}</div>
                    {col.cards.map((c) => (
                      <div className="kanban-card" key={c.nm}>
                        <div className="nm">{c.nm}</div>
                        <div className="pr">{c.pr}</div>
                        <div className="am">{c.am}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'c' && (
            <div className="tab-panel">
              <div className="log-list">
                {LOG_EVENTS.map((line, i) => {
                  const close = line.indexOf(']') + 1
                  return <div key={i}><span className="t">{line.slice(0, close)}</span>{line.slice(close)}</div>
                })}
                <div className="log-cursor">&gt; esperando próximo evento<span className="blk" /></div>
              </div>
            </div>
          )}
        </section>

        {/* 03 — FAQ */}
        <section className="sec">
          <div className="sec-eyebrow"><span className="n">03</span> · Soporte</div>
          <h2 className="sec-title">Preguntas frecuentes.</h2>
          <div className="faq-row">
            {FAQS.map((f, i) => (
              <div className={`faq-item ${faqOpen === i ? 'open' : ''}`} key={f.q}>
                <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {f.q}
                  <ChevronDown className="faq-chevron" />
                </button>
                <div className="faq-a" style={{ maxHeight: faqOpen === i ? 160 : 0 }}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — CTA */}
        <section className="cta-sec" id="contacto">
          <div className="cta-box">
            <div className="cta-copy">
              <h2>Solicitar credenciales de acceso.</h2>
              <p>Configuramos tu inventario inicial y te damos acceso directo, sin intermediarios.</p>
            </div>
            <div className="cta-form">
              <input
                className="cta-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={cargando || enviado}
              />
              <button className="cta-btn" onClick={guardarEmail} disabled={cargando || enviado}>
                {enviado ? 'Solicitado ✓' : cargando ? 'Enviando...' : 'Solicitar acceso'}
              </button>
            </div>
          </div>
        </section>

        <footer className="foot">
          © 2026 SECTOR · CRM para constructoras · República Dominicana
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          <a href="mailto:ventas@sector.do" className="foot-email">ventas@sector.do</a>
        </footer>
      </div>
    </div>
  )
}
