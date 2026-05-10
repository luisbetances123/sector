'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d4af37]/30 font-sans">
      {/* Nav */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="text-2xl font-bold tracking-tighter text-[#d4af37]">HOMVI</div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-[0.2em] text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Producto</a>
          <a href="#" className="hover:text-white transition-colors">Precios</a>
          <a href="#" className="hover:text-white transition-colors">Contacto</a>
        </div>
        <Link href="/today" className="bg-[#d4af37] text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#b8962e] transition-all">
          COMENZAR
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 text-center max-w-4xl mx-auto">
        <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-bold mb-4 block animate-fade-in">CRM Inmobiliario Premium</span>
        <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8">
          Tu cartera de clientes, <br />
          <span className="italic">bajo control total.</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Diseñado para agentes que operan con estándares de lujo. Pipeline visual, seguimiento preciso y cierre inteligente.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/today" className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-200 transition-all">
            EMPIEZA GRATIS
          </Link>
          <button className="border border-white/20 px-8 py-4 rounded-full font-medium hover:bg-white/5 transition-all">
            VER DEMO
          </button>
        </div>
      </section>

      {/* Pipeline Preview Simplificado */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-[#d4af37]/5">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <h3 className="text-[#d4af37] text-sm uppercase tracking-widest">Estado del Mercado Hoy</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><p className="text-3xl font-light">$18B</p><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Gestionados</p></div>
            <div><p className="text-3xl font-light">2.4k</p><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Agentes</p></div>
            <div><p className="text-3xl font-light">98%</p><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Retención</p></div>
            <div><p className="text-3xl font-light">+34%</p><p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Ventas</p></div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm italic">
        <p>© 2025 Homvi. Elevando el estándar inmobiliario.</p>
      </footer>
    </div>
  )
}