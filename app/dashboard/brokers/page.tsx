"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

interface BrokerStats {
  nombre_agencia: string;
  token: string;
  proyecto_nombre: string;
  proyecto_id: string;
  constructora_id: string;
  activo: boolean;
  created_at: string;
  unidades_reservadas: number;
  unidades_vendidas: number;
  volumen_reservado: number;
  volumen_vendido: number;
}

export default function BrokersPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<BrokerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'activos'>('activos');

  const cargarBrokers = useCallback(async () => {
    setLoading(true);

    // Traer todos los accesos con su proyecto
    const { data: accesos } = await supabase
      .from('proyecto_accesos')
      .select('*, proyectos(id, nombre, constructora_id)')
      .order('created_at', { ascending: false });

    if (!accesos) { setLoading(false); return; }

    // Para cada acceso calcular unidades y volumen
    const brokersData: BrokerStats[] = [];

    for (const acceso of accesos) {
      const proyectoId = acceso.proyecto_id;

      // Unidades reservadas por este broker
      const { data: unidadesReservadas } = await supabase
        .from('unidades')
        .select('precio')
        .eq('proyecto_id', proyectoId)
        .eq('estado', 'reservado')
        .eq('reservado_por', acceso.nombre_agencia);

      // Unidades vendidas donde el broker participó
      const { data: unidadesVendidas } = await supabase
        .from('unidades')
        .select('precio')
        .eq('proyecto_id', proyectoId)
        .eq('estado', 'vendido')
        .eq('reservado_por', acceso.nombre_agencia);

      const volumenReservado = (unidadesReservadas || []).reduce((s, u) => s + (u.precio || 0), 0);
      const volumenVendido = (unidadesVendidas || []).reduce((s, u) => s + (u.precio || 0), 0);

      brokersData.push({
        nombre_agencia: acceso.nombre_agencia || 'Sin nombre',
        token: acceso.token,
        proyecto_nombre: acceso.proyectos?.nombre || '—',
        proyecto_id: acceso.proyecto_id,
        constructora_id: acceso.proyectos?.constructora_id || '',
        activo: acceso.activo,
        created_at: acceso.created_at,
        unidades_reservadas: unidadesReservadas?.length || 0,
        unidades_vendidas: unidadesVendidas?.length || 0,
        volumen_reservado: volumenReservado,
        volumen_vendido: volumenVendido,
      });
    }

    setBrokers(brokersData);
    setLoading(false);
  }, []);

  useEffect(() => { cargarBrokers(); }, [cargarBrokers]);

  const copiarLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/proyecto/${token}`);
  };

  const desactivarAcceso = async (token: string) => {
    await supabase.from('proyecto_accesos').update({ activo: false }).eq('token', token);
    cargarBrokers();
  };

  const brokersFiltrados = filtro === 'activos' ? brokers.filter(b => b.activo) : brokers;
  const totalVolumen = brokers.filter(b => b.activo).reduce((s, b) => s + b.volumen_reservado + b.volumen_vendido, 0);
  const totalReservadas = brokers.filter(b => b.activo).reduce((s, b) => s + b.unidades_reservadas, 0);
  const totalVendidas = brokers.filter(b => b.activo).reduce((s, b) => s + b.unidades_vendidas, 0);

  if (loading) return (
    <div className="p-8 text-center py-32 text-zinc-500 font-mono text-sm animate-pulse">Cargando brokers...</div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-zinc-100">

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Red de Ventas</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Brokers Autorizados</h1>
        <p className="text-sm text-zinc-300 mt-1">Agencias y brokers con acceso a tus proyectos.</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Brokers activos</p>
          <p className="text-3xl font-bold font-mono text-white">{brokers.filter(b => b.activo).length}</p>
        </div>
        <div className="bg-[#18181b] border border-amber-400/20 rounded-xl p-5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Unidades reservadas</p>
          <p className="text-3xl font-bold font-mono text-amber-400">{totalReservadas}</p>
        </div>
        <div className="bg-[#18181b] border border-red-500/20 rounded-xl p-5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Unidades vendidas</p>
          <p className="text-3xl font-bold font-mono text-red-400">{totalVendidas}</p>
        </div>
        <div className="bg-[#18181b] border border-[#d4ff3b]/20 rounded-xl p-5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Volumen total</p>
          <p className="text-2xl font-bold font-mono text-[#d4ff3b]">${totalVolumen.toLocaleString()}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[['activos', 'Activos'], ['todos', 'Todos']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFiltro(val as any)}
            className={`text-xs px-4 py-2 rounded-lg font-mono uppercase tracking-wider transition border ${filtro === val ? 'bg-[#d4ff3b] text-black border-[#d4ff3b]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Lista de brokers */}
      {brokersFiltrados.length === 0 ? (
        <div className="text-center py-32 bg-[#18181b] border border-zinc-800 rounded-2xl">
          <div className="text-5xl mb-4">🤝</div>
          <p className="text-zinc-400 font-medium mb-2">Sin brokers registrados</p>
          <p className="text-zinc-400 text-sm">Genera un link desde la página de tu proyecto para autorizar brokers</p>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Header tabla */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <p className="col-span-3 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Broker / Agencia</p>
            <p className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Proyecto</p>
            <p className="col-span-1 text-[10px] text-zinc-500 uppercase tracking-wider font-mono text-center">Reservadas</p>
            <p className="col-span-1 text-[10px] text-zinc-500 uppercase tracking-wider font-mono text-center">Vendidas</p>
            <p className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-wider font-mono text-right">Volumen</p>
            <p className="col-span-1 text-[10px] text-zinc-500 uppercase tracking-wider font-mono text-center">Estado</p>
            <p className="col-span-2 text-[10px] text-zinc-500 uppercase tracking-wider font-mono text-right">Acciones</p>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {brokersFiltrados.map((b, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-900/30 transition items-center">
                {/* Nombre */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                      {b.nombre_agencia.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{b.nombre_agencia}</p>
                      <p className="text-zinc-600 text-[10px] font-mono">
                        {new Date(b.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proyecto */}
                <div className="col-span-2">
                  <p className="text-zinc-300 text-sm truncate">{b.proyecto_nombre}</p>
                </div>

                {/* Reservadas */}
                <div className="col-span-1 text-center">
                  <span className={`font-mono font-bold text-sm ${b.unidades_reservadas > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                    {b.unidades_reservadas}
                  </span>
                </div>

                {/* Vendidas */}
                <div className="col-span-1 text-center">
                  <span className={`font-mono font-bold text-sm ${b.unidades_vendidas > 0 ? 'text-red-400' : 'text-zinc-600'}`}>
                    {b.unidades_vendidas}
                  </span>
                </div>

                {/* Volumen */}
                <div className="col-span-2 text-right">
                  <p className={`font-mono font-bold text-sm ${b.volumen_reservado + b.volumen_vendido > 0 ? 'text-[#d4ff3b]' : 'text-zinc-600'}`}>
                    ${(b.volumen_reservado + b.volumen_vendido).toLocaleString()}
                  </p>
                  {b.volumen_reservado > 0 && b.volumen_vendido > 0 && (
                    <p className="text-zinc-600 text-[10px] font-mono">${b.volumen_reservado.toLocaleString()} reservado</p>
                  )}
                </div>

                {/* Estado */}
                <div className="col-span-1 text-center">
                  <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${b.activo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                    {b.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button onClick={() => copiarLink(b.token)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] px-3 py-1.5 rounded-lg transition font-mono">
                    Copiar link
                  </button>
                  {b.activo && (
                    <button onClick={() => desactivarAcceso(b.token)}
                      className="bg-zinc-900 hover:bg-red-950/40 text-zinc-600 hover:text-red-400 text-[10px] px-2 py-1.5 rounded-lg transition border border-zinc-800">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
