'use client'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Nav */}
      <nav className="flex justify-between items-center p-6 border-b border-white/5">
        <div className="text-[#d4af37] text-xl font-bold tracking-tighter uppercase italic">Homvi</div>
        <div className="flex gap-4">
          <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black text-xs font-bold">LB</div>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-light tracking-tight">Bienvenido, <span className="text-[#d4af37] italic">Luis</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-light">Este es el estado actual de tu portafolio hoy.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">Ventas del Mes</p>
            <h2 className="text-3xl font-bold text-[#d4af37]">$4.2M</h2>
          </div>
          
          {/* BOTÓN DIRECTO A PROPIEDADES */}
          <Link href="/properties" className="group">
            <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 group-hover:border-[#d4af37]/50 transition-all cursor-pointer relative overflow-hidden">
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">Propiedades Activas</p>
              <h2 className="text-3xl font-bold group-hover:text-[#d4af37] transition-colors">24 Unidades</h2>
              <div className="absolute right-8 bottom-8 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity">
                Ver catálogo →
              </div>
            </div>
          </Link>

          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">Nuevos Leads</p>
            <h2 className="text-3xl font-bold">+12</h2>
          </div>
        </div>

        {/* Quick Actions Area */}
        <section className="mt-12">
          <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-6 font-bold">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/today" className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#d4af37] transition-colors">
              Ver Agenda de Hoy
            </Link>
            <Link href="/clients/new" className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">
              Registrar Cliente
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
