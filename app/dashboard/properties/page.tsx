'use client'
import { useEffect, useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { GoogleMapsEmbed } from '@next/third-parties/google'

type PropertyEstado = 'disponible' | 'en_proceso' | 'vendida' | 'rentada' | 'reservada'
type PropertyType = 'APARTAMENTO' | 'CASA' | 'LOCAL' | 'TERRENO' | 'OFICINA' | 'BODEGA'

type Property = {
  id: string
  title: string
  price: string
  location: string
  type: PropertyType
  sector: string
  estado: PropertyEstado
  m2?: number
  recamaras?: number
  banos?: number
  estacionamientos?: number
  descripcion?: string
  imagenes?: string[]
  moneda: string
  created_at?: string
}

const SECTORES = [
  'Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos',
  'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millon', 'Mirador Norte', 'Mirador Sur',
  'Paraíso', 'La Castellana', 'Jardines del Norte', 'Los Prados', 'Gazcue', 'Ensanche Quisqueya',
  'Los Restauradores', 'Zona Colonial', 'Arroyo Manzano', 'Colinas de los Ríos', 'Fernández', 'Renacimiento',
  'Alma Rosa I', 'Alma Rosa II', 'Ensanche Ozama', 'San Isidro', 'Ensanche Isabelita', 'Prado Oriental',
  'Los Tres Ojos', 'Corales del Sur', 'Mirador del Este', 'Riviera del Caribe', 'Cerros del Ozama', 'Las Américas',
  'Palmarejo', 'Don Honorio', 'El Condado', 'Los Girasoles', 'Villa Mella', 'Ciudad Real',
  'La Isabela', 'Brisas del Norte', 'Los Alcarrizos', 'San Felipe', 'Colinas del Norte', 'Reparto Universitario',
  'Manoguayabo', 'Mirador del Oeste', 'Villa Aura', 'Herrera', 'Engombe', 'Los Hidalgos',
  'Pantoja', 'Las Caobas', 'Avenida Monumental', 'Alameda',
]

const TIPOS: PropertyType[] = ['APARTAMENTO','CASA','LOCAL','TERRENO','OFICINA','BODEGA']

const ESTADOS: { value: PropertyEstado; label: string; color: string; dot: string }[] = [
  { value: 'disponible', label: 'Disponible', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  { value: 'reservada',  label: 'Reservada',  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',    dot: 'bg-amber-400' },
  { value: 'en_proceso', label: 'En proceso', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       dot: 'bg-blue-400' },
  { value: 'rentada',    label: 'Rentada',    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  { value: 'vendida',    label: 'Vendida',    color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',       dot: 'bg-zinc-400' },
]

const EMPTY_FORM = {
  title: '', 
  price: '', 
  location: '', 
  type: 'APARTAMENTO' as PropertyType,
  sector: '', 
  estado: 'disponible' as PropertyEstado, 
  m2: '',
  recamaras: '', 
  banos: '', 
  estacionamientos: '', 
  descripcion: '', 
  moneda: 'USD', 
  imagenes: [] as string[]
}

type FormData = typeof EMPTY_FORM

function formatPrice(price: string, moneda = 'USD') {
  const num = parseFloat(price.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return price || '—'
  return new Intl.NumberFormat('es-DO', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0,
  }).format(num)
}

function BadgeEstado({ estado }: { estado: string }) {
  const info = ESTADOS.find(e => e.value === estado) ?? ESTADOS[0]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${info.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  )
}

// ── Modal de Vista Detalle con Google Maps ───────────────────────────────────
interface ViewModalProps {
  open: boolean
  property: Property | null
  onClose: () => void
}

function PropertyViewModal({ open, property: p, onClose }: ViewModalProps) {
  if (!open || !p) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-950 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-800 p-6 max-h-[92vh] overflow-y-auto flex flex-col gap-5 shadow-2xl text-white">
        
        {/* Cabecera */}
        <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
          <div>
            <span className="text-[9px] text-[#CCFF00] font-mono tracking-wider uppercase border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-2 py-0.5 rounded">
              {p.type}
            </span>
            <h2 className="text-xl font-bold mt-2">{p.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white h-8 w-8 rounded-full flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        {/* Características */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 font-mono">
          <div><span className="block font-bold text-sm text-white">{p.recamaras ?? 0}</span> Hab</div>
          <div><span className="block font-bold text-sm text-white">{p.banos ?? 0}</span> Baños</div>
          <div><span className="block font-bold text-sm text-white">{p.estacionamientos ?? 0}</span> Parq</div>
          <div><span className="block font-bold text-sm text-white">{p.m2 ?? 0}</span> m²</div>
        </div>

        {/* Detalles financieros y dirección */}
        <div className="text-xs space-y-2 text-zinc-400 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900/50">
          <p><strong className="text-white">Dirección:</strong> {p.location || 'No especificada'} {p.sector ? `(${p.sector})` : ''}</p>
          <p><strong className="text-white">Precio:</strong> <span className="text-[#CCFF00] font-bold text-sm">{formatPrice(p.price, p.moneda)}</span></p>
          {p.descripcion && <p className="mt-2 border-t border-zinc-800 pt-2"><strong className="text-white">Descripción:</strong> {p.descripcion}</p>}
        </div>

                {/* --- MAPA DE GOOGLE EMBED --- */}
        <div className="w-full h-[240px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
          <div className="absolute top-2.5 left-2.5 z-10 bg-black/80 backdrop-blur-sm text-[9px] text-[#CCFF00] font-mono px-2.5 py-1 rounded-full border border-zinc-800">
            📍 {p.sector || 'Santo Domingo'}
          </div>

          <GoogleMapsEmbed
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''}
            height="100%"
            width="100%"
            mode="place"
            q={`${p.location || p.sector || ''}, Santo Domingo, Republica Dominicana`}
            allowfullscreen={true}
            style={{ border: 0, margin: 0, padding: 0, width: '100%', height: '100%', filter: 'invert(90%) hue-rotate(180deg) saturate(150%)' }}
          />
        </div>

            {/* Botón de ruta en tiempo real */}
      <button 
        onClick={() => {
          const direccionCompleta = `${p.location || p.sector}, Santo Domingo, Republica Dominicana`;
          const targetUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
          window.open(targetUrl, '_blank');
        }}
        className="w-full bg-[#CCFF00] hover:bg-[#b3df00] text-black font-bold py-3 rounded-xl transition-colors text-xs tracking-wide uppercase font-mono shadow-md shadow-[#CCFF00]/10"
      >
        Iniciar Navegación GPS
      </button>

    </div>
  </div>
)
}

// ── Modal Formulario (Crear/Editar) ──────────────────────────────────────────

interface ModalProps {
  open: boolean
  initial?: Property | null
  onClose: () => void
  onSave: (form: FormData) => Promise<void>
}

function PropertyModal({ open, initial, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tempUrl, setTempUrl] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? '',
        price: initial.price ?? '',
        location: initial.location ?? '',
        type: initial.type ?? 'APARTAMENTO',
        sector: initial.sector ?? '',
        estado: initial.estado ?? 'disponible',
        m2: initial.m2?.toString() ?? '',
        recamaras: initial.recamaras?.toString() ?? '',
        banos: initial.banos?.toString() ?? '',
        estacionamientos: initial.estacionamientos?.toString() ?? '',
        descripcion: initial.descripcion ?? '',
        imagenes: initial.imagenes ?? [],
        moneda: initial.moneda ?? 'USD',
      })
      setTempUrl(initial.imagenes?.[0] ?? '')
    } else {
      setForm(EMPTY_FORM)
      setTempUrl('')
    }
    setError('')
  }, [initial, open])

  if (!open) return null

  const set = (k: keyof FormData, v: any) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    setSaving(true)
    setError('')
    try {
      const finalImages = tempUrl.trim()
        ? [...new Set([tempUrl.trim(), ...form.imagenes.filter(u => u && u !== tempUrl.trim())])]
        : form.imagenes
      await onSave({ ...form, imagenes: finalImages })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700 focus:border-[#CCFF00] outline-none text-sm w-full placeholder:text-zinc-500 transition-colors'
  const labelCls = 'text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1 block'

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
          <h2 className="text-lg font-black text-[#CCFF00] uppercase tracking-tight">
            {initial ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Título *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ej: Penthouse en Piantini" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.type} onChange={e => set('type', e.target.value as PropertyType)} className={inputCls}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value as PropertyEstado)} className={inputCls}>
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Precio</label>
              <input value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="350000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Moneda</label>
              <select value={form.moneda} onChange={e => set('moneda', e.target.value)} className={inputCls}>
                <option value="USD">USD</option>
                <option value="DOP">DOP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Sector</label>
              <select value={form.sector} onChange={e => set('sector', e.target.value)} className={inputCls}>
                <option value="">Sin sector</option>
                {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Ubicación</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="Av. Winston Churchill" className={inputCls} />
              <p className="text-zinc-600 text-[10px] mt-1">📍 Dirección completa para ubicar en el mapa con precisión</p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Características</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'recamaras', label: '🛏', placeholder: 'Rec.' },
                { key: 'banos', label: '🚿', placeholder: 'Baños' },
                { key: 'estacionamientos', label: '🚗', placeholder: 'Est.' },
                { key: 'm2', label: '📐', placeholder: 'm²' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">{label}</span>
                  <input type="number" min={0}
                    value={form[key as keyof FormData] as string}
                    onChange={e => set(key as keyof FormData, e.target.value)}
                    placeholder={placeholder}
                    className={`${inputCls} pl-8 text-center`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Fotos de la propiedad</label>
            <div className="space-y-2">
              {(form.imagenes.length > 0 ? form.imagenes : ['']).map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={url}
                    onChange={e => {
                      const arr = [...form.imagenes]
                      if (arr.length === 0) arr.push('')
                      arr[i] = e.target.value
                      set('imagenes', arr)
                    }}
                    placeholder={i === 0 ? 'URL foto principal...' : `URL foto ${i + 1}...`}
                    className={inputCls}
                  />
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => set('imagenes', form.imagenes.filter((_, j) => j !== i))}
                      className="px-3 bg-zinc-800 text-red-400 rounded-xl hover:bg-zinc-700 transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => set('imagenes', [...form.imagenes, ''])}
                className="w-full py-2 border border-dashed border-zinc-700 text-zinc-500 text-xs rounded-xl hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
              >
                + Agregar otra foto
              </button>
            </div>
            {form.imagenes && form.imagenes.filter(url => url.trim() !== '').length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {form.imagenes
                  .filter(url => url.trim() !== '')
                  .map((url, index) => (
                    <div key={index} className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={3} placeholder="Detalles de la propiedad..."
              className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#CCFF00] text-black py-3 rounded-xl font-black text-sm uppercase hover:bg-white transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear propiedad'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────────

interface CardProps {
  property: Property
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

function PropertyCard({ property: p, onClick, onEdit, onDelete }: CardProps) {
  const hasMeta = p.recamaras || p.banos || p.estacionamientos || p.m2
  const imagenPrincipal = p.imagenes && p.imagenes.length > 0 ? p.imagenes[0] : null

  return (
    <div onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-[#CCFF00]/50 transition-all group relative">
      {imagenPrincipal ? (
        <div className="h-44 overflow-hidden">
          <img src={imagenPrincipal} alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-44 bg-zinc-800 flex items-center justify-center">
          <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21V12h6v9" />
          </svg>
        </div>
      )}

      <div className="absolute top-3 left-3">
        <BadgeEstado estado={p.estado ?? 'disponible'} />
      </div>

      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={onEdit}
          className="p-1.5 bg-zinc-900/90 backdrop-blur-sm rounded-lg text-zinc-400 hover:text-[#CCFF00] border border-zinc-700 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button onClick={onDelete}
          className="p-1.5 bg-zinc-900/90 backdrop-blur-sm rounded-lg text-zinc-400 hover:text-red-400 border border-zinc-700 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 transition-colors group-hover:text-[#CCFF00]">{p.title}</h3>
          <span className="shrink-0 text-zinc-400 text-[10px] uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded-md font-bold">
            {p.type}
          </span>
        </div>

        {(p.location || p.sector) && (
          <p className="text-zinc-300 text-xs mb-3 flex items-center gap-1 font-medium">
            <svg className="w-3 h-3 shrink-0 text-[#CCFF00]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{[p.location, p.sector].filter(Boolean).join(' · ')}</span>
          </p>
        )}

        {hasMeta && (
          <div className="flex gap-3 text-xs text-zinc-400 mb-3 flex-wrap">
            {p.recamaras != null && <span>🛏 {p.recamaras}</span>}
            {p.banos != null && <span>🚿 {p.banos}</span>}
            {p.estacionamientos != null && <span>🚗 {p.estacionamientos}</span>}
            {p.m2 != null && <span>📐 {p.m2} m²</span>}
          </div>
        )}

        <div className="border-t border-zinc-800 pt-3 mt-3">
          <span className="text-[#CCFF00] font-black text-base">
            {formatPrice(p.price, p.moneda)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Stats ──────────────────────────────────────────────────────────────────────

function StatsBar({ properties }: { properties: Property[] }) {
  const stats = useMemo(() => ({
    total: properties.length,
    disponibles: properties.filter(p => p.estado === 'disponible').length,
    en_proceso: properties.filter(p => p.estado === 'en_proceso' || p.estado === 'reservada').length,
    vendidas: properties.filter(p => p.estado === 'vendida' || p.estado === 'rentada').length,
  }), [properties])

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total',       value: stats.total,       color: 'text-white' },
        { label: 'Disponibles', value: stats.disponibles, color: 'text-emerald-400' },
        { label: 'En proceso',  value: stats.en_proceso,  color: 'text-[#CCFF00]' },
        { label: 'Cerradas',    value: stats.vendidas,    color: 'text-zinc-400' },
      ].map(s => (
        <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-0.5">{s.label}</p>
          <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────────

function PropertiesContent() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sectorActivo, setSectorActivo] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setSectorActivo(searchParams.get('sector') || '')
  }, [searchParams])

  useEffect(() => { fetchProperties() }, [])

  async function fetchProperties() {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties').select('*').order('created_at', { ascending: false })
    if (!error && data) setProperties(data)
    setLoading(false)
  }

  async function handleSave(form: FormData) {
    const payload = {
      title: form.title,
      price: form.price ? parseFloat(form.price as string) : null,
      location: form.location,
      type: form.type,
      sector: form.sector,
      estado: form.estado,
      moneda: form.moneda,
      m2: form.m2 ? parseFloat(form.m2 as string) : null,
      recamaras: form.recamaras ? parseInt(form.recamaras as string) : null,
      banos: form.banos ? parseFloat(form.banos as string) : null,
      estacionamientos: form.estacionamientos ? parseInt(form.estacionamientos as string) : null,
      descripcion: form.descripcion || null,
      imagen_url: form.imagenes?.[0] || null,
      imagenes: form.imagenes || [],
    }

    try {
      if (editingProperty) {
        const { data, error } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', editingProperty.id)
          .select()
          .single()

        if (error) throw error
        setProperties(prev => prev.map(p => p.id === editingProperty.id ? data : p))
      } else {
        const { data, error } = await supabase
          .from('properties')
          .insert([payload])
          .select()
          .single()

        if (error) throw error
        setProperties(prev => [data, ...prev])
      }
    } catch (error) {
      console.error("Error al guardar en Supabase:", error)
      alert("Hubo un error al guardar la propiedad.")
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string, title: string) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${title}"?`)) return
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) setProperties(prev => prev.filter(p => p.id !== id))
  }

  function openEdit(e: React.MouseEvent, property: Property) {
    e.stopPropagation()
    setEditingProperty(property)
    setModalOpen(true)
  }

  function openNew() {
    setEditingProperty(null)
    setModalOpen(true)
  }

  function openView(property: Property) {
    setSelectedProperty(property)
    setViewOpen(true)
  }

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchSector = !sectorActivo || p.sector === sectorActivo
      const matchSearch = !search || [p.title, p.location, p.sector]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()))
      return matchSector && matchSearch
    })
  }, [properties, sectorActivo, search])

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-[#CCFF00] tracking-tighter uppercase mb-2">
            PROPIEDADES
          </h1>
          <div className="flex items-center gap-3">
            <a href="/listings" target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-[#CCFF00] text-zinc-300 hover:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver vitrina
            </a>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">
              {sectorActivo ? `${filtered.length} en ${sectorActivo}` : `${properties.length} unidades en total`}
            </p>
          </div>
        </div>
        <button onClick={openNew}
          className="bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-white transition-all shadow-lg shadow-[#CCFF00]/10">
          + Nueva
        </button>
      </div>

      {/* Stats */}
      {!loading && <StatsBar properties={properties} />}

      {/* Búsqueda */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, ubicación, sector..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#CCFF00] placeholder:text-zinc-600 transition-colors" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros sector */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSectorActivo('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${!sectorActivo ? 'bg-[#CCFF00] text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            Todos
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">🏙️ Distrito Nacional</span>
          <div className="flex gap-2 flex-wrap">
            {['Piantini','Naco','Bella Vista','Evaristo Morales','Serralles','Los Cacicazgos','Arroyo Hondo','Viejo Arroyo Hondo','La Esperilla','El Millon','Mirador Norte','Mirador Sur','Paraíso','La Castellana','Jardines del Norte','Los Prados','Gazcue','Ensanche Quisqueya','Los Restauradores','Zona Colonial','Arroyo Manzano','Colinas de los Ríos','Fernández','Renacimiento'].map(s => (
              <button key={s} onClick={() => setSectorActivo(sectorActivo === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${sectorActivo === s ? 'bg-[#CCFF00] text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">🌅 Santo Domingo Este</span>
          <div className="flex gap-2 flex-wrap">
            {['Alma Rosa I','Alma Rosa II','Ensanche Ozama','San Isidro','Ensanche Isabelita','Prado Oriental','Los Tres Ojos','Corales del Sur','Mirador del Este','Riviera del Caribe','Cerros del Ozama','Las Américas'].map(s => (
              <button key={s} onClick={() => setSectorActivo(sectorActivo === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${sectorActivo === s ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">🌇 Santo Domingo Norte</span>
          <div className="flex gap-2 flex-wrap">
            {['Palmarejo','Don Honorio','El Condado','Los Girasoles','Villa Mella','Ciudad Real','La Isabela','Brisas del Norte','Los Alcarrizos','San Felipe','Colinas del Norte','Reparto Universitario'].map(s => (
              <button key={s} onClick={() => setSectorActivo(sectorActivo === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${sectorActivo === s ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest">🌆 Santo Domingo Oeste</span>
          <div className="flex gap-2 flex-wrap">
            {['Manoguayabo','Mirador del Oeste','Villa Aura','Herrera','Engombe','Los Hidalgos','Pantoja','Las Caobas','Avenida Monumental','Alameda','Los Alcarrizos','Palmarejo'].map(s => (
              <button key={s} onClick={() => setSectorActivo(sectorActivo === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${sectorActivo === s ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-zinc-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-zinc-800 rounded-lg w-3/4" />
                <div className="h-3 bg-zinc-800 rounded-lg w-1/2" />
                <div className="h-5 bg-zinc-800 rounded-lg w-1/3 mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center">
          <svg className="w-10 h-10 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
          </svg>
          <p className="text-zinc-500 text-sm mb-4">
            {search || sectorActivo ? 'No hay propiedades con esos filtros.' : 'Aún no hay propiedades. ¡Crea la primera!'}
          </p>
          {!search && !sectorActivo && (
            <button onClick={openNew}
              className="px-4 py-2 bg-[#CCFF00] text-black text-sm font-black uppercase rounded-xl hover:bg-white transition-all">
              + Nueva propiedad
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              onClick={() => openView(p)}
              onEdit={e => openEdit(e, p)}
              onDelete={e => handleDelete(e, p.id, p.title)}
            />
          ))}
        </div>
      )}

      {/* Formulario Crear / Editar */}
      <PropertyModal
        open={modalOpen}
        initial={editingProperty}
        onClose={() => { setModalOpen(false); setEditingProperty(null) }}
        onSave={handleSave}
      />

      {/* Detalle de Visualización y Mapa */}
      <PropertyViewModal
        open={viewOpen}
        property={selectedProperty}
        onClose={() => { setViewOpen(false); setSelectedProperty(null) }}
      />
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-zinc-500">Cargando...</div>}>
      <PropertiesContent />
    </Suspense>
  )
}