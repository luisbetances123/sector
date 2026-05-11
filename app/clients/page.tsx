'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  etapa: string
  presupuestoMin: string
  tipoPropiedad: string[]
}

const etapaColor: Record<string, string> = {
  'LEAD': 'text-gray-400 bg-white/5 border-white/10',
  'BUSCANDO': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'EN OFERTA': 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30',
  'CIERRE': 'text-green-400 bg-green-400/10 border-green-400/30',
}

const etapas = ['Todos', 'LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']

function capitalizarNombre(nombre: string) {
  return nombre.split(' ').map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')
}

export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  useEffect(() => {
    const guardados = localStorage.getItem('homvi_clientes')
    if (guardados) setClientes(JSON.parse(guardados))
  }, [])

  const filtrados = clientes.filter((c) => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefono?.includes(search)
    const matchFiltro = filtro === 'Todos' || c.etapa === filtro
    return matchSearch && matchFiltro
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight">Mis <span className="text-[#d4af37] italic">Clientes</span></h1>
            <p className="text-gray-500 text-sm mt-2 font-light">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} en cartera</p>
          </div>
          <Link href="/clients/new" className="bg-[#d4af37] text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">
            + Nuevo Cliente
          </Link>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[#d4af37]/50 transition-all"
          />
          <div className="flex gap-2 flex-wrap">
            {etapas.map((e) => (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filtro === e ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-500 hover:border-white/30'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-sm mb-4">{clientes.length === 0 ? 'No hay clientes aún.' : 'No hay resultados.'}</p>
            {clientes.length === 0 && (
              <Link href="/clients/new" className="text-xs text-[#d4af37] uppercase tracking-widest hover:text-white transition-colors">
                + Registrar primer cliente
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/clients/${c.id}`)}
                className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 hover:border-[#d4af37]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-sm font-bold flex-shrink-0">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold group-hover:text-[#d4af37] transition-colors truncate">
                      {capitalizarNombre(c.nombre)}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{c.email || c.telefono || '—'}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border flex-shrink-0 ${etapaColor[c.etapa] || 'text-gray-400 bg-white/5 border-white/10'}`}>
                    {c.etapa}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs text-gray-500">{c.tipoPropiedad?.[0] || '—'}</span>
                  <span className="text-sm font-bold text-[#d4af37]">
                    {c.presupuestoMin ? `$${Number(c.presupuestoMin.replace(/\D/g,'')).toLocaleString()}` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
