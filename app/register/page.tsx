'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">HOMVI</h1>
          <p className="text-zinc-500 text-sm mt-1">CRM Inmobiliario · Santo Domingo</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-6">Crear Cuenta</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Nombre</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading || !email || !password || !nombre}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>
          <p className="text-zinc-500 text-xs text-center mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-amber-500 hover:underline font-bold">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
