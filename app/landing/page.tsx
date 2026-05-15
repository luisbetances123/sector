'use client'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'
import Link from 'next/link'

export default function Page() {const [email, setEmail] = useState('')
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d4af37]/30 font-sans">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="text-2xl font-bold tracking-tighter text-[#d4af37]">HOMVI</div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-[0.2em] text-gray-400">
          <span className="hover:text-white cursor-pointer transition-colors text-[10px]">Producto</span>
          <span className="hover:text-white cursor-pointer transition-colors text-[10px]">Precios</span>
          <span className="hover:text-white cursor-pointer transition-colors text-[10px]">Contacto</span>
        </div>
        <Link href="/today" className="bg-[#d4af37] text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-[#b8962e] transition-all">
          COMENZAR
        </Link>
      </nav>

      <section className="pt-16 pb-8 px-6 text-center max-w-4xl mx-auto">
        <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-bold mb-4 block">CRM Inmobiliario Premium</span>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8">
          Tu cartera de clientes, <br />
          <span className="italic text-[#d4af37]">bajo control total.</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Homvi es el CRM diseñado para agentes inmobiliarios que operan con estándares de lujo. Pipeline visual, seguimiento preciso, cierre inteligente.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/today" className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-200 transition-all">
            EMPIEZA GRATIS
          </Link>
          <button className="border border-white/50 px-8 py-4 rounded-full font-medium hover:bg-white/5 transition-all text-sm">
            VER DEMO
          </button>
        </div>
      </section>

      <section className="py-10 px-6 max-w-6xl mx-auto border-y border-white/5 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-light mb-2">2,400+</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Agentes activos</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-light mb-2">$18B</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Propiedades</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-light mb-2">34%</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Más cierres</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-light mb-2">99%</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Satisfacción</p>
          </div>
        </div>
      </section>

      <section className="py-14 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <div className="text-[#d4af37] text-3xl font-serif">01</div>
            <h3 className="text-xl font-medium tracking-tight">Pipeline Visual</h3>
<p className="text-gray-400 text-sm leading-relaxed">Visualiza el estado de cada cliente en tiempo real. De lead a cierre, sin fricción.</p>          </div>
          <div className="space-y-4">
            <div className="text-[#d4af37] text-3xl font-serif">02</div>
            <h3 className="text-xl font-medium tracking-tight">Follow-ups Precisos</h3>
<p className="text-gray-400 text-sm leading-relaxed">Nunca pierda un seguimiento. Recordatorios, historial y priorización automática.</p>          </div>
          <div className="space-y-4">
            <div className="text-[#d4af37] text-3xl font-serif">03</div>
            <h3 className="text-xl font-medium tracking-tight">Catálogo Lujo</h3>
<p className="text-gray-400 text-sm leading-relaxed">Conecta clientes con propiedades. Filtra por zona, precio y características al instante.</p>          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center bg-[#d4af37]/5 border-t border-[#d4af37]/10">
        <h2 className="text-4xl font-light mb-4">Empieza a cerrar más. Hoy.</h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto text-sm">Sin tarjeta de crédito. Configura en 5 minutos.</p>
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="tu@email.com" 
            className="bg-black border border-white/10 rounded-full px-6 py-4 text-sm focus:border-[#d4af37] outline-none transition-colors"value={email}
              onChange={(e) => setEmail(e.target.value)}
          <button onClick={guardarEmail} disabled={cargando || enviado}
              className="bg-[#d4af37] text-black px-8 py-4 rounded-full text-sm font-bold hover:bg-[#b8962e] transition-all disabled:opacity-50">
              {enviado ? '✓ ¡Apuntado!' : cargando ? 'Guardando...' : 'COMENZAR GRATIS'}
            </button>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-600 text-[10px] tracking-[0.3em] uppercase">
        <p>© 2026 HOMVI. ELEVANDO EL ESTÁNDAR INMOBILIARIO.</p>
      </footer>
    </div>
  )
}
