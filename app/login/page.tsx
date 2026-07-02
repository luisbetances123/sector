'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single()

    if (profile?.rol === 'broker') {
      window.location.href = '/dashboard/broker'
    } else {
      window.location.href = '/dashboard'
    }
  }

  async function handleReset() {
    if (!email) return setError('Ingresa tu email primero')
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })
    setResetMsg('Revisa tu email para restablecer tu contraseña.')
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">SEC<span className="text-[#CCFF00]">TOR</span></h1>
          <p className="text-zinc-500 text-sm mt-1 font-mono">CRM Inmobiliario · Santo Domingo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 outline-none transition-colors" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 block">Contraseña</label>
            <input type="password" placeholder="Tu contraseña" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 outline-none transition-colors" />
          </div>

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
          {resetMsg && <p className="text-[#CCFF00] text-xs font-mono">{resetMsg}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#CCFF00] text-black font-black text-sm rounded-xl py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="flex justify-between items-center pt-1">
            <button type="button" onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-[#CCFF00] transition-colors font-mono">
              ¿Olvidaste tu contraseña?
            </button>
            <Link href="/register" className="text-xs text-zinc-500 hover:text-[#CCFF00] transition-colors font-mono">
              Crear cuenta →
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
