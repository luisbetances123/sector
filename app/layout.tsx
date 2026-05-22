'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
export default function TodayPage() {
  const [notas, setNotas] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [userName, setUserName] = useState('Luis')

  const typeColor: Record<string, string> = {
    'llamada': 'bg-zinc-800 text-zinc-400',
    'cita': 'bg-blue-500/10 text-blue-400',
    'urgente': 'bg-red-500/10 text-red-400',
    'cierre': 'bg-green-500/10 text-green-400',
  }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.nombre) setUserName(user.user_metadata.nombre)

    const hoy = new Date().toISOString().split('T')[0]
    const { data: fups } = await supabase
      .from('followups')
      .select('*')
      .eq('fecha', hoy)
      .order('hora', { ascending: true })
    if (fups) setFollowups(fups)

    const { data: nts } = await supabase
      .from('notas')
      .select('*')
      .order('created_at', { ascending: false })
    if (nts) setNotas(nts)
  }

  const addNota = async () => {
    if (!newNote.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('notas')
      .insert({ contenido: newNote.trim(), user_id: user?.id })
      .select()
      .single()
    if (data) setNotas([data, ...notas])
    setNewNote('')
  }

  const deleteNota = async (id: string) => {
    await supabase.from('notas').delete().eq('id', id)
    setNotas(notas.filter(n => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Resumen de <span className="text-amber-500">Hoy</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Bienvenido, {userName}. Esto es lo que tienes pendiente para cerrar el día.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Followups */}
          <div className="lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
              Próximas Citas
            </h2>
            <div className="space-y-3">
              {followups.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-600 text-sm">
                  Sin actividades para hoy.
                </div>
              )}
              {followups.map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-amber-500 font-mono text-sm w-16">{item.hora || '—'}</span>
                    <div className="w-px h-8 bg-zinc-700" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.titulo}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.detalle || item.tipo}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${typeColor[item.tipo?.toLowerCase()] || 'bg-zinc-800 text-zinc-400'}`}>
                    {item.tipo}
                  </span>
                </div>
              ))}
              <button className="w-full border border-dashed border-zinc-800 rounded-2xl p-4 text-zinc-600 text-xs uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-500 transition-all">
                + Programar nueva actividad
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Notas Rápidas
            </h2>
            <div className="space-y-3">
              {notas.map((nota) => (
                <div key={nota.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 group relative">
                  <p className="text-zinc-300 text-sm leading-relaxed">{nota.contenido}</p>
                  <button
                    onClick={() => deleteNota(nota.id)}
                    className="absolute top-3 right-3 text-zinc-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all"
                  >✕</button>
                </div>
              ))}
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nueva nota..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 resize-none h-20 transition-all"
              />
              <button
                onClick={addNota}
                className="w-full py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs uppercase tracking-widest font-bold hover:bg-amber-500 hover:text-black transition-all"
              >
                + Añadir nota
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}