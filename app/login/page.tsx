'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const supabase = createBrowserClient(
    'https://gbxedknmmpfwvgkekmng.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieGVka25tbXBmd3Zna2VrbW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTY1OTksImV4cCI6MjA5NDE3MjU5OX0.GWZB0ZGlNdYHaYczZP0W6trfR2fXR65dEPn4eyZqb6Y'
  )

  const login = async () => {
    if (!email || !password) return
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setCargando(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="text-[#d4af37] text-4xl font-bold tracking-tighter uppercase italic mb-2">Homvi</div>
          <p className="text-gray-400 text-sm">CRM Inmobiliario Premium</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8">
          <h1 className="text-xl font-bold text-white mb-1">Bienvenido</h1>
          <p className="text-gray-400 text-sm mb-8">Ingresa tus credenciales para continuar</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="tu@email.com"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" autoFocus />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
            </div>
            {error && <p className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}
            <button onClick={login} disabled={!email || !password || cargando}
              className="w-full py-4 rounded-2xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2">
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
