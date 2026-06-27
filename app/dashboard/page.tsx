"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

interface AlertaReserva {
  id: string;
  numero: string;
  reservado_por: string | null;
  reservado_hasta: string;
  proyecto_nombre: string;
  horas_restantes: number;
}

interface AlertaCuota {
  id: string;
  descripcion: string;
  monto: number;
  fecha_vencimiento: string;
  dias_vencida: number;
  unidad_numero: string;
  cliente_nombre: string | null;
}

interface AlertaIncidencia {
  id: string;
  titulo: string;
  prioridad: string;
  created_at: string;
  dias_abierta: number;
  unidad_numero: string;
}

interface Stats {
  proyectos: number;
  unidades_libres: number;
  unidades_reservadas: number;
  unidades_vendidas: number;
  unidades_total: number;
  cuotas_vencidas_monto: number;
  constructora_id: string | null;
  constructora_nombre: string | null;
}

function tiempoRestante(hasta: string): number {
  return Math.max(0, (new Date(hasta).getTime() - Date.now()) / 1000 / 60 / 60);
}

function diasDesde(fecha: string): number {
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 1000 / 60 / 60 / 24);
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    proyectos: 0, unidades_libres: 0, unidades_reservadas: 0,
    unidades_vendidas: 0, unidades_total: 0, cuotas_vencidas_monto: 0,
    constructora_id: null, constructora_nombre: null,
  });
  const [alertasReserva, setAlertasReserva] = useState<AlertaReserva[]>([]);
  const [alertasCuotas, setAlertasCuotas] = useState<AlertaCuota[]>([]);
  const [alertasIncidencias, setAlertasIncidencias] = useState<AlertaIncidencia[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const { data: constructora } = await supabase
      .from('constructoras').select('id, nombre').eq('activa', true).limit(1).maybeSingle();
    if (!constructora) { setLoading(false); return; }

    const { data: proyectos } = await supabase
      .from('proyectos').select('id, nombre').eq('constructora_id', constructora.id);
    const proyectoIds = proyectos?.map(p => p.id) || [];
    const proyectoMap = Object.fromEntries(proyectos?.map(p => [p.id, p.nombre]) || []);

    const { data: unidades } = proyectoIds.length > 0
      ? await supabase.from('unidades').select('*').in('proyecto_id', proyectoIds)
      : { data: [] };

    // Stats básicas
    const libres = unidades?.filter(u => u.estado === 'libre').length || 0;
    const reservadas = unidades?.filter(u => u.estado === 'reservado').length || 0;
    const vendidas = unidades?.filter(u => u.estado === 'vendido').length || 0;

    // Alertas de reservas por vencer (menos de 6 horas)
    const reservasPorVencer: AlertaReserva[] = (unidades || [])
      .filter(u => u.estado === 'reservado' && u.reservado_hasta)
      .map(u => ({
        id: u.id,
        numero: u.numero,
        reservado_por: u.reservado_por,
        reservado_hasta: u.reservado_hasta,
        proyecto_nombre: proyectoMap[u.proyecto_id] || '—',
        horas_restantes: tiempoRestante(u.reservado_hasta),
      }))
      .filter(u => u.horas_restantes < 6)
      .sort((a, b) => a.horas_restantes - b.horas_restantes);

    setAlertasReserva(reservasPorVencer);

    // Cuotas vencidas
    const hoy = new Date().toISOString().split('T')[0];
    const { data: cuotasVencidas } = await supabase
      .from('cuotas')
      .select('*, planes_pago(unidad_id, unidades(cliente_nombre))')
      .eq('estado', 'pendiente').lt('fecha_vencimiento', hoy)
      .order('fecha_vencimiento', { ascending: true });

    const alertasCuotasData: AlertaCuota[] = [];
    for (const c of cuotasVencidas || []) {
      const unidadId = c.planes_pago?.unidad_id;
      if (unidadId) {
        const unidad = unidades?.find(u => u.id === unidadId);
        alertasCuotasData.push({
          id: c.id,
          descripcion: c.descripcion,
          monto: c.monto,
          fecha_vencimiento: c.fecha_vencimiento,
          dias_vencida: diasDesde(c.fecha_vencimiento),
          unidad_numero: unidad?.numero || '—',
          cliente_nombre: c.planes_pago?.unidades?.cliente_nombre || null,
        });
      }
    }
    setAlertasCuotas(alertasCuotasData);

    // Incidencias abiertas hace más de 3 días
    const { data: incidencias } = await supabase
      .from('incidencias').select('*, unidades(numero)')
      .eq('estado', 'abierta').order('created_at', { ascending: true }).limit(10);

    const alertasInc: AlertaIncidencia[] = (incidencias || [])
      .map(i => ({
        id: i.id,
        titulo: i.titulo,
        prioridad: i.prioridad,
        created_at: i.created_at,
        dias_abierta: diasDesde(i.created_at),
        unidad_numero: i.unidades?.numero || '—',
      }))
      .sort((a, b) => b.dias_abierta - a.dias_abierta);
    setAlertasIncidencias(alertasInc);

    const montoVencido = alertasCuotasData.reduce((sum, c) => sum + c.monto, 0);

    setStats({
      proyectos: proyectoIds.length,
      unidades_libres: libres,
      unidades_reservadas: reservadas,
      unidades_vendidas: vendidas,
      unidades_total: unidades?.length || 0,
      cuotas_vencidas_monto: montoVencido,
      constructora_id: constructora.id,
      constructora_nombre: constructora.nombre,
    });
    setLoading(false);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const pctVendido = stats.unidades_total > 0 ? Math.round((stats.unidades_vendidas / stats.unidades_total) * 100) : 0;
  const pctReservado = stats.unidades_total > 0 ? Math.round((stats.unidades_reservadas / stats.unidades_total) * 100) : 0;
  const totalAlertas = alertasReserva.length + alertasCuotas.length + alertasIncidencias.length;

  if (loading) return (
    <div className="p-10 min-h-screen text-white font-mono text-sm animate-pulse flex items-center justify-center">
      Cargando dashboard...
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-zinc-100">

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5 flex justify-between items-end">
        <div>
          <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Panel General</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">{stats.constructora_nombre || 'Dashboard'}</h1>
          <p className="text-sm text-white mt-1">
            {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {totalAlertas > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-right">
            <p className="text-red-400 font-bold text-lg">{totalAlertas}</p>
            <p className="text-red-400/70 text-[10px] uppercase tracking-wider">acciones pendientes</p>
          </div>
        )}
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Proyectos', value: stats.proyectos, color: 'text-white', border: 'border-zinc-800', sub: 'activos', action: () => router.push(`/dashboard/constructoras/${stats.constructora_id}/proyectos`) },
          { label: 'Disponibles', value: stats.unidades_libres, color: 'text-emerald-400', border: 'border-emerald-500/20', sub: `de ${stats.unidades_total} unidades` },
          { label: 'Reservadas', value: stats.unidades_reservadas, color: 'text-amber-400', border: 'border-amber-400/20', sub: `${pctReservado}% del inventario` },
          { label: 'Vendidas', value: stats.unidades_vendidas, color: 'text-red-400', border: 'border-red-500/20', sub: `${pctVendido}% del inventario` },
        ].map(m => (
          <div key={m.label} onClick={m.action} className={`bg-[#18181b] border ${m.border} rounded-xl p-5 ${m.action ? 'cursor-pointer hover:border-zinc-600 transition' : ''}`}>
            <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-2">{m.label}</p>
            <p className={`text-3xl font-bold font-mono ${m.color}`}>{m.value}</p>
            <p className="text-xs text-white mt-2">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Barra absorción */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono">Absorción del inventario</p>
          <p className="text-xs text-white font-mono">{stats.unidades_total} unidades totales</p>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 flex overflow-hidden">
          <div className="bg-red-500 h-3 transition-all" style={{ width: `${pctVendido}%` }} />
          <div className="bg-amber-400 h-3 transition-all" style={{ width: `${pctReservado}%` }} />
          <div className="bg-emerald-500 h-3 transition-all" style={{ width: `${100 - pctVendido - pctReservado}%` }} />
        </div>
        <div className="flex gap-4 mt-3">
          {[['bg-red-500', 'Vendidas', stats.unidades_vendidas], ['bg-amber-400', 'Reservadas', stats.unidades_reservadas], ['bg-emerald-500', 'Libres', stats.unidades_libres]].map(([color, label, val]) => (
            <div key={String(label)} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-[10px] text-white">{label}: <span className="text-white font-mono">{val}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Reservas por vencer */}
        <div className={`bg-[#18181b] border rounded-xl overflow-hidden ${alertasReserva.length > 0 ? 'border-amber-400/30' : 'border-zinc-800'}`}>
          <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
            <p className="text-[10px] text-white uppercase tracking-wider font-mono">⏱ Reservas por vencer</p>
            <span className={`text-xs font-mono font-bold ${alertasReserva.length > 0 ? 'text-amber-400' : 'text-white'}`}>{alertasReserva.length}</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {alertasReserva.length === 0 ? (
              <p className="text-white text-xs p-5 text-center">Sin reservas críticas ✓</p>
            ) : alertasReserva.map(a => (
              <div key={a.id} className="px-5 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-bold">Unidad {a.numero}</p>
                    <p className="text-white text-xs">{a.proyecto_nombre}</p>
                    {a.reservado_por && <p className="text-white text-xs">{a.reservado_por}</p>}
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${a.horas_restantes < 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-400/20 text-amber-400'}`}>
                    {a.horas_restantes < 1 ? `${Math.round(a.horas_restantes * 60)}m` : `${Math.round(a.horas_restantes)}h`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuotas vencidas */}
        <div className={`bg-[#18181b] border rounded-xl overflow-hidden ${alertasCuotas.length > 0 ? 'border-red-500/30' : 'border-zinc-800'}`}>
          <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
            <p className="text-[10px] text-white uppercase tracking-wider font-mono">💸 Cuotas vencidas</p>
            <span className={`text-xs font-mono font-bold ${alertasCuotas.length > 0 ? 'text-red-400' : 'text-white'}`}>{alertasCuotas.length}</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {alertasCuotas.length === 0 ? (
              <p className="text-white text-xs p-5 text-center">Todo al día ✓</p>
            ) : alertasCuotas.slice(0, 4).map(c => (
              <div key={c.id} className="px-5 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-bold">Unidad {c.unidad_numero}</p>
                    {c.cliente_nombre && <p className="text-white text-xs">{c.cliente_nombre}</p>}
                    <p className="text-red-400/70 text-xs">{c.dias_vencida}d vencida</p>
                  </div>
                  <span className="text-red-400 text-xs font-mono font-bold">${c.monto.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {alertasCuotas.length > 0 && (
              <div className="px-5 py-3 bg-red-500/5">
                <p className="text-red-400 font-mono font-bold text-sm">${stats.cuotas_vencidas_monto.toLocaleString()}</p>
                <p className="text-red-400/60 text-[10px]">Total vencido</p>
              </div>
            )}
          </div>
        </div>

        {/* Incidencias sin atender */}
        <div className={`bg-[#18181b] border rounded-xl overflow-hidden ${alertasIncidencias.length > 0 ? 'border-orange-500/30' : 'border-zinc-800'}`}>
          <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
            <p className="text-[10px] text-white uppercase tracking-wider font-mono">🔧 Incidencias abiertas</p>
            <span className={`text-xs font-mono font-bold ${alertasIncidencias.length > 0 ? 'text-orange-400' : 'text-white'}`}>{alertasIncidencias.length}</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {alertasIncidencias.length === 0 ? (
              <p className="text-white text-xs p-5 text-center">Sin incidencias ✓</p>
            ) : alertasIncidencias.slice(0, 4).map(i => (
              <div key={i.id} className="px-5 py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{i.titulo}</p>
                    <p className="text-white text-xs">Unidad {i.unidad_numero}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${i.prioridad === 'alta' ? 'bg-red-500/20 text-red-400' : i.prioridad === 'media' ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {i.prioridad}
                    </span>
                    <span className="text-white text-[10px] font-mono">{i.dias_abierta}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5">
        <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-4">Resumen financiero</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-white text-xs mb-1">Unidades vendidas</p>
            <p className="text-white font-mono font-bold text-lg">{stats.unidades_vendidas}</p>
          </div>
          <div>
            <p className="text-white text-xs mb-1">Cartera vencida</p>
            <p className={`font-mono font-bold text-lg ${stats.cuotas_vencidas_monto > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ${stats.cuotas_vencidas_monto.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-white text-xs mb-1">Incidencias abiertas</p>
            <p className={`font-mono font-bold text-lg ${alertasIncidencias.length > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {alertasIncidencias.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// Tue Jun 16 04:42:19 UTC 2026
// Tue Jun 16 19:46:16 UTC 2026
