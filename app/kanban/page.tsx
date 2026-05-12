'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../app/lib/supabase'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  etapa: string
  presupuestoMin: string
  tipoPropiedad: string[]
}

const etapas = ['LEAD', 'BUSCANDO', 'EN OFERTA', 'CIERRE']

const etapaColor: Record<string, string> = {
  'LEAD': 'text-gray-300 border-gray-400/30',
  'BUSCANDO': 'text-blue-400 border-blue-400/30',
  'EN OFERTA': 'text-[#d4af37] border-[#d4af37]/30',
  'CIERRE': 'text-green-400 border-green-400/30',
}

const etapaHeader: Record<string, string> = {
  'LEAD': 'border-t-gray-400',
  'BUSCANDO': 'border-t-blue-400',
  'EN OFERTA': 'border-t-[#d4af37]',
  'CIERRE': 'border-t-green-400',
}

function capitalizarNombre(nombre: string) {
  return nombre.split(' ').map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')
}

export default function KanbanPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [arrastrando, setArrastrando] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('clientes')
        .select('id, nombre, email, telefono, etapa, presupuesto_min, tipo_propiedad')
        .order('created_at', { ascending: false })

      if (data) {
        setClientes(data.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          email: c.email || '',
          telefono: c.telefono || '',
          etapa: c.etapa,
          presupuestoMin: c.presupuesto_min || '',
          tipoPropiedad: c.tipo_propiedad || [],
        })))
      }
    }
    cargar()
  }, [])

  const moverCliente = async (id: string, nuevaEtapa: string) => {
    const actualizados = clientes.map((c) =>
      c.id === id ? { ...c, etapa: nuevaEtapa } : c
    )
    setClientes(actualizados)
    await supabase.from('clientes').update({ etapa: nuevaEtapa }).eq('id', id)
  }

  const onDragStart = (id: string) => setArrastrando(id)
  const onDragEnd = () => setArrastrando(null)

  const onDrop = (e: React.DragEvent, etapa: string) => {
    e.preventDefault()
    if (arrastrando) moverCliente(arrastrando, etapa)
    setArrastrando(null)
  }

  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <main className="p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight">Pipeline <span className="text-[#d4af37] italic">Kanban</span></h1>
            <p className="text-gray-300 text-sm mt-2 font-light">Arrastra los clientes entre etapas</p>
          </div>
          <Link href="/clients/new" className="bg-[#d4af37] text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">
            + Nuevo Cliente
          </Link>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {etapas.map((etapa) => {
            const clientesEtapa = clientes.filter((c) => c.etapa === etapa)
            return (
              <div
                key={etapa}
                onDrop={(e) => onDrop(e, etapa)}
                onDragOver={onDragOver}
                className={`bg-[#0a0a0a] border border-white/5 border-t-2 ${etapaHeader[etapa]} rounded-2xl p-4 min-h-[500px] transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold uppercase tracking-widest ${etapaColor[etapa]}`}>
                    {etapa}
                  </span>
                  <span className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded-full">
                    {clientesEtapa.length}
                  </span>
                </div>

                {clientesEtapa.length > 0 && (
                  <div className="text-xs text-gray-300 mb-4 pb-3 border-b border-white/5">
                    Total: <span className="text-[#d4af37]">
                      ${clientesEtapa.reduce((acc, c) => {
                        const num = Number(c.presupuestoMin?.replace(/\D/g, '') || 0)
                        return acc + num
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {clientesEtapa.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => onDragStart(c.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => router.push(`/clients/${c.id}`)}
                      className={`bg-[#050505] border border-white/5 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-[#d4af37]/30 transition-all group ${
                        arrastrando === c.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xs font-bold flex-shrink-0">
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold truncate group-hover:text-[#d4af37] transition-colors">
                          {capitalizarNombre(c.nombre)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-300 truncate">{c.tipoPropiedad?.[0] || '—'}</p>
                        <p className="text-sm font-bold text-[#d4af37]">
                          {c.presupuestoMin ? `$${Number(c.presupuestoMin.replace(/\D/g,'')).toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {clientesEtapa.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-gray-700 text-xs">
                      Sin clientes
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
