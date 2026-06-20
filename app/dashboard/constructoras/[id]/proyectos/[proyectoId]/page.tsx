'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { FileText, Upload, Download, Trash2, ArrowLeft, Building2 } from 'lucide-react'

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
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSubiendo(true)

    const rutaArchivo = `${proyectoId}/${Date.now()}-${file.name}`

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
    }])

    setSubiendo(false)
    e.target.value = ''
    cargarDatos()
  }

  async function handleEliminar(doc: Documento) {
    if (!confirm(`¿Eliminar "${doc.nombre}"? Esta acción no se puede revertir.`)) return
    await supabase.from('proyecto_documentos').delete().eq('id', doc.id)
    cargarDatos()
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
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl group"
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
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  
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
    </div>
  )
}
