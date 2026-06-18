"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';

interface ResumenProyecto {
  proyecto_id: string;
  proyecto_nombre: string;
  total_cobrado: number;
  total_pendiente: number;
  total_vencido: number;
  total_plan: number;
  cuotas_cobradas: number;
  cuotas_pendientes: number;
  cuotas_vencidas: number;
}

interface CuotaDetalle {
  id: string;
  unidad_numero: string;
  cliente_nombre: string | null;
  descripcion: string | null;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  estado: string;
  dias_vencida: number;
  proyecto_nombre: string;
}

export default function CobranzaPage() {
  const [resumenes, setResumenes] = useState<ResumenProyecto[]>([]);
  const [cuotasVencidas, setCuotasVencidas] = useState<CuotaDetalle[]>([]);
  const [cuotasProximas, setCuotasProximas] = useState<CuotaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'resumen' | 'vencidas' | 'proximas'>('resumen');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const hoy = new Date().toISOString().split('T')[0];
    const en30dias = new Date(); en30dias.setDate(en30dias.getDate() + 30);
    const en30 = en30dias.toISOString().split('T')[0];

    // Traer constructora y proyectos
    const { data: constructora } = await supabase.from('constructoras').select('id').limit(1).maybeSingle();
    if (!constructora) { setLoading(false); return; }

    const { data: proyectos } = await supabase.from('proyectos').select('id, nombre').eq('constructora_id', constructora.id);
    if (!proyectos) { setLoading(false); return; }

    const proyectoIds = proyectos.map(p => p.id);
    const proyectoMap = Object.fromEntries(proyectos.map(p => [p.id, p.nombre]));

    // Traer unidades
    const { data: unidades } = await supabase.from('unidades').select('id, numero, proyecto_id, cliente_nombre').in('proyecto_id', proyectoIds);
    const unidadMap = Object.fromEntries((unidades || []).map(u => [u.id, u]));

    // Traer todos los planes y cuotas
    const { data: planes } = await supabase.from('planes_pago').select('id, unidad_id, precio_total');
    const { data: cuotas } = await supabase.from('cuotas').select('*');

    if (!planes || !cuotas) { setLoading(false); return; }

    // Calcular por proyecto
    const resumenMap: Record<string, ResumenProyecto> = {};
    proyectos.forEach(p => {
      resumenMap[p.id] = {
        proyecto_id: p.id, proyecto_nombre: p.nombre,
        total_cobrado: 0, total_pendiente: 0, total_vencido: 0, total_plan: 0,
        cuotas_cobradas: 0, cuotas_pendientes: 0, cuotas_vencidas: 0,
      };
    });

    const vencidas: CuotaDetalle[] = [];
    const proximas: CuotaDetalle[] = [];

    for (const cuota of cuotas) {
      const plan = planes.find(p => p.id === cuota.plan_id);
      if (!plan) continue;
      const unidad = unidadMap[plan.unidad_id];
      if (!unidad) continue;
      const proyectoId = unidad.proyecto_id;
      if (!resumenMap[proyectoId]) continue;

      const r = resumenMap[proyectoId];
      r.total_plan += cuota.monto;

      if (cuota.estado === 'pagado') {
        r.total_cobrado += cuota.monto;
        r.cuotas_cobradas++;
      } else if (cuota.fecha_vencimiento < hoy) {
        r.total_vencido += cuota.monto;
        r.cuotas_vencidas++;
        const dias = Math.floor((Date.now() - new Date(cuota.fecha_vencimiento).getTime()) / 86400000);
        vencidas.push({
          id: cuota.id, unidad_numero: unidad.numero,
          cliente_nombre: unidad.cliente_nombre,
          descripcion: cuota.descripcion, monto: cuota.monto,
          fecha_vencimiento: cuota.fecha_vencimiento, fecha_pago: null,
          estado: 'vencida', dias_vencida: dias,
          proyecto_nombre: proyectoMap[proyectoId] || '—',
        });
      } else {
        r.total_pendiente += cuota.monto;
        r.cuotas_pendientes++;
        if (cuota.fecha_vencimiento <= en30) {
          proximas.push({
            id: cuota.id, unidad_numero: unidad.numero,
            cliente_nombre: unidad.cliente_nombre,
            descripcion: cuota.descripcion, monto: cuota.monto,
            fecha_vencimiento: cuota.fecha_vencimiento, fecha_pago: null,
            estado: 'pendiente', dias_vencida: 0,
            proyecto_nombre: proyectoMap[proyectoId] || '—',
          });
        }
      }
    }

    setResumenes(Object.values(resumenMap).filter(r => r.total_plan > 0));
    setCuotasVencidas(vencidas.sort((a, b) => b.dias_vencida - a.dias_vencida));
    setCuotasProximas(proximas.sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)));
    setLoading(false);
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const marcarPagado = async (cuotaId: string) => {
    await supabase.from('cuotas').update({ estado: 'pagado', fecha_pago: new Date().toISOString().split('T')[0] }).eq('id', cuotaId);
    cargarDatos();
  };

  const totalCobrado = resumenes.reduce((s, r) => s + r.total_cobrado, 0);
  const totalVencido = resumenes.reduce((s, r) => s + r.total_vencido, 0);
  const totalPendiente = resumenes.reduce((s, r) => s + r.total_pendiente, 0);
  const totalPlan = resumenes.reduce((s, r) => s + r.total_plan, 0);
  const pctCobrado = totalPlan > 0 ? Math.round((totalCobrado / totalPlan) * 100) : 0;

  if (loading) return <div className="p-8 text-center py-32 text-white font-mono text-sm animate-pulse">Cargando finanzas...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen text-zinc-100">

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Finanzas</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Reporte de Finanzas</h1>
        <p className="text-sm text-white mt-1">Estado de todos los planes de pago activos.</p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#18181b] border border-emerald-500/20 rounded-xl p-5">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-2">Total cobrado</p>
          <p className="text-2xl font-bold font-mono text-emerald-400">${totalCobrado.toLocaleString()}</p>
          <p className="text-white text-xs mt-1">{pctCobrado}% del plan total</p>
        </div>
        <div className="bg-[#18181b] border border-red-500/20 rounded-xl p-5">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-2">Cartera vencida</p>
          <p className="text-2xl font-bold font-mono text-red-400">${totalVencido.toLocaleString()}</p>
          <p className="text-white text-xs mt-1">{cuotasVencidas.length} cuotas</p>
        </div>
        <div className="bg-[#18181b] border border-amber-400/20 rounded-xl p-5">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-2">Por cobrar</p>
          <p className="text-2xl font-bold font-mono text-amber-400">${totalPendiente.toLocaleString()}</p>
          <p className="text-white text-xs mt-1">{cuotasProximas.length} en 30 días</p>
        </div>
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-2">Plan total</p>
          <p className="text-2xl font-bold font-mono text-white">${totalPlan.toLocaleString()}</p>
          <p className="text-white text-xs mt-1">en todos los proyectos</p>
        </div>
      </div>

      {/* Barra global */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono">Progreso financiero global</p>
          <p className="text-[#d4ff3b] font-mono font-bold text-sm">{pctCobrado}% cobrado</p>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 flex overflow-hidden">
          <div className="bg-emerald-500 h-3 transition-all" style={{ width: `${pctCobrado}%` }} />
          <div className="bg-red-500 h-3 transition-all" style={{ width: `${totalPlan > 0 ? Math.round(totalVencido / totalPlan * 100) : 0}%` }} />
        </div>
        <div className="flex gap-4 mt-3">
          {[['bg-emerald-500', 'Cobrado'], ['bg-red-500', 'Vencido'], ['bg-zinc-600', 'Pendiente']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${c}`} />
              <span className="text-[10px] text-zinc-500">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'resumen', label: `Por proyecto (${resumenes.length})` },
          { key: 'vencidas', label: `Vencidas (${cuotasVencidas.length})` },
          { key: 'proximas', label: `Próximas 30 días (${cuotasProximas.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`text-xs px-4 py-2 rounded-lg font-mono uppercase tracking-wider transition border ${tab === t.key ? 'bg-[#d4ff3b] text-black border-[#d4ff3b]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab resumen por proyecto */}
      {tab === 'resumen' && (
        <div className="space-y-4">
          {resumenes.length === 0 ? (
            <div className="text-center py-20 bg-[#18181b] border border-zinc-800 rounded-2xl">
              <p className="text-zinc-600">Sin planes de pago registrados</p>
            </div>
          ) : resumenes.map(r => {
            const pct = r.total_plan > 0 ? Math.round(r.total_cobrado / r.total_plan * 100) : 0;
            return (
              <div key={r.proyecto_id} className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold text-lg">{r.proyecto_nombre}</h3>
                  <span className="text-[#d4ff3b] font-mono font-bold">{pct}% cobrado</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-white uppercase tracking-wider mb-1">Cobrado</p>
                    <p className="text-emerald-400 font-mono font-bold">${r.total_cobrado.toLocaleString()}</p>
                    <p className="text-white text-[10px]">{r.cuotas_cobradas} cuotas</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white uppercase tracking-wider mb-1">Vencido</p>
                    <p className={`font-mono font-bold ${r.total_vencido > 0 ? 'text-red-400' : 'text-zinc-600'}`}>${r.total_vencido.toLocaleString()}</p>
                    <p className="text-white text-[10px]">{r.cuotas_vencidas} cuotas</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white uppercase tracking-wider mb-1">Pendiente</p>
                    <p className="text-amber-400 font-mono font-bold">${r.total_pendiente.toLocaleString()}</p>
                    <p className="text-white text-[10px]">{r.cuotas_pendientes} cuotas</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white uppercase tracking-wider mb-1">Total plan</p>
                    <p className="text-white font-mono font-bold">${r.total_plan.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-[#d4ff3b] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab vencidas */}
      {tab === 'vencidas' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
          {cuotasVencidas.length === 0 ? (
            <p className="text-white text-sm p-8 text-center">Sin cuotas vencidas ✓</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {cuotasVencidas.map(c => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4 border-l-2 border-red-500">
                  <div>
                    <p className="text-white font-semibold text-sm">Unidad {c.unidad_numero} — {c.proyecto_nombre}</p>
                    {c.cliente_nombre && <p className="text-white text-xs">{c.cliente_nombre}</p>}
                    <p className="text-white text-xs">{c.descripcion}</p>
                    <p className="text-red-400 text-xs mt-0.5">{c.dias_vencida} días vencida · {new Date(c.fecha_vencimiento).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-mono font-bold">${c.monto.toLocaleString()}</span>
                    <button onClick={() => marcarPagado(c.id)}
                      className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] px-3 py-1.5 rounded-lg transition font-semibold">
                      Marcar pagado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab próximas */}
      {tab === 'proximas' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
          {cuotasProximas.length === 0 ? (
            <p className="text-white text-sm p-8 text-center">Sin cuotas próximas en los próximos 30 días</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {cuotasProximas.map(c => {
                const diasRestantes = Math.floor((new Date(c.fecha_vencimiento).getTime() - Date.now()) / 86400000);
                return (
                  <div key={c.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-white font-semibold text-sm">Unidad {c.unidad_numero} — {c.proyecto_nombre}</p>
                      {c.cliente_nombre && <p className="text-white text-xs">{c.cliente_nombre}</p>}
                      <p className="text-white text-xs">{c.descripcion}</p>
                      <p className="text-amber-400 text-xs mt-0.5">Vence en {diasRestantes} días · {new Date(c.fecha_vencimiento).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono font-bold">${c.monto.toLocaleString()}</span>
                      <button onClick={() => marcarPagado(c.id)}
                        className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] px-3 py-1.5 rounded-lg transition font-semibold">
                        Marcar pagado
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
