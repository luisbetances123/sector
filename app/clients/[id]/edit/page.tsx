'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../app/lib/supabase'

type Stage = 'LEAD' | 'BUSCANDO' | 'EN OFERTA' | 'CIERRE'

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [isSaving, setIsSaving] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [propiedad, setPropiedad] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [etapa, setEtapa] = useState<Stage>('LEAD')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('clientes').select('*').eq('id', id).single()
      if (data) {
        setNombre(data.nombre || '')
        setTelefono(data.telefono || '')
        setEmail(data.email || '')
        setPropiedad(data.tipo_propiedad?.[0] || '')
        setPresupuesto(data.presupuesto_min || '')
        setEtapa(data.etapa as Stage)
        setNotas(data.notas || '')
      }
      setCargando(false)
    }
    cargar()
  }, [id])

  const handleSave = async () => {
    if (!nombre.trim()) return
    setIsSaving(true)
    setError('')

    const { error } = await supabase.from('clientes').update({
      nombre,
      telefono,
      email,
      etapa,
      presupuesto_min: presupuesto,
      tipo_propiedad: propiedad ? [propiedad] : [],
      notas,
    }).eq('id', id)

    if (error) {
      setError('Error al guardar. Intenta de nuevo.')
      setIsSaving(false)
      return
    }

    router.push(`/clients/${id}`)
  }

  if (cargando) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-sans">
      Cargando...
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <main className="max-w-2xl mx-auto p-8 md:p-12">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight italic">Editar <span className="not-italic text-[#d4af37]">Cliente</span></h1>
            <p className="text-gray-400 text-sm mt-2 font-light">Modifica los datos del cliente.</p>
          </div>
          <button onClick={() => router.push(`/clients/${id}`)}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors font-bold">
            ← Cancelar
          </button>
        </header>

        <div className="space-y-5 bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-bold ml-1">Nombre Completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Julian Casablancas"
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">Teléfono</label>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. +1 809 555 0000"
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. julian@email.com"
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 text-white" />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">Propiedad de Interés</label>
            <input type="text" value={propiedad} onChange={(e) => setPropiedad(e.target.value)}
              placeholder="Ej. Mansión Los Lagos"
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 text-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">Presupuesto</label>
              <input type="text" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)}
                placeholder="Ej. 500000"
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">Etapa</label>
              <select value={etapa} onChange={(e) => setEtapa(e.target.value as Stage)}
                className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all text-gray-400">
                <option value="LEAD">Lead</option>
                <option value="BUSCANDO">Buscando</option>
                <option value="EN OFERTA">En Oferta</option>
                <option value="CIERRE">Cierre</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">Notas</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones sobre el cliente..."
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700 text-white resize-none h-24" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <div className="pt-4">
            <button onClick={handleSave} disabled={isSaving}
              className={`w-full font-extrabold py-5 rounded-full transition-all text-xs tracking-[0.2em] uppercase shadow-xl active:scale-95 ${
                isSaving ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#d4af37] text-black hover:bg-white'
              }`}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
