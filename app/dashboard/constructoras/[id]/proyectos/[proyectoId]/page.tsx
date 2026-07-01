'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { FileText, Upload, Download, Trash2, ArrowLeft, Building2, X } from 'lucide-react'

interface Proyecto {
  id: string
  nombre: string
  ubicacion: string
  sector: string
  porcentaje_avance: number
}

interface Documento {
  id: string
  nombre: string
  tipo: string | null
  url: string
  tamano_kb: number | null
  created_at: string
  unidad_id?: string | null
}

interface UnidadResumen {
  piso: number
  torre: string | null
  total: number
  libres: number
  reservadas: number
  vendidas: number
}

interface UnidadSelector {
  id: string
  numero: string
  piso: number
  torre: string | null
}

const TIPOS = ['plano', 'brochure', 'specs', 'otro']

export default function ProyectoDetallePage() {
  const params = useParams()
  const constructoraId = params.id as string
  const proyectoId = params.proyectoId as string

  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [tipoSeleccionado, setTipoSeleccionado] = useState('plano')
  const [unidadesPorPiso, setUnidadesPorPiso] = useState<UnidadResumen[]>([])
  const [docPreview, setDocPreview] = useState<Documento | null>(null)
  const [unidades, setUnidades] = useState<UnidadSelector[]>([])
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string>('')

  useEffect(() => {
    cargarDatos()
  }, [proyectoId])

  async function cargarDatos() {
    setLoading(true)
    const { data: proyectoData } = await supabase
      .from('proyectos')
      .select('id, nombre, ubicacion, sector, porcentaje_avance')
      .eq('id', proyectoId)
      .single()

    const { data: documentosData } = await supabase
      .from('proyecto_documentos')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('created_at', { ascending: false })

    setProyecto(proyectoData)
    setDocumentos(documentosData || [])

    const { data: unidadesData } = await supabase
      .from('unidades')
      .select('piso, torre, estado')
      .eq('proyecto_id', proyectoId)

    const resumen: Record<string, UnidadResumen> = {}
    for (const u of (unidadesData || [])) {
      const key = `${u.torre ?? 'unica'}-${u.piso}`
      if (!resumen[key]) {
        resumen[key] = { piso: u.piso, torre: u.torre, total: 0, libres: 0, reservadas: 0, vendidas: 0 }
      }
      resumen[key].total++
      if (u.estado === 'libre') resumen[key].libres++
      else if (u.estado === 'reservada') resumen[key].reservadas++
      else if (u.estado === 'vendida') resumen[key].vendidas++
    }
    setUnidadesPorPiso(Object.values(resumen).sort((a, b) => b.piso - a.piso || (a.torre ?? '').localeCompare(b.torre ?? '')))

    const { data: unidadesData2 } = await supabase
      .from('unidades')
      .select('id, numero, piso, torre')
      .eq('proyecto_id', proyectoId)
      .order('piso', { ascending: false })
    setUnidades(unidadesData2 || [])

    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendo(true)

    const nombreSanitizado = file.name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-]/g, '_')
    const rutaArchivo = `${proyectoId}/${Date.now()}-${nombreSanitizado}`

    const { error: errorUpload } = await supabase.storage
      .from('documentos-proyecto')
      .upload(rutaArchivo, file)

    if (errorUpload) {
      alert('Error subiendo archivo: ' + errorUpload.message)
      setSubiendo(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('documentos-proyecto')
      .getPublicUrl(rutaArchivo)

    await supabase.from('proyecto_documentos').insert([{
      proyecto_id: proyectoId,
      nombre: file.name,
      tipo: tipoSeleccionado,
      url: urlData.publicUrl,
      tamano_kb: Math.round(file.size / 1024),
      unidad_id: unidadSeleccionada || null,
    }])

    setSubiendo(false)
    setUnidadSeleccionada('')
    e.target.value = ''
    cargarDatos()
  }

  async function handleEliminar(doc: Documento) {
    if (!confirm(`¿Eliminar "${doc.nombre}"? Esta acción no se puede revertir.`)) return
    await supabase.from('proyecto_documentos').delete().eq('id', doc.id)
    cargarDatos()
  }

  function esImagen(doc: Documento) {
    const nombre = doc.nombre.toLowerCase()
    return nombre.endsWith('.jpg') || nombre.endsWith('.jpeg') || nombre.endsWith('.png') || nombre.endsWith('.webp')
  }

  function handlePreview(doc: Documento) {
    if (esImagen(doc)) {
      setDocPreview(doc)
    } else {
      window.open(doc.url, '_blank')
    }
  }

  if (loading) {
    return <div className="text-zinc-500 text-sm">Cargando proyecto...</div>
  }

  if (!proyecto) {
    return <div className="text-zinc-500 text-sm">Proyecto no encontrado.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/constructoras/${constructoraId}/proyectos`}
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a proyectos
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-[#CCFF00]">Proyecto</p>
        <h1 className="text-3xl font-black mt-1">{proyecto.nombre}</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {proyecto.ubicacion} {proyecto.sector ? `· ${proyecto.sector}` : ''} · {proyecto.porcentaje_avance ?? 0}% avance
        </p>
      </div>

      {unidadesPorPiso.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-4 h-4 text-[#CCFF00]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Disponibilidad por Piso</h2>
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-6 mb-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#CCFF00]" />Libre</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" />Reservada</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-zinc-600" />Vendida</span>
          </div>

          <div className="space-y-2">
            {unidadesPorPiso.map((fila) => {
              const pctLibre = fila.total > 0 ? (fila.libres / fila.total) * 100 : 0
              const pctReservada = fila.total > 0 ? (fila.reservadas / fila.total) * 100 : 0
              const pctVendida = fila.total > 0 ? (fila.vendidas / fila.total) * 100 : 0
              return (
                <div key={`${fila.torre}-${fila.piso}`} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-16 text-right shrink-0">
                    {fila.torre ? `${fila.torre} · ` : ''}P{fila.piso}
                  </span>
                  <div className="flex-1 h-6 rounded-md overflow-hidden flex bg-zinc-800">
                    {pctLibre > 0 && (
                      <div
                        className="h-full bg-[#CCFF00] transition-all"
                        style={{ width: `${pctLibre}%` }}
                        title={`${fila.libres} libres`}
                      />
                    )}
                    {pctReservada > 0 && (
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{ width: `${pctReservada}%` }}
                        title={`${fila.reservadas} reservadas`}
                      />
                    )}
                    {pctVendida > 0 && (
                      <div
                        className="h-full bg-zinc-600 transition-all"
                        style={{ width: `${pctVendida}%` }}
                        title={`${fila.vendidas} vendidas`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 w-20 shrink-0">
                    {fila.libres}/{fila.total} libres
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#CCFF00]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Documentos</h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#CCFF00]"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={unidadSeleccionada}
              onChange={(e) => setUnidadSeleccionada(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#CCFF00]"
            >
              <option value="">Proyecto completo</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.torre ? `Torre ${u.torre} · ` : ''}{u.numero} (P{u.piso})
                </option>
              ))}
            </select>

            <label className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-2.5 hover:bg-[#b8e600] transition-colors cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              {subiendo ? 'Subiendo...' : 'Subir documento'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={subiendo} />
            </label>
          </div>
        </div>

        {documentos.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">
            Todavía no hay documentos para este proyecto.
          </p>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl group cursor-pointer hover:border-zinc-600 transition-colors"
                onClick={() => handlePreview(doc)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{doc.nombre}</p>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">
                      {doc.tipo || 'otro'} {doc.tamano_kb ? `· ${doc.tamano_kb} KB` : ''}
                    </p>
                    {doc.unidad_id && (
                      <span className="text-[10px] text-[#CCFF00]/70 bg-[#CCFF00]/10 px-1.5 py-0.5 rounded">
                        {unidades.find(u => u.id === doc.unidad_id)?.numero ?? 'Unidad'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-800 hover:bg-[#CCFF00] border border-zinc-700 text-white hover:text-black rounded-lg transition-all"
                    aria-label="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEliminar(doc)}
                    className="p-2 bg-zinc-800 hover:bg-red-500 border border-zinc-700 text-white rounded-lg transition-all"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {docPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setDocPreview(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDocPreview(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Cerrar
            </button>
            <img
              src={docPreview.url}
              alt={docPreview.nombre}
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
            />
            <p className="text-center text-zinc-400 text-xs mt-3">{docPreview.nombre}</p>
          </div>
        </div>
      )}
    </div>
  )
}
