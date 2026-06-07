'use client';

import { useState } from 'react';

// 1. Tipado del Cliente
interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  perfil: 'INVERSIONISTA' | 'COMPRADOR' | 'VENDEDOR';
  temperatura: 'CALIENTE' | 'TIBIO' | 'FRIO';
  objetivo: string;
  estructuraFinanciera: string;
  zonaInteres: string;
  confotur: boolean;
}

export default function ClientesModule() {
  // 2. Datos reales basados en tus capturas de HOMVI
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Luis Betances',
      email: 'luis@homvi.com',
      telefono: '+1 809-555-0123',
      perfil: 'INVERSIONISTA',
      temperatura: 'CALIENTE',
      objetivo: 'Renta Corta (Airbnb)',
      estructuraFinanciera: 'Fondos Propios',
      zonaInteres: 'Piantini, Santo Domingo',
      confotur: true,
    },
    {
      id: '2',
      nombre: 'Jean Lizardo',
      email: 'jean@homvi.com',
      telefono: '+1 829-555-4567',
      perfil: 'COMPRADOR',
      temperatura: 'TIBIO',
      objetivo: 'Vivienda Principal',
      estructuraFinanciera: 'Financiamiento Bancario',
      zonaInteres: 'Las Terrenas, Samaná',
      confotur: false,
    }
  ]);

  // Estados para la edición
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (cliente: Cliente) => {
    setClienteAEditar({ ...cliente });
    setIsModalOpen(true);
  };

  const handleUpdateCliente = (datosActualizados: Cliente) => {
    // Actualiza el estado local instantáneamente
    setClientes(clientes.map(c => c.id === datosActualizados.id ? datosActualizados : c));
    setIsModalOpen(false);
    setClienteAEditar(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-x-hidden">
      
      {/* HEADER DEL DIRECTORIO */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            👥 Directorio De Clientes
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
            Inteligencia de perfiles y segmentación patrimonial
          </p>
        </div>
        <button className="bg-[#d4ff33] text-black text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-[#bce62d] transition-colors">
          + Nuevo Cliente
        </button>
      </div>

      {/* LISTA DE TARJETAS DE CLIENTES */}
      <div className="space-y-4 mb-8">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-[#0c0c0c] border border-zinc-900 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 hover:border-zinc-800 transition-all">
            
            {/* Inicial y Nombre */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-400">
                {cliente.nombre.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{cliente.nombre}</h3>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                    {cliente.perfil}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    cliente.temperatura === 'CALIENTE' 
                      ? 'bg-red-950/30 border-red-900 text-red-400' 
                      : 'bg-amber-950/30 border-amber-900 text-amber-400'
                  }`}>
                    {cliente.temperatura === 'CALIENTE' ? '🔥' : '🟡'} {cliente.temperatura}
                  </span>
                </div>
              </div>
            </div>

            {/* Objetivo */}
            <div className="text-xs min-w-[120px]">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium tracking-wider">Objetivo</span>
              <span className="text-zinc-300 mt-0.5 block font-medium">{cliente.objetivo}</span>
            </div>

            {/* Estructura Financiera */}
            <div className="text-xs min-w-[140px]">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium tracking-wider">Estructura</span>
              <span className="text-zinc-300 mt-0.5 block font-medium">{cliente.estructuraFinanciera}</span>
            </div>

            {/* Zona de Interés */}
            <div className="text-xs min-w-[160px]">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium tracking-wider">Zona de Interés</span>
              <span className="text-[#d4ff33] mt-0.5 block font-medium">📍 {cliente.zonaInteres}</span>
            </div>

            {/* Incentivo Fiscal */}
            <div className="text-xs min-w-[100px]">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium tracking-wider">Incentivo Fiscal</span>
              {cliente.confotur ? (
                <span className="text-cyan-400 font-semibold mt-0.5 block flex items-center gap-1 text-[11px]">
                  🛡️ CONFOTUR
                </span>
              ) : (
                <span className="text-zinc-600 mt-0.5 block">No Aplica</span>
              )}
            </div>

            {/* Contacto y Botón Editar */}
            <div className="flex items-center gap-6 justify-between ml-auto">
              <div className="text-right text-[11px] text-zinc-500 space-y-0.5">
                <span className="block hover:text-white cursor-pointer">✉️ {cliente.email}</span>
                <span className="block">📞 {cliente.telefono}</span>
              </div>
              <button 
                onClick={() => handleEditClick(cliente)}
                className="border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                ✏️ Editar
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MÓDULO DE GEOLOCALIZACIÓN REUTILIZADO */}
      <div className="bg-[#0c0c0c] border border-zinc-900 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              🌐 Geolocalización Inmobiliaria Activa
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5 uppercase">
              Enfocado actualmente en: Piantini, Santo Domingo, RD
            </p>
          </div>
          <span className="text-[9px] font-bold tracking-widest text-[#d4ff33] border border-[#d4ff33]/30 px-2 py-0.5 rounded bg-[#d4ff33]/5">
            GOOGLE MAPS API OK
          </span>
        </div>
        <div className="w-full h-48 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center text-xs text-zinc-600 font-medium tracking-wider">
          MAPA INTERACTIVO DE COBERTURA PATRIMONIAL
        </div>
      </div>

      {/* 3. SLIDE-OVER MODAL DE EDICIÓN */}
      {isModalOpen && clienteAEditar && (
        <>
  {/* Backdrop traslúcido */}
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />

          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0f0f0f] border-l border-zinc-800 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Editar Perfil Patrimonial</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Modifica las preferencias de {clienteAEditar.nombre}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white bg-zinc-900 p-1.5 rounded-md border border-zinc-800 text-xs">✕</button>
              </div>

              <form id="edit-client-form" onSubmit={(e) => { e.preventDefault(); handleUpdateCliente(clienteAEditar); }} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={clienteAEditar.nombre}
                    onChange={(e) => setClienteAEditar({...clienteAEditar, nombre: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#d4ff33]" 
                  />
                </div>

                {/* Perfil e Intensidad */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Perfil</label>
                    <select 
                      value={clienteAEditar.perfil}
                      onChange={(e) => setClienteAEditar({...clienteAEditar, perfil: e.target.value as any})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#d4ff33]"
                    >
                      <option value="INVERSIONISTA">Inversionista</option>
                      <option value="COMPRADOR">Comprador</option>
                      <option value="VENDEDOR">Vendedor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Temperatura</label>
                    <select 
                      value={clienteAEditar.temperatura}
                      onChange={(e) => setClienteAEditar({...clienteAEditar, temperatura: e.target.value as any})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#d4ff33]"
                    >
                      <option value="CALIENTE">🔥 Caliente</option>
                      <option value="TIBIO">🟡 Tibio</option>
                      <option value="FRIO">❄️ Frío</option>
                    </select>
                  </div>
                </div>

                {/* Objetivo */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Objetivo Inmobiliario</label>
                  <input 
                    type="text" 
                    value={clienteAEditar.objetivo}
                    onChange={(e) => setClienteAEditar({...clienteAEditar, objetivo: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#d4ff33]" 
                  />
                </div>

                {/* Estructura Financiera */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Estructura Financiera</label>
                  <input 
                    type="text" 
                    value={clienteAEditar.estructuraFinanciera}
                    onChange={(e) => setClienteAEditar({...clienteAEditar, estructuraFinanciera: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#d4ff33]" 
                  />
                </div>

                {/* Zonas de Interés */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Zonas de Interés</label>
                  <input 
                    type="text" 
                    value={clienteAEditar.zonaInteres}
                    onChange={(e) => setClienteAEditar({...clienteAEditar, zonaInteres: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#d4ff33]" 
                  />
                </div>

                {/* Toggle CONFOTUR */}
                <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold text-white block">Incentivo CONFOTUR</span>
                    <span className="text-[10px] text-zinc-500">Exención del impuesto de transferencia</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={clienteAEditar.confotur}
                    onChange={(e) => setClienteAEditar({...clienteAEditar, confotur: e.target.checked})}
                    className="w-4 h-4 accent-[#d4ff33] bg-zinc-900 border-zinc-800 rounded cursor-pointer"
                  />
                </div>
              </form>
            </div>

            {/* Botones de Acción Abajo */}
            <div className="border-t border-zinc-900 pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="w-1/2 border border-zinc-850 text-zinc-400 rounded-xl py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-900/50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="edit-client-form"
                className="w-1/2 bg-[#d4ff33] text-black font-bold text-xs uppercase tracking-wider rounded-xl py-2 hover:bg-[#bce62d] transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}