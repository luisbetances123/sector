'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-lg font-black tracking-tighter uppercase text-white">SECTOR</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 outline-none transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-white placeholder-zinc-600 text-sm rounded-xl px-4 py-3 outline-none transition-colors"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CCFF00] text-black font-black text-sm rounded-xl py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button type="button" onClick={async () => { if (!email) return; await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" }); setError("Revisa tu email"); }} className="text-xs text-zinc-400 hover:text-[#CCFF00] mt-2 w-full text-center">Olvidaste tu contrasena?</button>
        </form>
      </div>
    </div>
  )
}