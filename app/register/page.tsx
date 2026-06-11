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
  const [mensaje, setMensaje] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    setMensaje('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
    } else {
      setMensaje('Revisa tu email y confirma tu cuenta para continuar.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-white">SEC<span className="text-[#CCFF00]">TOR</span></h1>
          <p className="text-zinc-500 text-sm mt-1 font-mono">CRM Inmobiliario · Santo Domingo</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-black uppercase text-sm tracking-wider">Crear Cuenta Gratis</h2>
          <p className="text-zinc-500 text-xs">Sin tarjeta de crédito. Sin compromiso.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs px-4 py-3 rounded-xl">
              {mensaje}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 block">Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white px-4 py-3 rounded-xl text-sm outline-none transition-colors placeholder-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white px-4 py-3 rounded-xl text-sm outline-none transition-colors placeholder-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5 block">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white px-4 py-3 rounded-xl text-sm outline-none transition-colors placeholder-zinc-600" />
            </div>
            <button onClick={handleRegister} disabled={loading || !email || !password || !nombre}
              className="w-full bg-[#CCFF00] text-black py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <p className="text-zinc-500 text-xs text-center pt-2">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#CCFF00] hover:underline font-bold">Inicia sesión</Link>
          </p>
        </div>

        <p className="text-zinc-600 text-[10px] text-center mt-4 font-mono">
          Al registrarte aceptas los términos de uso de SECTOR
        </p>
      </div>
    </div>
  )
}
