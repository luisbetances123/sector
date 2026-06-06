'use client'
import React, { useState } from 'react'
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Tag, 
  X, 
  UserPlus 
} from 'lucide-react'

interface Cliente {
  id: number
  name: string
  email: string
  phone: string
  status: string
}

export default function ClientsPage() {
  // Tus datos originales de RD
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, name: 'Luis Betances', email: 'luis@homvi.com', phone: '+1 809-555-0123', status: 'Inversionista' },
    { id: 2, name: 'Jean Lizardo', email: 'jean@homvi.com', phone: '+1 829-555-4567', status: 'Comprador' },
  ])

  // Estado para controlar el Modal flotante
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Inversionista'
  })

  // Guardar el cliente en tu lista en tiempo real
  const handleCrearCliente = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCliente.name || !nuevoCliente.email) return

    const nuevoObj: Cliente = {
      id: Date.now(),
      name: nuevoCliente.name,
      email: nuevoCliente.email,
      phone: nuevoCliente.phone || '+1 809-000-0000',
      status: nuevoCliente.status
    }

    setClientes([...clientes, nuevoObj])
    setNuevoCliente({ name: '', email: '', phone: '', status: 'Inversionista' })
    setIsModalOpen(false) // Cierra el modal limpiamente
  }

  return (
    <div className="space-y-6 animate-fadeIn min-h-screen pb-12">
      
      {/* ENCABEZADO ORIGINAL */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#CCFF00]" /> Directorio De Clientes
          </h1>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Gestión y perfiles de compradores premium</p>
        </div>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Cliente
        </button>
      </div>

      {/* LISTADO ORIGINAL RE-ESTILIZADO */}
      <div className="bg-black/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-zinc-900">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-white text-sm">
                  {cliente.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{cliente.name}</h3>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-zinc-900 text-[#CCFF00] px-2 py-0.5 rounded border border-zinc-800 mt-1 font-bold uppercase tracking-wider">
                    <Tag className="w-2.5 h-2.5" /> {cliente.status}
                  </span>
                </div>
              </div>

              {/* Contactos alineados */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> {cliente.email}
                </span>
                <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" /> {cliente.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL SUPREMO DE ALTA (Evita bloqueos de capas) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#CCFF00]" /> Nuevo Registro
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Añadir broker o cliente al sistema</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearCliente} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Nombre del Cliente</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={nuevoCliente.name}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, name: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@homvi.com"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Teléfono</label>
                  <input 
                    type="text" 
                    placeholder="+1 809-555-0000"
                    value={nuevoCliente.phone}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, phone: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Perfil de Lead</label>
                  <select 
                    value={nuevoCliente.status}
                    onChange={(e) => setNuevoCliente({...nuevoCliente, status: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors"
                  >
                    <option value="Inversionista">Inversionista</option>
                    <option value="Comprador">Comprador</option>
                    <option value="Propietario">Propietario</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-white transition-all cursor-pointer"
                >
                  Inyectar al Directorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}