'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TodayPage() {
  const [notas, setNotas] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [userName, setUserName] = useState('Luis')

  const typeColor: Record<string, string> = {
    'llamada': 'border-white/10 text-gray-400',
    'cita': 'border-blue-400/30 text-blue-400',
    'urgente': 'border-red-400/30 text-red-400',
    'cierre': 'border-green-400/30 text-green-400',
  }

  useEffect(() => {
    loadData()
  }, [])

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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#d4af37]/30">
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-10">
          <h1 className="text-4xl font-light tracking-tight italic">
            Resumen de <span className="not-italic text-[#d4af37]">Hoy</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-light italic">
            Bienvenido, {userName}. Esto es lo que tienes pendiente para cerrar el día.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-[#d4af37] text-xs uppercase tracking-[0.2em] font-bold mb-6">Próximas Citas</h3>
            {followups.length === 0 && (
              <p className="text-gray-600 text-sm italic">No hay actividades programadas para hoy.</p>
            )}
            {followups.map((item) => (
              <div key={item.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:border-[#d4af37]/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="text-[#d4af37] font-mono text-base tracking-tighter w-20">
                    {item.hora || '—'}
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest group-hover:text-[#d4af37] transition-colors">
                      {item.titulo}
                    </h4>
                    <p className="text-gray-500 text-xs mt-1 italic">
                      Cliente: {item.clientes?.nombre || '—'}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] border px-4 py-1 rounded-full uppercase tracking-widest ${typeColor[item.tipo?.toLowerCase()] || 'border-white/10 text-gray-400'}`}>
                  {item.tipo}
                </span>
              </div>
            ))}
            <button className="w-full border border-dashed border-white/10 p-5 rounded-[2rem] text-gray-600 text-xs uppercase tracking-widest hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-all">
              + Programar nueva actividad
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold mb-6">Notas Rápidas</h3>
            {notas.map((nota) => (
              <div key={nota.id} className="bg-[#d4af37]/5 border border-[#d4af37]/10 p-5 rounded-[1.5rem] group relative">
                <p className="text-gray-300 text-sm font-light leading-relaxed">{nota.contenido}</p>
                <button
                  onClick={() => deleteNota(nota.id)}
                  className="absolute top-3 right-3 text-gray-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nueva nota..."
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 resize-none h-20 transition-all"
              />
              <button
                onClick={addNota}
                className="w-full py-3 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs uppercase tracking-widest font-bold hover:bg-[#d4af37] hover:text-black transition-all"
              >
                + Añadir nota
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}