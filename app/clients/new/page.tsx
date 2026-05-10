'use client'
import Link from 'next/link'

export default function NewClientPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <nav className="p-6 border-b border-white/5 max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-[#d4af37] text-xl font-bold tracking-tighter">HOMVI</div>
        <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          ← Volver al Panel
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-light tracking-tight">Nuevo <span className="italic">Registro</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-light">Introduce los detalles del cliente y la propiedad de interés.</p>
        </header>

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold">Nombre del Cliente</label>
              <input type="text" placeholder="Ej. Juan Pérez" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Valor Estimado</label>
              <input type="text" placeholder="Ej. $500,000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Propiedad de Interés</label>
            <input type="text" placeholder="Ej. Residencia Las Palmas" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Estado del Pipeline</label>
            <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none appearance-none cursor-pointer">
              <option>Lead</option>
              <option>Buscando</option>
              <option>En Oferta</option>
              <option>Cierre</option>
            </select>
          </div>

          <div className="pt-4">
            <button type="button" className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-full hover:bg-[#b8962e] transition-all text-sm tracking-widest uppercase shadow-lg shadow-[#d4af37]/10">
              Guardar Cliente
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
}
