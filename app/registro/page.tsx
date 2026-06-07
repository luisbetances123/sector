'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function RegistroPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  const supabase = createBrowserClient(
    'https://gbxedknmmpfwvgkekmng.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdieGVka25tbXBmd3Zna2VrbW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTY1OTksImV4cCI6MjA5NDE3MjU5OX0.GWZB0ZGlNdYHaYczZP0W6trfR2fXR65dEPn4eyZqb6Y'
  )

  const registrar = async () => {
    if (!nombre || !email || !password) return
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { nombre } } })
    if (error) { setError(error.message); setCargando(false) } else { setExito(true) }
  }

  if (exito) return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="text-[#d4af37] text-4xl font-bold tracking-tighter uppercase italic mb-8">SECTOR</div>
        <div className="bg-[#0a0a0a] border border-green-400/20 rounded-[2rem] p-8">
          <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-400 text-xl">✓</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-400 text-sm mb-6">Revisa tu email para confirmar tu cuenta, luego inicia sesión.</p>
          <Link href="/login" className="block w-full py-3 rounded-2xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest text-center hover:bg-[#d4af37]/90 transition-all">
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="text-[#d4af37] text-4xl font-bold tracking-tighter uppercase italic mb-2">SECTOR</div>
          <p className="text-gray-400 text-sm">CRM Inmobiliario Premium</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8">
          <h1 className="text-xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mb-8">Regístrate para acceder a SECTOR</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" autoFocus />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && registrar()} placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all" />
            </div>
            {error && <p className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>}
            <button onClick={registrar} disabled={!nombre || !email || !password || cargando}
              className="w-full py-4 rounded-2xl bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2">
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
            <p className="text-center text-xs text-gray-500">¿Ya tienes cuenta?{' '}<Link href="/login" className="text-[#d4af37] hover:underline">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
