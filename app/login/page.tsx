'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Truco maestro para móviles: leemos los datos directo del formulario, 
    // ignorando si el autorrelleno de Apple disparó el onChange o no.
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      setError('Por favor, completa todos los campos.')
      setLoading(false)
      return
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      console.log('login result:', { data, authError })
      
      if (authError) {
        setError('Email o contraseña incorrectos: ' + authError.message)
        setLoading(false)
      } else {
        // Redirección limpia y forzada
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError('Error inesperado: ' + err.message)
      setLoading(false)
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
          <h2 className="text-white font-black uppercase text-sm tracking-wider mb-6">Iniciar Sesión</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                autoComplete="email"
                required
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs uppercase tracking-wider mb-1.5 block">Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-95"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <p className="text-zinc-500 text-xs text-center mt-4">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-amber-500 hover:underline font-bold">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}