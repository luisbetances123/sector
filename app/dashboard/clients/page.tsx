'use client'
import React, { useState } from 'react'
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Tag, 
  X, 
  UserPlus,
  ShieldCheck,
  Flame,
  Edit2
} from 'lucide-react'

interface Cliente {
  id: number
  name: string
  email: string
  phone: string
  status: string
  motivoCompra: string
  origenFondos: string
  confotur: boolean
  temperatura: 'caliente' | 'tibio' | 'frio'
}

export default function ClientsPage() {
  // Datos iniciales
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, name: 'Luis Betances', email: 'luis@homvi.com', phone: '+1 809-555-0123', status: 'Inversionista', motivoCompra: 'Renta Corta (Airbnb)', origenFondos: 'Fondos Propios', confotur: true, temperatura: 'caliente' },
    { id: 2, name: 'Jean Lizardo', email: 'jean@homvi.com', phone: '+1 829-555-4567', status: 'Comprador', motivoCompra: 'Vivienda Principal', origenFondos: 'Financiamiento Bancario', confotur: false, temperatura: 'tibio' },
  ])

  // Estados del Modal y Control de Edición
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null) // Guarda el ID si estamos editando
  
  const [nuevoCliente, setNuevoCliente] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Inversionista',
    motivoCompra: 'Renta Corta (Airbnb)',
    origenFondos: 'Fondos Propios',
    confotur: false,
    temperatura: 'caliente' as 'caliente' | 'tibio' | 'frio'
  })

  // Abrir el modal en modo CREAR
  const abrirModalCrear = () => {
    setEditingId(null)
    setNuevoCliente({
      name: '',
      email: '',
      phone: '',
      status: 'Inversionista',
      motivoCompra: 'Renta Corta (Airbnb)',
      origenFondos: 'Fondos Propios',
      confotur: false,
      temperatura: 'caliente'
    })
    setIsModalOpen(true)
  }

  // Abrir el modal en modo EDITAR (Carga los datos existentes)
  const abrirModalEditar = (cliente: Cliente) => {
    setEditingId(cliente.id)
    setNuevoCliente({
      name: cliente.name,
      email: cliente.email,
      phone: cliente.phone,
      status: cliente.status,
      motivoCompra: cliente.motivoCompra,
      origenFondos: cliente.origenFondos,
      confotur: cliente.confotur,
      temperatura: cliente.temperatura
    })
    setIsModalOpen(true)
  }

  // Guardar (tanto para nuevo cliente como para edición)
  const handleGuardarCliente = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCliente.name || !nuevoCliente.email) return

    if (editingId !== null) {
      // Modo EDICIÓN: Actualiza el cliente existente en el array
      setClientes(clientes.map(c => c.id === editingId ? { ...c, ...nuevoCliente } : c))
    } else {
      // Modo CREACIÓN: Inserta uno nuevo arriba
      const nuevoObj: Cliente = {
        id: Date.now(),
        ...nuevoCliente
      }
      setClientes([nuevoObj, ...clientes])
    }

    setIsModalOpen(false)
    setEditingId(null)
  }

  const getTempStyles = (temp: string) => {
    switch (temp) {
      case 'caliente': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'tibio': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn min-h-screen pb-12">
      
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#CCFF00]" /> Directorio De Clientes
          </h1>
          <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Inteligencia de Perfiles y Segmentación Patrimonial</p>
        </div>
        <button 
          type="button"
          onClick={abrirModalCrear}
          className="bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Cliente
        </button>
      </div>

      {/* LISTADO DE CLIENTES CON ACCIÓN DE EDICIÓN */}
      <div className="bg-black/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-zinc-900">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-zinc-900/10 transition-all group">
              
              {/* Identidad */}
              <div className="flex items-start gap-4 min-w-[250px]">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-black text-white text-base flex-shrink-0">
                  {cliente.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight">{cliente.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-bold uppercase tracking-wider">
                      <Tag className="w-2.5 h-2.5" /> {cliente.status}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${getTempStyles(cliente.temperatura)}`}>
                      <Flame className="w-2.5 h-2.5 fill-current" /> {cliente.temperatura}
                    </span>
                  </div>
                </div>
              </div>

              {/* Perfil Financiero */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 max-w-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Objetivo</span>
                  <span className="text-zinc-300 font-medium">{cliente.motivoCompra}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Estructura Económica</span>
                  <span className="text-zinc-300 font-medium">{cliente.origenFondos}</span>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Beneficio Fiscal</span>
                  {cliente.confotur ? (
                    <span className="text-[#CCFF00] font-bold flex items-center gap-1 text-[11px]"><ShieldCheck className="w-3.5 h-3.5" /> CONFOTUR</span>
                  ) : (
                    <span className="text-zinc-500 font-medium">No Aplica</span>
                  )}
                </div>
              </div>

              {/* Contactos y Botón Editar */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 text-xs font-mono border-t lg:border-t-0 border-zinc-900 pt-3 lg:pt-0 min-w-[200px]">
                <div className="flex flex-col items-start lg:items-end gap-1 text-zinc-400">
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> {cliente.email}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> {cliente.phone}
                  </span>
                </div>

                {/* Botón interactivo de edición rápida */}
                <button
                  type="button"
                  onClick={() => abrirModalEditar(cliente)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#CCFF00] text-zinc-400 hover:text-black border border-zinc-800 transition-all font-sans font-bold text-[11px] uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* MODAL MULTIFUNCIÓN (CREAR/EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 99999 }}>
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl my-auto">
            
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#CCFF00]" /> 
                  {editingId !== null ? 'Modificar Perfil Inmobiliario' : 'Perfilamiento Avanzado de Lead'}
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">
                  {editingId !== null ? 'Actualizando datos en tiempo real' : 'Cualificación patrimonial y de intenciones'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarCliente} className="p-5 space-y-5">
              
              {/* SECCIÓN 1: DATOS BÁSICOS */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest text-[#CCFF00] font-black font-mono">01. Identidad e Información de Contacto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Nombre Completo</label>
                    <input type="text" required placeholder="Ej. Carlos Mendoza" value={nuevoCliente.name} onChange={(e) => setNuevoCliente({...nuevoCliente, name: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Correo Electrónico</label>
                    <input type="email" required placeholder="carlos@correo.com" value={nuevoCliente.email} onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Teléfono Móvil</label>
                    <input type="text" placeholder="+1 809-555-0000" value={nuevoCliente.phone} onChange={(e) => setNuevoCliente({...nuevoCliente, phone: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Perfil General</label>
                    <select value={nuevoCliente.status} onChange={(e) => setNuevoCliente({...nuevoCliente, status: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]">
                      <option value="Inversionista">Inversionista</option>
                      <option value="Comprador Final">Comprador Final</option>
                      <option value="Propietario / Constructor">Propietario / Constructor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: INTELIGENCIA INMOBILIARIA */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <h4 className="text-[10px] uppercase tracking-widest text-cyan-400 font-black font-mono">02. Calificación Patrimonial e Intención</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Motivo de la Compra</label>
                    <select value={nuevoCliente.motivoCompra} onChange={(e) => setNuevoCliente({...nuevoCliente, motivoCompra: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]">
                      <option value="Renta Corta (Airbnb)">Renta Corta (Airbnb)</option>
                      <option value="Vivienda Principal">Vivienda Principal</option>
                      <option value="Segunda Vivienda / Vacacional">Segunda Vivienda / Vacacional</option>
                      <option value="Plusvalía Pura (Girar Contrato)">Plusvalía Pura (Girar Contrato)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Origen de los Fondos</label>
                    <select value={nuevoCliente.origenFondos} onChange={(e) => setNuevoCliente({...nuevoCliente, origenFondos: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]">
                      <option value="Fondos Propios">Fondos Propios (Liquidez)</option>
                      <option value="Financiamiento Bancario">Financiamiento Bancario</option>
                      <option value="Estructura Corporativa / LLC">Estructura Corporativa / LLC</option>
                    </select>
                  </div>
                </div>

                {/* Switch de Confotur */}
                <div className="flex items-center justify-between bg-black/40 border border-zinc-900 rounded-xl p-3 mt-1">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">¿Requiere Ley CONFOTUR?</span>
                    <span className="text-[10px] text-zinc-500 block">Exención del 3% de transferencia y 1% del IPI</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={nuevoCliente.confotur} 
                    onChange={(e) => setNuevoCliente({...nuevoCliente, confotur: e.target.checked})} 
                    className="w-4 h-4 accent-[#CCFF00] cursor-pointer bg-black border-zinc-800 rounded"
                  />
                </div>
              </div>

              {/* SECCIÓN 3: TEMPERATURA */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <h4 className="text-[10px] uppercase tracking-widest text-red-400 font-black font-mono">03. Temperatura de Cierre</h4>
                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">Nivel de Interés Actual</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['frio', 'tibio', 'caliente'] as const).map((temp) => (
                      <button
                        key={temp}
                        type="button"
                        onClick={() => setNuevoCliente({...nuevoCliente, temperatura: temp})}
                        className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                          nuevoCliente.temperatura === temp
                            ? temp === 'caliente' ? 'bg-red-500 text-black border-red-500' : temp === 'tibio' ? 'bg-amber-500 text-black border-amber-500' : 'bg-blue-500 text-black border-blue-500'
                            : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {temp === 'caliente' ? '🔥 Caliente' : temp === 'tibio' ? '⏳ Tibio' : '❄️ Frío'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTÓN SUBMIT COMPARTIDO */}
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl hover:bg-white transition-all cursor-pointer shadow-md"
                >
                  {editingId !== null ? 'Confirmar Modificaciones' : 'Inyectar Perfil al Directorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}