"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase'

interface Propiedad {
  precio: number
  area_m2: number
  proyecto_id: string
  proyectos: { sector: string } | null
}

interface UnidadCatalogo {
  id: string
  numero: string
  piso: number | null
  torre: string | null
  tipo: string | null
  estado: string
  precio: number | null
  area_m2: number | null
  habitaciones: number | null
  banos: number | null
  proyecto_id: string
  proyecto_nombre?: string
  proyecto_sector?: string
}

export default function MercadoPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState<string>('admin')
  const [unidadesCatalogo, setUnidadesCatalogo] = useState<UnidadCatalogo[]>([])
  const [filtroZona, setFiltroZona] = useState<string>('todas')
  const [filtroEstado, setFiltroEstado] = useState<string>('libre')

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('constructora_id, rol')
        .eq('id', user.id)
        .single()

      setRol(profile?.rol || 'admin')

      const constructoraId = profile?.constructora_id
      if (!constructoraId) { setLoading(false); return }

      if (profile?.rol === 'broker') {
        const { data: proyectosData } = await supabase
          .from('proyectos')
          .select('id, nombre, sector')
          .eq('constructora_id', constructoraId)

        const proyectoIds = (proyectosData || []).map(p => p.id)
        const proyectoMap = Object.fromEntries((proyectosData || []).map(p => [p.id, { nombre: p.nombre, sector: p.sector }]))

        if (proyectoIds.length > 0) {
          const { data: unidadesData } = await supabase
            .from('unidades')
            .select('id, numero, piso, torre, tipo, estado, precio, area_m2, habitaciones, banos, proyecto_id')
            .in('proyecto_id', proyectoIds)
            .order('proyecto_id')
            .order('piso', { ascending: false })

          setUnidadesCatalogo((unidadesData || []).map(u => ({
            ...u,
            proyecto_nombre: proyectoMap[u.proyecto_id]?.nombre || '—',
            proyecto_sector: proyectoMap[u.proyecto_id]?.sector || '—',
          })))
        }
        setLoading(false)
        return
      }

      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('id, sector')
        .eq('constructora_id', constructoraId)

      if (!proyectos?.length) { setLoading(false); return }

      const proyectoIds = proyectos.map(p => p.id)

      const { data: unidades } = await supabase
        .from('unidades')
        .select('precio, area_m2, proyecto_id, proyectos(sector)')
        .in('proyecto_id', proyectoIds)
        .not('precio', 'is', null)

      if (unidades) {
        const mapeadas: Propiedad[] = unidades.map((u: any) => ({
          precio: u.precio,
          area_m2: u.area_m2,
          proyecto_id: u.proyecto_id,
          proyectos: { sector: Array.isArray(u.proyectos) ? u.proyectos[0]?.sector : u.proyectos?.sector }
        }))
        setPropiedades(mapeadas)
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const zonas = Array.from(new Set(propiedades.map(p => p.proyectos?.sector).filter(Boolean))).sort() as string[]

  const analisisPorZona = zonas.map(zona => {
    const props = propiedades.filter(p => p.proyectos?.sector === zona)
    const precios = props.map(p => Number(p.precio)).filter(p => p > 0)
    const preciosM2 = props
      .filter(p => Number(p.area_m2) > 0)
      .map(p => Number(p.precio) / Number(p.area_m2))
      .filter(v => v > 0)

    const promedio = precios.length ? precios.reduce((a, b) => a + b, 0) / precios.length : 0
    const minimo = precios.length ? Math.min(...precios) : 0
    const maximo = precios.length ? Math.max(...precios) : 0
    const promedioM2 = preciosM2.length ? preciosM2.reduce((a, b) => a + b, 0) / preciosM2.length : 0

    return { zona, total: props.length, promedio, minimo, maximo, promedioM2 }
  }).filter(z => z.total > 0).sort((a, b) => b.promedio - a.promedio)

  const totalPropiedades = propiedades.length
  const precioPromedioCRM = propiedades.length
    ? propiedades.reduce((a, p) => a + Number(p.precio), 0) / propiedades.length
    : 0

  const fmt = (n: number) => n > 0
    ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    : '-'

  const maxPromedio = Math.max(...analisisPorZona.map(z => z.promedio), 1)

  if (rol === 'broker') {
    const zonasBroker = [...new Set(unidadesCatalogo.map(u => u.proyecto_sector).filter(Boolean))] as string[]
    const unidadesFiltradas = unidadesCatalogo.filter(u => {
      const matchZona = filtroZona === 'todas' || u.proyecto_sector === filtroZona
      const matchEstado = filtroEstado === 'todas' || u.estado === filtroEstado
      return matchZona && matchEstado
    })

    return (
      <div className="text-zinc-100 font-sans space-y-8">
        <header className="border-b border-zinc-900 pb-6">
          <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Catálogo</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Proyectos</h1>
          <p className="text-zinc-400 text-sm mt-1">Inventario disponible para compartir con tus clientes</p>
        </header>

        <div className="flex gap-3 flex-wrap">
          <select value={filtroZona} onChange={e => setFiltroZona(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-[#CCFF00]">
            <option value="todas">Todas las zonas</option>
            {zonasBroker.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-[#CCFF00]">
            <option value="todas">Todos los estados</option>
            <option value="libre">Disponibles</option>
            <option value="reservada">Reservadas</option>
            <option value="vendida">Vendidas</option>
          </select>
          <span className="text-zinc-500 text-xs self-center">{unidadesFiltradas.length} unidades</span>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-sm">Cargando catálogo...</p>
        ) : unidadesFiltradas.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-sm">No hay unidades con estos filtros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unidadesFiltradas.map(u => {
              const msg = `Hola, te comparto información sobre la unidad ${u.numero} en ${u.proyecto_nombre} (${u.proyecto_sector}). ${u.habitaciones ? `${u.habitaciones} habitaciones, ` : ''}${u.area_m2 ? `${u.area_m2}m², ` : ''}${u.precio ? `US$ ${u.precio.toLocaleString()}` : ''}. ¿Te interesa más información?`
              const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`
              return (
                <div key={u.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 text-center shrink-0">
                    <span className="text-white font-black text-lg">{u.numero}</span>
                    <p className="text-zinc-500 text-[10px]">{u.torre ? `T${u.torre} · ` : ''}P{u.piso}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white text-sm font-semibold">{u.proyecto_nombre}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">{u.proyecto_sector}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        u.estado === 'libre' ? 'bg-[#CCFF00]/20 text-[#CCFF00]' :
                        u.estado === 'reservada' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-600/40 text-zinc-400'
                      }`}>{u.estado === 'libre' ? 'Disponible' : u.estado}</span>
                    </div>
                    <div className="flex gap-3 flex-wrap text-xs text-zinc-400">
                      {u.habitaciones && <span>{u.habitaciones} hab.</span>}
                      {u.banos && <span>{u.banos} baños</span>}
                      {u.area_m2 && <span>{u.area_m2} m²</span>}
                      {u.precio && <span className="text-[#CCFF00] font-semibold">US$ {u.precio.toLocaleString()}</span>}
                    </div>
                  </div>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Compartir
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6">
        <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inteligencia</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Análisis de Mercado</h1>
        <p className="text-white text-sm mt-1">Precios por zona basados en tu inventario</p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Propiedades</p>
          <p className="text-3xl font-black text-white mt-1">{totalPropiedades}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Precio Promedio</p>
          <p className="text-2xl font-black text-[#CCFF00] mt-1">{fmt(precioPromedioCRM)}</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5">
          <p className="text-xs font-mono text-white uppercase">Zonas Activas</p>
          <p className="text-3xl font-black text-white mt-1">{analisisPorZona.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-sm text-center py-20 font-mono animate-pulse">Cargando datos del mercado...</div>
      ) : analisisPorZona.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-white text-sm">No hay suficientes datos para el análisis.</p>
          <p className="text-white text-xs">Agrega más propiedades con ubicación y precio para ver el análisis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-mono text-white uppercase tracking-wider">Precios por Zona</h2>
          {analisisPorZona.map((z, i) => (
            <div key={z.zona} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-600">#{i + 1}</span>
                    <h3 className="font-black text-white">{z.zona}</h3>
                    <span className="text-[10px] font-mono bg-zinc-900 text-white px-2 py-0.5 rounded-full">{z.total} prop.</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white uppercase">Precio Promedio</p>
                  <p className="text-xl font-black text-[#CCFF00] font-mono">{fmt(z.promedio)}</p>
                </div>
              </div>

              {/* BARRA */}
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-[#CCFF00] rounded-full transition-all duration-700"
                  style={{ width: `${(z.promedio / maxPromedio) * 100}%` }} />
              </div>

              {/* DETALLES */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-mono text-white uppercase">Mínimo</p>
                  <p className="text-sm font-black text-white mt-1">{fmt(z.minimo)}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-mono text-white uppercase">Máximo</p>
                  <p className="text-sm font-black text-white mt-1">{fmt(z.maximo)}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-mono text-white uppercase">Precio/m²</p>
                  <p className="text-sm font-black text-white mt-1">{z.promedioM2 > 0 ? fmt(z.promedioM2) : '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
