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
  Edit2,
  MapPin,
  Globe
} from 'lucide-react'
// Importamos el componente optimizado de mapas de Next.js
import { GoogleMapsEmbed } from '@next/third-parties/google'

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
  ubicacionInteres: string // Nueva propiedad para mapear
}

export default function ClientsPage() {
  // Datos iniciales incluyendo las zonas calientes de inversión en RD
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, name: 'Luis Betances', email: 'luis@homvi.com', phone: '+1 809-555-0123', status: 'Inversionista', motivoCompra: 'Renta Corta (Airbnb)', origenFondos: 'Fondos Propios', confotur: true, temperatura: 'caliente', ubicacionInteres: 'Piantini, Santo Domingo' },
    { id: 2, name: 'Jean Lizardo', email: 'jean@homvi.com', phone: '+1 829-555-4567', status: 'Comprador', motivoCompra: 'Vivienda Principal', origenFondos: 'Financiamiento Bancario', confotur: false, temperatura: 'tibio', ubicacionInteres: 'Las Terrenas, Samana' },
  ])

  // Control del Mapa Activo (Muestra la ubicación del último cliente seleccionado)
  const [mapaQuery, setMapaQuery] = useState('Piantini, Santo Domingo, RD')

  // Estados del Modal y Control de Edición
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [nuevoCliente, setNuevoCliente] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Inversionista',
    motivoCompra: 'Renta Corta (Airbnb)',
    origenFondos: 'Fondos Propios',
    confotur: false,
    temperatura: 'caliente' as 'caliente' | 'tibio' | 'frio',
    ubicacionInteres: 'Piantini, Santo Domingo'
  })

  const abrirModalCrear = () => {
    setEditingId(null)
    setNuevoCliente({
      name: '', email: '', phone: '', status: 'Inversionista',
      motivoCompra: 'Renta Corta (Airbnb)', origenFondos: 'Fondos Propios',
      confotur: false, temperatura: 'caliente', ubicacionInteres: 'Piantini, Santo Domingo'
    })
    setIsModalOpen(true)
  }

  const abrirModalEditar = (cliente: Cliente) => {
    setEditingId(cliente.id)
    setNuevoCliente({
      name: cliente.name, email: cliente.email, phone: cliente.phone, status: cliente.status,
      motivoCompra: cliente.motivoCompra, origenFondos: cliente.origenFondos,
      confotur: cliente.confotur, temperatura: cliente.temperatura, ubicacionInteres: cliente.ubicacionInteres
    })
    setIsModalOpen(true)
  }

  const handleGuardarCliente = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCliente.name || !nuevoCliente.email) return

    if (editingId !== null) {
      setClientes(clientes.map(c => c.id === editingId ? { ...c, ...nuevoCliente } : c))
    } else {
      const nuevoObj: Cliente = { id: Date.now(), ...nuevoCliente }
      setClientes([nuevoObj, ...clientes])
    }

    // Centrar automáticamente el mapa en el sector del cliente guardado
    setMapaQuery(`${nuevoCliente.ubicacionInteres}, RD`)
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

      {/* LISTADO DE CLIENTES */}
      <div className="bg-black/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-zinc-900">
          {clientes.map((cliente) => (
            <div 
              key={cliente.id} 
              onClick={() => setMapaQuery(`${cliente.ubicacionInteres}, RD`)}
              className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-zinc-900/20 transition-all group cursor-pointer"
            >
              {/* Identidad */}
              <div className="flex items-start gap-4 min-w-[230px]">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-black text-white text-base flex-shrink-0">
                  {cliente.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight group-hover:text-[#CCFF00] transition-colors">{cliente.name}</h3>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Objetivo</span>
                  <span className="text-zinc-300 font-medium">{cliente.motivoCompra}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Estructura</span>
                  <span className="text-zinc-300 font-medium">{cliente.origenFondos}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Zona de Interés</span>
                  <span className="text-[#CCFF00] font-mono flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-500" /> {cliente.ubicacionInteres}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-zinc-600 block">Incentivo Fiscal</span>
                  {cliente.confotur ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]"><ShieldCheck className="w-3.5 h-3.5" /> CONFOTUR</span>
                  ) : (
                    <span className="text-zinc-500 font-medium">No Aplica</span>
                  )}
                </div>
              </div>

              {/* Contactos e Interacciones */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 text-xs font-mono border-t lg:border-t-0 border-zinc-900 pt-3 lg:pt-0 min-w-[180px]">
                <div className="flex flex-col items-start lg:items-end gap-0.5 text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors"><Mail className="w-3 h-3 text-zinc-600" /> {cliente.email}</span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors"><Phone className="w-3 h-3 text-zinc-600" /> {cliente.phone}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que se dispare el click de la fila
                    abrirModalEditar(cliente);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#CCFF00] text-zinc-400 hover:text-black border border-zinc-800 transition-all font-sans font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN REACTIVADA DE GOOGLE MAPS (Estilo Panel de Control) */}
      <div className="bg-black/20 border border-zinc-900 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} /> Geolocalización Inmobiliaria Activa
            </h3>
            <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mt-0.5">Enfocado actualmente en: <span className="text-white">{mapaQuery}</span></p>
          </div>
          <span className="text-[9px] font-mono bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Google Maps API OK</span>
        </div>
        
        {/* Renderizado Fluido del Mapa Flotante */}
        <div className="w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <GoogleMapsEmbed
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} // Usará tu API Key configurada
            height={300}
            width="100%"
            mode="place"
            q={mapaQuery}
          />
        </div>
      </div>

      {/* MODAL MULTIFUNCIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 99999 }}>
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl my-auto">
            <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#CCFF00]" /> 
                  {editingId !== null ? 'Modificar Perfil Inmobiliario' : 'Perfilamiento Avanzado de Lead'}
                </h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 border border-zinc-800"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleGuardarCliente} className="p-5 space-y-5">
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
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <h4 className="text-[10px] uppercase tracking-widest text-cyan-400 font-black font-mono">02. Calificación Patrimonial</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Ubicación de Interés (Para Google Maps)</label>
                    <select value={nuevoCliente.ubicacionInteres} onChange={(e) => setNuevoCliente({...nuevoCliente, ubicacionInteres: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]">
                      <option value="Piantini, Santo Domingo">Piantini, Santo Domingo</option>
                      <option value="Naco, Santo Domingo">Naco, Santo Domingo</option>
                      <option value="Las Terrenas, Samana">Las Terrenas, Samaná</option>
                      <option value="Punta Cana, La Altagracia">Punta Cana, La Altagracia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">Origen de los Fondos</label>
                    <select value={nuevoCliente.origenFondos} onChange={(e) => setNuevoCliente({...nuevoCliente, origenFondos: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]">
                      <option value="Fondos Propios">Fondos Propios</option>
                      <option value="Financiamiento Bancario">Financiamiento Bancario</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/40 border border-zinc-900 rounded-xl p-3">
                  <span className="text-xs font-bold text-white block">¿Requiere Ley CONFOTUR?</span>
                  <input type="checkbox" checked={nuevoCliente.confotur} onChange={(e) => setNuevoCliente({...nuevoCliente, confotur: e.target.checked})} className="w-4 h-4 accent-[#CCFF00]" />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <h4 className="text-[10px] uppercase tracking-widest text-red-400 font-black font-mono">03. Temperatura</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['frio', 'tibio', 'caliente'] as const).map((temp) => (
                    <button key={temp} type="button" onClick={() => setNuevoCliente({...nuevoCliente, temperatura: temp})} className={`py-2 rounded-xl text-xs font-black uppercase border transition-all ${nuevoCliente.temperatura === temp ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-black border-zinc-800 text-zinc-400'}`}>
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-[#CCFF00] text-black font-black uppercase text-xs py-3 rounded-xl hover:bg-white transition-all">
                {editingId !== null ? 'Confirmar Modificaciones' : 'Inyectar Perfil'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}