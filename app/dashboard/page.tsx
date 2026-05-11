'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Cliente {
  id: string
  nombre: string
  etapa: string
  tipoPropiedad: string[]
  presupuestoMin: string
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    const guardados = localStorage.getItem('homvi_clientes')
    if (guardados) setClientes(JSON.parse(guardados))
  }, [])

  const etapaColor: Record<string, string> = {
    'LEAD': 'text-gray-400 bg-white/5',
    'BUSCANDO': 'text-blue-400 bg-blue-400/10',
    'EN OFERTA': 'text-[#d4af37] bg-[#d4af37]/10',
    'CIERRE': 'text-green-400 bg-green-400/10',
  }

  const citas = [
    { hora: '10:00 AM', cliente: 'María González', tipo: 'Firma de contrato' },
    { hora: '2:00 PM', cliente: 'Carlos Reyes', tipo: 'Segunda visita' },
    { hora: '4:30 PM', cliente: 'Pedro Núñez', tipo: 'Llamada de seguimiento' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <nav className="flex justify-between items-center p-6 border-b border-white/5">
        <div className="text-[#d4af37] text-xl font-bold tracking-tighter uppercase italic">Homvi</div>
        <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black text-xs font-bold">LB</div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-light tracking-tight">Bienvenido, <span className="text-[#d4af37] italic">Luis</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-light">Este es el estado actual de tu portafolio hoy.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2">Ventas del Mes</p>
            <h2 className="text-3xl font-bold text-[#d4af37]">$4.2M</h2>
          </div>
          <Link href="/properties" className="group">
            <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 group-hover:border-[#d4af37]/50 transition-all cursor-pointer relative overflow-hidden">
              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2">Propiedades Activas</p>
              <h2 className="text-3xl font-bold group-hover:text-[#d4af37] transition-colors">24 Unidades</h2>
              <div className="absolute right-8 bottom-8 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity">
                Ver catálogo →
              </div>
            </div>
          </Link>
          <div className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5">
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2">Clientes Activos</p>
            <h2 className="text-3xl font-bold">{clientes.length > 0 ? `+${clientes.length}` : '0'}</h2>
          </div>
        </div>

        {/* Pipeline + Citas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Pipeline */}
          <div className="lg:col-span-2 bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-6">Pipeline de Clientes</h3>
            {clientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm">No hay clientes aún.</p>
                <Link href="/clients/new" className="mt-4 inline-block text-xs text-[#d4af37] uppercase tracking-widest hover:text-white transition-colors">
                  + Registrar primer cliente
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {clientes.map((c) => (
                  <Link key={c.id} href={`/clients/${c.id}`}>
                    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xs font-bold">
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium group-hover:text-[#d4af37] transition-colors">{c.nombre}</p>
                          <p className="text-gray-500 text-xs">{c.tipoPropiedad?.[0] || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${etapaColor[c.etapa] || 'text-gray-400 bg-white/5'}`}>
                          {c.etapa}
                        </span>
                        <span className="text-sm font-bold text-[#d4af37]">{c.presupuestoMin || '—'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Citas de hoy */}
          <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold mb-6">Agenda de Hoy</h3>
            <div className="space-y-5">
              {citas.map((c, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-[#d4af37] text-xs font-bold w-16 pt-0.5">{c.hora}</div>
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-sm font-medium">{c.cliente}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{c.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/today" className="mt-8 block text-center text-xs text-[#d4af37] hover:text-white transition-colors uppercase tracking-widest">
              Ver agenda completa →
            </Link>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <section>
          <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-6 font-bold">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/today" className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-colors">
              Ver Agenda de Hoy
            </Link>
            <Link href="/clients/new" className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors">
              Nuevo Cliente
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
