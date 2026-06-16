'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Profile {
  id: string
  nombre: string
  rol: string
  email?: string
}

export default function UsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUserRol, setCurrentUserRol] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', nombre: '', rol: 'agente' })
  const [showForm, setShowForm] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()
    
    if (profile) setCurrentUserRol(profile.rol)

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at')
    
    if (allProfiles) setProfiles(allProfiles)
    setLoading(false)
  }

  async function cambiarRol(userId: string, nuevoRol: string) {
    setSaving(true)
    await supabase.from('profiles').update({ rol: nuevoRol }).eq('id', userId)
    fetchData()
    setSaving(false)
  }

  if (loading) return <div className="text-zinc-500 text-sm text-center py-20">Cargando...</div>

  if (currentUserRol !== 'admin') {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-300 text-sm">Solo el administrador puede acceder a esta pagina.</p>
      </div>
    )
  }

  return (
    <div className="text-zinc-100 font-sans space-y-8">
      <header className="border-b border-zinc-900 pb-6 flex justify-between items-end">
        <div>
          <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Administracion</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-1">Usuarios</h1>
        </div>
      </header>

      {mensaje && (
        <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-mono px-4 py-3 rounded-xl">
          {mensaje}
        </div>
      )}

      <section className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4 pl-6">Usuario</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Cambiar Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/40 text-xs">
            {profiles.map(profile => (
              <tr key={profile.id} className="hover:bg-zinc-900/20 transition-colors">
                <td className="p-4 pl-6">
                  <div className="font-bold text-white">{profile.nombre || 'Sin nombre'}</div>
                  <div className="text-zinc-500 font-mono text-[11px] mt-0.5">{profile.id.substring(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <span className={'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ' + (profile.rol === 'admin' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20' : 'bg-zinc-900 text-zinc-400 border-zinc-800')}>
                    {profile.rol}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={profile.rol}
                    disabled={saving}
                    onChange={e => cambiarRol(profile.id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="agente">Agente</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Invitar Nuevo Usuario</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-2 hover:bg-[#b8e600] transition-colors">
            + Invitar
          </button>
        </div>
        {showForm && (
          <div className="space-y-3 pt-2 border-t border-zinc-900">
            <p className="text-zinc-300 text-xs">Para invitar un nuevo usuario, comparte el link de registro de SECTOR con su email. El nuevo usuario debe registrarse en:</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-xs text-[#CCFF00]">
              {typeof window !== 'undefined' ? window.location.origin : ''}/register
            </div>
            <p className="text-zinc-600 text-[10px]">Despues de registrarse, asignales el rol desde esta tabla.</p>
          </div>
        )}
      </section>
    </div>
  )
}
