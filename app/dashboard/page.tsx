"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DashboardIndexPage() {
  const [stats, setStats] = useState({ propiedades: 0, clientes: 0, carga: true });

  useEffect(() => {
    async function cargarMetricas() {
      try {
        // Cuenta los registros reales de tu tabla 'propiedades'
        const { count: countProps } = await supabase
          .from('propiedades')
          .select('*', { count: 'exact', head: true });

        // Cuenta los registros reales de tu tabla 'clientes'
        const { count: countClientes } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true });

        setStats({
          propiedades: countProps || 0,
          clientes: countClientes || 0,
          carga: false
        });
      } catch (err) {
        console.error("Error cargando métricas del dashboard:", err);
        setStats((prev) => ({ ...prev, carga: false }));
      }
    }
    cargarMetricas();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-transparent text-zinc-100">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Panel de Control General</h1>
          <p className="text-sm text-zinc-400 mt-1">Bienvenido a SECTOR. Vista unificada del inventario y operaciones comerciales.</p>
        </div>
        <span className="bg-[#d4ff3b]/10 text-[#d4ff3b] border border-[#d4ff3b]/20 text-xs px-3 py-1.5 rounded-full font-mono uppercase tracking-widest">
          Sincronizado
        </span>
      </div>

      {/* REJILLA DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* PROPIEDADES */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Propiedades en Inventario</span>
            <h3 className="text-4xl font-bold text-white font-mono mt-2">
              {stats.carga ? '...' : stats.propiedades}
            </h3>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/60">
            <Link href="/dashboard/properties" className="text-xs text-[#d4ff3b] hover:underline font-medium flex items-center gap-1">
              Administrar catálogo de lujo ↗
            </Link>
          </div>
        </div>

        {/* CLIENTES */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Clientes Activos</span>
            <h3 className="text-4xl font-bold text-white font-mono mt-2">
              {stats.carga ? '...' : stats.clientes}
            </h3>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/60">
            <Link href="/dashboard/clients" className="text-xs text-zinc-400 hover:text-white hover:underline font-medium flex items-center gap-1">
              Ver base de datos de leads ↗
            </Link>
          </div>
        </div>

        {/* STATUS GLOBAL */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Servidor de Datos</span>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full bg-[#d4ff3b] animate-pulse" />
              <h3 className="text-md font-semibold text-white tracking-tight">Supabase Conectado</h3>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/60">
            <span className="text-[11px] text-zinc-500 font-mono">Entorno: Production Main</span>
          </div>
        </div>

      </div>

      {/* ACCESO TÁCTICO */}
      <div className="bg-gradient-to-r from-zinc-900 to-[#18181b] border border-zinc-800 p-8 rounded-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl font-bold text-white tracking-tight">Showroom Inmobiliario Activo</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Tu visualizador flotante multimedios de propiedades y la inserción directa a la base de datos están listos en la sección comercial.
          </p>
          <div className="mt-5">
            <Link href="/dashboard/properties" className="inline-block bg-[#d4ff3b] hover:bg-[#c2eb30] text-black font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-md shadow-[#d4ff3b]/5">
              Abrir Módulo de Propiedades
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}