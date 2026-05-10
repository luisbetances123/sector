'use client'
import Link from 'next/link'

export default function DashboardPage() {
  const tableData = [
    { name: 'María Rodríguez', prop: 'Penthouse Bella Vista', status: 'En Oferta', val: '$450k' },
    { name: 'Carlos Mendoza', prop: 'Villa Mar Azul', status: 'Cierre', val: '$1.2M' },
    { name: 'Ana Peralta', prop: 'Residencial Lujo', status: 'Lead', val: '$280k' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Top Nav Interna */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="text-[#d4af37] text-xl font-bold tracking-tighter">HOMVI</div>
          <div className="hidden md:flex gap-6 text-[10px] uppercase tracking-widest text-gray-500">
            <Link href="/dashboard" className="text-[#d4af37]">Dashboard</Link>
            <Link href="/today" className="hover:text-white transition-colors">Hoy</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-500">LUIS BETANCES</span>
          <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black text-xs font-bold">LB</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-light tracking-tight">Tu Panel <span className="italic">Principal</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-light">Gestiona tu cartera de clientes con precisión.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/5 p-8 rounded-3xl">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-4">Clientes Activos</p>
            <p className="text-4xl font-light">12</p>
          </div>
          <div className="bg-white/5 border border-white/5 p-8 rounded-3xl">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-4">Cierres del Mes</p>
            <p className="text-4xl font-light">$1.2M</p>
          </div>
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 p-8 rounded-3xl">
            <p className="text-[#d4af37] text-[10px] uppercase tracking-[0.2em] mb-4">Seguimientos Hoy</p>
            <p className="text-4xl font-light text-[#d4af37]">5</p>
          </div>
        </div>

        {/* Listado de Clientes */}
        <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium">Pipeline Reciente</h3>
            <button className="text-[10px] bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-all">
              + NUEVO CLIENTE
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-6 font-normal">Cliente</th>
                  <th className="px-8 py-6 font-normal">Propiedad</th>
                  <th className="px-8 py-6 font-normal">Estado</th>
                  <th className="px-8 py-6 font-normal">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableData.map((row) => (
                  <tr key={row.name} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 font-light">{row.name}</td>
                    <td className="px-8 py-6 text-gray-500 text-sm">{row.prop}</td>
                    <td className="px-8 py-6">
                      <span className="bg-[#d4af37]/10 text-[#d4af37] px-3 py-1 rounded-full text-[10px] font-medium border border-[#d4af37]/20">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-medium text-[#d4af37]">{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
