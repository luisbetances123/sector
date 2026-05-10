'use client'
import Link from 'next/link'

export default function TodayPage() {
  const appointments = [
    { time: '14:00 PM', client: 'Carlos M.', action: 'Visita Penthouse', type: 'Cita' },
    { time: '16:30 PM', client: 'María R.', action: 'Revisión de Contrato', type: 'Urgente' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#d4af37]/30">
      {/* Navegación Superior */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="text-[#d4af37] text-xl font-bold tracking-tighter uppercase italic">Homvi</div>
          <div className="hidden md:flex gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/today" className="text-[#d4af37]">Hoy</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-500 tracking-widest uppercase font-medium">Luis Betances</span>
          <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black text-xs font-bold shadow-lg shadow-[#d4af37]/20">LB</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-light tracking-tight italic">Resumen de <span className="not-italic text-[#d4af37]">Hoy</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-light italic">Bienvenido, Luis. Esto es lo que tienes pendiente para cerrar el día.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna de Citas */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-[#d4af37] text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Próximas Citas</h3>
            
            {appointments.map((item, index) => (
              <div key={index} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] flex items-center justify-between hover:border-[#d4af37]/30 transition-all group shadow-xl">
                <div className="flex items-center gap-8">
                  <div className="text-[#d4af37] font-mono text-lg tracking-tighter">{item.time}</div>
                  <div className="w-px h-10 bg-white/10"></div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest group-hover:text-[#d4af37] transition-colors">{item.action}</h4>
                    <p className="text-gray-500 text-xs mt-1 italic">Cliente: {item.client}</p>
                  </div>
                </div>
                <span className="text-[9px] border border-white/10 px-4 py-1 rounded-full text-gray-400 uppercase tracking-widest group-hover:border-[#d4af37]/50 group-hover:text-white transition-all">
                  {item.type}
                </span>
              </div>
            ))}

            <button className="w-full border border-dashed border-white/10 p-6 rounded-[2rem] text-gray-600 text-[10px] uppercase tracking-widest hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-all bg-white/[0.01]">
              + Programar nueva actividad
            </button>
          </div>

          {/* Sidebar de Recordatorios Cortos */}
          <div className="space-y-6">
            <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-6 text-right">Notas Rápidas</h3>
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/10 p-8 rounded-[2rem]">
              <p className="text-[#d4af37] text-sm italic font-light leading-relaxed">
                "Recuerda llamar a la constructora por el avance de obra en Bella Vista."
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
