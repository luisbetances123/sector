"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

interface Stats {
  proyectos: number;
  unidades_total: number;
  unidades_libres: number;
  unidades_reservadas: number;
  unidades_vendidas: number;
  cuotas_vencidas: number;
  cuotas_vencidas_monto: number;
  incidencias_abiertas: number;
  constructora_id: string | null;
  constructora_nombre: string | null;
  loading: boolean;
}

interface MovimientoReciente {
  id: string;
  estado_nuevo: string;
  estado_anterior: string;
  actor: string | null;
  created_at: string;
  unidad_numero: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    proyectos: 0, unidades_total: 0, unidades_libres: 0,
    unidades_reservadas: 0, unidades_vendidas: 0,
    cuotas_vencidas: 0, cuotas_vencidas_monto: 0,
    incidencias_abiertas: 0, constructora_id: null,
    constructora_nombre: null, loading: true,
  });
  const [movimientos, setMovimientos] = useState<MovimientoReciente[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Constructora
      const { data: constructora } = await supabase
        .from('constructoras').select('id, nombre').eq('activa', true).limit(1).maybeSingle();

      if (!constructora) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Proyectos
      const { data: proyectos } = await supabase
        .from('proyectos').select('id').eq('constructora_id', constructora.id);
      const proyectoIds = proyectos?.map(p => p.id) || [];

      // Unidades
      const { data: unidades } = proyectoIds.length > 0
        ? await supabase.from('unidades').select('estado').in('proyecto_id', proyectoIds)
        : { data: [] };

      const libres = unidades?.filter(u => u.estado === 'libre').length || 0;
      const reservadas = unidades?.filter(u => u.estado === 'reservado').length || 0;
      const vendidas = unidades?.filter(u => u.estado === 'vendido').length || 0;

      // Cuotas vencidas
      const hoy = new Date().toISOString().split('T')[0];
      const { data: cuotasVencidas } = await supabase
        .from('cuotas').select('monto')
        .eq('estado', 'pendiente')
        .lt('fecha_vencimiento', hoy);
      const montoVencido = cuotasVencidas?.reduce((sum, c) => sum + c.monto, 0) || 0;

      // Incidencias abiertas
      const { count: incidencias } = await supabase
        .from('incidencias').select('*', { count: 'exact', head: true }).eq('estado', 'abierta');

      // Movimientos recientes
      const { data: hist } = await supabase
        .from('unidad_historial').select('*').order('created_at', { ascending: false }).limit(5);

      // Enriquecer con número de unidad
      const movimientosEnriquecidos: MovimientoReciente[] = [];
      for (const h of hist || []) {
        const { data: u } = await supabase.from('unidades').select('numero').eq('id', h.unidad_id).single();
        movimientosEnriquecidos.push({ ...h, unidad_numero: u?.numero || '—' });
      }

      setStats({
        proyectos: proyectoIds.length,
        unidades_total: unidades?.length || 0,
        unidades_libres: libres,
        unidades_reservadas: reservadas,
        unidades_vendidas: vendidas,
        cuotas_vencidas: cuotasVencidas?.length || 0,
        cuotas_vencidas_monto: montoVencido,
        incidencias_abiertas: incidencias || 0,
        constructora_id: constructora.id,
        constructora_nombre: constructora.nombre,
        loading: false,
      });
      setMovimientos(movimientosEnriquecidos);
    } catch (error) {
      console.error('Error:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const ESTADO_COLORES: Record<string, string> = {
    libre: 'text-emerald-400', reservado: 'text-amber-400', vendido: 'text-red-400',
  };

  const pctVendido = stats.unidades_total > 0
    ? Math.round((stats.unidades_vendidas / stats.unidades_total) * 100) : 0;
  const pctReservado = stats.unidades_total > 0
    ? Math.round((stats.unidades_reservadas / stats.unidades_total) * 100) : 0;

  if (stats.loading) return (
    <div className="p-10 min-h-screen bg-transparent text-zinc-500 font-mono text-sm animate-pulse flex items-center justify-center">
      Cargando dashboard...
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Panel General</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {stats.constructora_nombre || 'Dashboard de SECTOR'}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Resumen operativo en tiempo real.</p>
      </div>

      {/* Sin constructora */}
      {!stats.constructora_nombre && (
        <div className="text-center py-32">
          <div className="text-5xl mb-4">🏗️</div>
          <p className="text-zinc-400 font-medium mb-2">No hay constructora configurada</p>
          <button onClick={() => router.push('/dashboard/constructoras')}
            className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-3 rounded-lg font-semibold transition mt-4">
            Configurar mi empresa →
          </button>
        </div>
      )}

      {stats.constructora_nombre && (
        <>
          {/* Fila 1 — Proyectos y unidades */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-600 transition"
              onClick={() => router.push(`/dashboard/constructoras/${stats.constructora_id}/proyectos`)}>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Proyectos</p>
              <p className="text-3xl font-bold font-mono text-white">{stats.proyectos}</p>
              <p className="text-xs text-zinc-600 mt-2">Ver proyectos →</p>
            </div>
            <div className="bg-[#18181b] border border-emerald-500/20 rounded-xl p-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Disponibles</p>
              <p className="text-3xl font-bold font-mono text-emerald-400">{stats.unidades_libres}</p>
              <p className="text-xs text-zinc-600 mt-2">de {stats.unidades_total} unidades</p>
            </div>
            <div className="bg-[#18181b] border border-amber-400/20 rounded-xl p-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Reservadas</p>
              <p className="text-3xl font-bold font-mono text-amber-400">{stats.unidades_reservadas}</p>
              <p className="text-xs text-zinc-600 mt-2">{pctReservado}% del inventario</p>
            </div>
            <div className="bg-[#18181b] border border-red-500/20 rounded-xl p-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Vendidas</p>
              <p className="text-3xl font-bold font-mono text-red-400">{stats.unidades_vendidas}</p>
              <p className="text-xs text-zinc-600 mt-2">{pctVendido}% del inventario</p>
            </div>
          </div>

          {/* Barra de absorción */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Absorción del inventario</p>
              <p className="text-xs text-zinc-400 font-mono">{stats.unidades_total} unidades totales</p>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 flex overflow-hidden">
              <div className="bg-red-500 h-3 transition-all" style={{ width: `${pctVendido}%` }} />
              <div className="bg-amber-400 h-3 transition-all" style={{ width: `${pctReservado}%` }} />
              <div className="bg-emerald-500 h-3 transition-all" style={{ width: `${100 - pctVendido - pctReservado}%` }} />
            </div>
            <div className="flex gap-4 mt-3">
              {[['bg-red-500', 'Vendidas'], ['bg-amber-400', 'Reservadas'], ['bg-emerald-500', 'Libres']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fila 2 — Alertas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`bg-[#18181b] border rounded-xl p-5 ${stats.cuotas_vencidas > 0 ? 'border-red-500/30' : 'border-zinc-800'}`}>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Cuotas vencidas</p>
              <p className={`text-3xl font-bold font-mono ${stats.cuotas_vencidas > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                {stats.cuotas_vencidas}
              </p>
              {stats.cuotas_vencidas > 0 && (
                <p className="text-red-400/70 text-xs mt-2 font-mono">${stats.cuotas_vencidas_monto.toLocaleString()} pendientes</p>
              )}
              {stats.cuotas_vencidas === 0 && <p className="text-zinc-600 text-xs mt-2">Todo al día ✓</p>}
            </div>
            <div className={`bg-[#18181b] border rounded-xl p-5 ${stats.incidencias_abiertas > 0 ? 'border-amber-400/30' : 'border-zinc-800'}`}>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-2">Incidencias abiertas</p>
              <p className={`text-3xl font-bold font-mono ${stats.incidencias_abiertas > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                {stats.incidencias_abiertas}
              </p>
              {stats.incidencias_abiertas === 0 && <p className="text-zinc-600 text-xs mt-2">Sin pendientes ✓</p>}
              {stats.incidencias_abiertas > 0 && <p className="text-amber-400/70 text-xs mt-2">Requieren atención</p>}
            </div>
          </div>

          {/* Movimientos recientes */}
          {movimientos.length > 0 && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Actividad reciente</p>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {movimientos.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">
                          Unidad <span className="font-bold">{m.unidad_numero}</span>
                          {' '}<span className="text-zinc-500">→</span>{' '}
                          <span className={ESTADO_COLORES[m.estado_nuevo] || 'text-zinc-400'}>
                            {m.estado_nuevo === 'libre' ? 'Liberada' : m.estado_nuevo === 'reservado' ? 'Reservada' : 'Vendida'}
                          </span>
                        </p>
                        {m.actor && <p className="text-zinc-600 text-xs">{m.actor}</p>}
                      </div>
                    </div>
                    <p className="text-zinc-600 text-xs font-mono">
                      {new Date(m.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
