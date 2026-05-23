'use client'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import Link from 'next/link'

export default function Page() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  const guardarEmail = async () => {
    if (!email.trim()) return
    setCargando(true)
    await supabase.from('beta_emails').insert({ email: email.trim() })
    setEnviado(true)
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-zinc-800">
        <div className="text-2xl font-black tracking-tighter text-amber-500">HOMVI</div>
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-zinc-500">
          <span className="hover:text-white cursor-pointer transition-colors">Producto</span>
          <span className="hover:text-white cursor-pointer transition-colors">Precios</span>
          <span className="hover:text-white cursor-pointer transition-colors">Contacto</span>
        </div>
        <Link href="/dashboard" className="bg-amber-500 text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-white transition-all uppercase tracking-wider">
          Comenzar
        </Link>
      </nav>

      <section className="pt-20 pb-10 px-6 text-center max-w-4xl mx-auto">
        <span className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-4 block">CRM Inmobiliario · Santo Domingo</span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
          Tu cartera de clientes,{' '}
          <span className="italic text-amber-500">bajo control total.</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Homvi es el CRM diseñado para agentes inmobiliarios que operan con estándares de lujo. Pipeline visual, seguimiento preciso, cierre inteligente.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="bg-amber-500 text-black px-8 py-4 rounded-xl font-black hover:bg-white transition-all text-sm uppercase tracking-wider">
            Empieza Gratis
          </Link>
          <button className="border border-zinc-700 px-8 py-4 rounded-xl font-bold hover:border-amber-500 hover:text-amber-500 transition-all text-sm uppercase tracking-wider">
            Ver Demo
          </button>
        </div>
      </section>

      <section className="py-10 px-6 max-w-6xl mx-auto border-y border-zinc-800 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-black mb-2 text-white">2,400+</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Agentes activos</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black mb-2 text-white">$18B</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Propiedades</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black mb-2 text-white">34%</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Más cierres</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black mb-2 text-white">99%</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Satisfacción</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all">
            <div className="text-amber-500 text-3xl font-black">01</div>
            <h3 className="text-xl font-bold tracking-tight">Pipeline Visual</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Visualiza el estado de cada cliente en tiempo real. De lead a cierre, sin fricción.</p>
          </div>
          <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all">
            <div className="text-amber-500 text-3xl font-black">02</div>
            <h3 className="text-xl font-bold tracking-tight">Follow-ups Precisos</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Nunca pierda un seguimiento. Recordatorios, historial y priorización automática.</p>
          </div>
          <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all">
            <div className="text-amber-500 text-3xl font-black">03</div>
            <h3 className="text-xl font-bold tracking-tight">Catálogo Lujo</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Conecta clientes con propiedades. Filtra por zona, precio y características al instante.</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center bg-amber-500/5 border-t border-amber-500/10">
        <h2 className="text-4xl font-black mb-4">Empieza a cerrar más. Hoy.</h2>
        <p className="text-zinc-400 mb-10 max-w-md mx-auto text-sm">Sin tarjeta de crédito. Configura en 5 minutos.</p>
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-4 text-sm focus:border-amber-500 outline-none transition-colors"
          />
          <button
            onClick={guardarEmail}
            disabled={cargando || enviado}
            className="bg-amber-500 text-black px-8 py-4 rounded-xl text-sm font-black hover:bg-white transition-all disabled:opacity-50 uppercase tracking-wider"
          >
            {enviado ? '✓ ¡Apuntado!' : cargando ? 'Guardando...' : 'Comenzar Gratis'}
          </button>
        </div>
      </section>

      <footer className="py-8 text-center text-zinc-600 text-xs tracking-widest uppercase border-t border-zinc-800">
        <p>© 2026 HOMVI · CRM Inmobiliario · Santo Domingo</p>
      </footer>
    </div>
  )
}