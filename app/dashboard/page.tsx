"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Actividad {
  id: number;
  tipo: string;
  detalle: string;
  tiempo: string;
  monto?: string;
}

export default function DashboardAdvancedPage() {
  const [stats, setStats] = useState({ propiedades: 0, clientes: 0, carga: true });
  const [volumenNegocios, setVolumenNegocios] = useState("$24.8M USD");

  // Historial operativo denso simulado para poblar el feed ejecutivo
  const [actividades, setActividades] = useState<Actividad[]>([
    { id: 1, tipo: "Cierre", detalle: "Penthouse Vista al Golf - Asignado a cliente Premium", tiempo: "Hace 12 min", monto: "$4,250,000" },
    { id: 2, tipo: "Lead", detalle: "Nuevo registro interesado en Residencia Tropical", tiempo: "Hace 45 min" },
    { id: 3, tipo: "Pipeline", detalle: "Sky Loft Central avanzado a fase de Inspección Técnica", tiempo: "Hace 2 horas", monto: "$750,000" },
    { id: 4, tipo: "Update", detalle: "Ajuste de precio aplicado a catálogo base por actualización cambiaria", tiempo: "Hace 4 horas" },
    { id: 5, tipo: "Auditoría", detalle: "Sincronización exitosa con el caché de esquemas de Supabase", tiempo: "Hace 1 día" }
  ]);

  useEffect(() => {
    async function cargarMetricas() {
      try {
        const { count: countProps } = await supabase
          .from('propiedades')
          .select('*', { count: 'exact', head: true });

        const { count: countClientes } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true });

        setStats({
          propiedades: countProps || 0,
          clientes: countClientes || 0,
          carga: false
        });
      } catch (err) {
        console.error(err);
        setStats((prev) => ({ ...prev, carga: false }));
      }
    }
    cargarMetricas();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-transparent text-zinc-100 space-y-8">
      
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-white">Consola de Inteligencia Comercial</h1>
            <span className="bg-[#d4ff3b]/10 text-[#d4ff3b] border border-[#d4ff3b]/30 text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">
              v2.4 Core
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">Monitoreo analítico integral, analíticas de portafolio y sincronización en tiempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#18181b] border border-zinc-800 px-4 py-2 rounded-xl text-right">
            <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Cartera Controlada</span>
            <span className="text-sm font-mono font-bold text-white">{volumenNegocios}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 p-2.5 rounded-xl text-xs font-medium transition"
            title="Refrescar métricas core"
          >
            🔄
          </button>
        </div>
      </div>

      {/* METRICAS PRINCIPALES (REJILLA DE 4 COLUMNAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">Activos de Lujo</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold font-mono text-white">{stats.carga ? '...' : stats.propiedades}</span>
              <span className="text-xs text-[#d4ff3b] font-mono font-medium">Unidades</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono">Showroom Activo</span>
            <Link href="/dashboard/properties" className="text-[#d4ff3b] hover:underline font-medium">Gestionar ↗</Link>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">Leads Calificados</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold font-mono text-white">{stats.carga ? '...' : stats.clientes}</span>
              <span className="text-xs text-blue-400 font-mono font-medium">Inversores</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono">CRM Data Pool</span>
            <Link href="/dashboard/clients" className="text-zinc-400 hover:text-white hover:underline font-medium">Ver Leads ↗</Link>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">Tasa de Conversión</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-bold font-mono text-white">64.2%</span>
              <span className="text-xs text-emerald-400 font-mono font-medium">▲ +4.1%</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono">Cierres del Trimestre</span>
            <span className="text-zinc-400 font-mono font-medium">Óptimo</span>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block">Sincronización Cloud</span>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4ff3b] animate-pulse" />
              <span className="text-lg font-bold text-white tracking-tight font-mono">Supabase Live</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-zinc-800/60 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono">Región: us-west-1</span>
            <span className="text-zinc-500 font-mono">SSL Secure</span>
          </div>
        </div>

      </div>

      {/* SECCIÓN ANALÍTICA COMPUESTA (GRÁFICOS SIMULADOS + FEED DE ACTIVIDAD) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL IZQUIERDO: RENDIMIENTO DE VOLUMEN Y DISTRIBUCIÓN POR SECTOR */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-xl lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase font-mono tracking-wider">📊 Proyección Analítica de Inventario</h3>
            <span className="text-xs text-zinc-500 font-mono">Métricas acumuladas</span>
          </div>

          {/* GRÁFICO DE BARRAS TÁCTICO CON TAILWIND */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span>Sector Premium (Evaristo Morales, Piantini, Bella Vista)</span>
                <span className="text-white font-bold">70% de cuota</span>
              </div>
              <div className="w-full bg-[#09090b] h-3 rounded-full overflow-hidden border border-zinc-800/80">
                <div className="bg-[#d4ff3b] h-full rounded-full transition-all duration-1000" style={{ width: '70%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span>Zonas Costeras (Vista al Mar, Cap Cana)</span>
                <span className="text-white font-bold">20% de cuota</span>
              </div>
              <div className="w-full bg-[#09090b] h-3 rounded-full overflow-hidden border border-zinc-800/80">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: '20%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span>Proyectos Comerciales / Corporativos</span>
                <span className="text-white font-bold">10% de cuota</span>
              </div>
              <div className="w-full bg-[#09090b] h-3 rounded-full overflow-hidden border border-zinc-800/80">
                <div className="bg-zinc-700 h-full rounded-full transition-all duration-1000" style={{ width: '10%' }} />
              </div>
            </div>
          </div>

          {/* CONTENEDOR INFORMATIVO EXTRA */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/60 text-center">
            <div className="bg-[#09090b]/50 p-3 rounded-lg border border-zinc-800/40">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Precio Promedio</span>
              <span className="text-sm font-bold font-mono text-white mt-1 block">$2.1M</span>
            </div>
            <div className="bg-[#09090b]/50 p-3 rounded-lg border border-zinc-800/40">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Días en Mercado</span>
              <span className="text-sm font-bold font-mono text-white mt-1 block">18 días</span>
            </div>
            <div className="bg-[#09090b]/50 p-3 rounded-lg border border-zinc-800/40">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase">Margen Neto</span>
              <span className="text-sm font-bold font-mono text-[#d4ff3b] mt-1 block">5.4%</span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: FEED DE OPERACIONES RECIENTES EN VIVO */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase font-mono tracking-wider">⚡ Actividad Operativa</h3>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* LISTA DENSA DE OPERACIONES */}
            <div className="space-y-3.5">
              {actividades.map((act) => (
                <div key={act.id} className="bg-[#09090b]/50 p-3 rounded-lg border border-zinc-800/40 flex items-start justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        act.tipo === 'Cierre' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                        act.tipo === 'Lead' ? 'bg-blue-950 text-blue-400 border border-blue-800/40' :
                        'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                        {act.tipo}
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">{act.tiempo}</span>
                    </div>
                    <p className="text-zinc-300 leading-snug font-medium">{act.detalle}</p>
                  </div>
                  {act.monto && (
                    <span className="text-white font-mono font-bold text-right self-center shrink-0">
                      {act.monto}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/60 mt-4">
            <Link