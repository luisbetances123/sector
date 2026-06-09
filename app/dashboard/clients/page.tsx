'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  etapa: string
  presupuesto_min: string
  presupuesto_max: string
  notas: string
  proxima_accion: string
  created_at: string
  user_id: string
}

export default function ClientsPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error(error)
      else setClientes(data || [])
      setLoading(false)
    }
    fetchClientes()
  }, [])

  const filtered = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEtapaStyle = (etapa: string) => {
    switch (etapa) {
      case 'NUEVO': return 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'
      case 'ACTIVO': return 'bg-zinc-900 text-zinc-400 border-zinc-800'
      case 'ESTANCADO': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800'
    }
  }

  return (
    <div className="text-zinc-100 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="space-y-8">
        <header className="border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Base de Datos Central</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-2">Directorio de Clientes</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-72 bg-zinc-950 border border-zinc-800 focus:border-[#CCFF00] text-zinc-100 placeholder-zinc-600 text-xs rounded-xl px-4 py-3 outline-none transition-colors"
            />
            <button
              onClick={() => window.location.href = '/dashboard/clients/nuevo'}
              className="bg-[#CCFF00] text-black font-black text-xs rounded-xl px-4 py-3 hover:bg-[#b8e600] transition-colors whitespace-nowrap"
            >
              + Nuevo
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Clientes</p>
            <p className="text-3xl font-black text-white mt-1">{loading ? '...' : clientes.length}</p>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Activos</p>
            <p className="text-3xl font-black text-[#CCFF00] mt-1">
              {loading ? '...' : clientes.filter(c => c.etapa === 'ACTIVO').length}
            </p>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Estancados</p>
            <p className="text-3xl font-black text-red-400 mt-1">
              {loading ? '...' : clientes.filter(c => c.etapa === 'ESTANCADO').length}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="text-zinc-500 text-sm text-center py-20">Cargando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-20">
            {searchTerm ? 'No se encontraron resultados.' : 'No hay clientes registrados aún.'}
          </div>
        ) : (
          <section className="bg-zinc-950/40 rounded-2xl border border-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-4 pl-6">Cliente</th>
                    <th className="p-4">Presupuesto</th>
                    <th className="p-4">Etapa</th>
                    <th className="p-4">Próxima Acción</th>
                    <th className="p-4 pr-6 text-center">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-xs">
                  {filtered.map(cliente => (
                    <tr key={cliente.id} className="hover:bg-zinc-900/20 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-white text-sm group-hover:text-[#CCFF00] transition-colors">
                          {cliente.nombre}
                        </div>
                        <div className="text-zinc-500 font-mono text-[11px] mt-0.5">{cliente.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[#CCFF00] font-black font-mono">
                          {cliente.presupuesto_min && cliente.presupuesto_max
                            ? `US$ ${Number(cliente.presupuesto_min).toLocaleString()} – ${Number(cliente.presupuesto_max).toLocaleString()}`
                            : cliente.presupuesto_min
                            ? `US$ ${Number(cliente.presupuesto_min).toLocaleString()}`
                            : '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${getEtapaStyle(cliente.etapa)}`}>
                          {cliente.etapa || '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-zinc-400 text-[11px]">{cliente.proxima_accion || '—'}</span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          {cliente.telefono && (
                            
                              href={`https://wa.me/${cliente.telefono}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-zinc-900 hover:bg-[#CCFF00] border border-zinc-800 hover:border-[#CCFF00] text-zinc-400 hover:text-black rounded-lg transition-all"
                            >
                              💬
                            </a>
                          )}
                          {cliente.telefono && (
                            
                              href={`tel:${cliente.telefono}`}
                              className="p-2 bg-zinc-900 hover:bg-blue-500 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-white rounded-lg transition-all"
                            >
                              📞
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}