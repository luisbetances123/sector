"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface Unidad {
  id: string;
  numero: string;
  piso: number | null;
  tipo: string | null;
  estado: string;
  precio: number | null;
  area_m2: number | null;
  habitaciones: number | null;
  banos: number | null;
  estacionamientos: number | null;
  vista: string | null;
  reservado_por: string | null;
  reservado_hasta: string | null;
  fecha_reserva: string | null;
  cliente_nombre: string | null;
  notas: string | null;
}

interface Plan {
  id: string;
  cliente_nombre: string | null;
  precio_total: number;
  moneda: string;
  created_at: string;
}

interface Cuota {
  id: string;
  numero: number;
  descripcion: string | null;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  estado: string;
}

interface Historial {
  id: string;
  estado_anterior: string;
  estado_nuevo: string;
  actor: string | null;
  nota: string | null;
  created_at: string;
}

interface Incidencia {
  id: string;
  titulo: string;
  estado: string;
  prioridad: string;
  created_at: string;
}

const ESTADO_COLORES: Record<string, string> = {
  libre: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  reservado: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  vendido: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ESTADO_TEXTO: Record<string, string> = {
  libre: 'Libre', reservado: 'Reservado', vendido: 'Vendido',
};

function tiempoRestante(hasta: string | null): string | null {
  if (!hasta) return null;
  const diff = new Date(hasta).getTime() - Date.now();
  if (diff <= 0) return 'Expirada';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function FichaUnidadPage() {
  const params = useParams();
  const router = useRouter();
  const constructoraId = params?.id as string;
  const proyectoId = params?.proyectoId as string;
  const unidadId = params?.unidadId as string;

  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'plan' | 'historial' | 'incidencias'>('plan');
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Plan generator
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [genData, setGenData] = useState({ precio_total: '', inicial_pct: '20', cuotas_construccion: '18', entrega_pct: '10', fecha_inicio: new Date().toISOString().split('T')[0] });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const { data: u } = await supabase.from('unidades').select('*').eq('id', unidadId).single();
    if (u) { setUnidad(u); setGenData(prev => ({ ...prev, precio_total: u.precio?.toString() || '' })); }

    const { data: p } = await supabase.from('planes_pago').select('*').eq('unidad_id', unidadId).maybeSingle();
    if (p) {
      setPlan(p);
      const { data: c } = await supabase.from('cuotas').select('*').eq('plan_id', p.id).order('numero');
      if (c) setCuotas(c);
    }

    const { data: h } = await supabase.from('unidad_historial').select('*').eq('unidad_id', unidadId).order('created_at', { ascending: false });
    if (h) setHistorial(h);

    const { data: i } = await supabase.from('incidencias').select('*').eq('unidad_id', unidadId).order('created_at', { ascending: false });
    if (i) setIncidencias(i);

    setLoading(false);
  }, [unidadId]);

  useEffect(() => { if (unidadId) cargarDatos(); }, [unidadId, cargarDatos]);

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!unidad) return;
    const extras: Record<string, string | null> = {};
    if (nuevoEstado === 'libre') { extras.reservado_por = null; extras.reservado_hasta = null; extras.fecha_reserva = null; }
    await supabase.from('unidades').update({ estado: nuevoEstado, ...extras }).eq('id', unidad.id);
    await supabase.from('unidad_historial').insert([{ unidad_id: unidad.id, estado_anterior: unidad.estado, estado_nuevo: nuevoEstado, actor: 'Constructora' }]);
    cargarDatos();
  };

  const marcarCuotaPagada = async (cuotaId: string) => {
    await supabase.from('cuotas').update({ estado: 'pagado', fecha_pago: new Date().toISOString().split('T')[0] }).eq('id', cuotaId);
    cargarDatos();
  };

  const marcarCuotaPendiente = async (cuotaId: string) => {
    await supabase.from('cuotas').update({ estado: 'pendiente', fecha_pago: null }).eq('id', cuotaId);
    cargarDatos();
  };

  const generarPlan = async () => {
    if (!unidad) return;
    setMensaje(null);
    const precio = Number(genData.precio_total);
    if (!precio) return;
    const inicialPct = Number(genData.inicial_pct) / 100;
    const entregaPct = Number(genData.entrega_pct) / 100;
    const nCuotas = Number(genData.cuotas_construccion);
    const fechaInicio = new Date(genData.fecha_inicio);

    const { data: nuevoPlan, error } = await supabase.from('planes_pago')
      .insert([{ unidad_id: unidadId, cliente_nombre: unidad.cliente_nombre, precio_total: precio, moneda: 'USD' }])
      .select().single();
    if (error || !nuevoPlan) { setMensaje({ tipo: 'error', texto: 'Error: ' + error?.message }); return; }

    const cuotasArr = [];
    cuotasArr.push({ plan_id: nuevoPlan.id, numero: 1, descripcion: 'Cuota inicial', monto: Math.round(precio * inicialPct), fecha_vencimiento: fechaInicio.toISOString().split('T')[0], estado: 'pendiente' });
    const montoCons = Math.round((precio * (1 - inicialPct - entregaPct)) / nCuotas);
    for (let i = 0; i < nCuotas; i++) {
      const f = new Date(fechaInicio); f.setMonth(f.getMonth() + i + 1);
      cuotasArr.push({ plan_id: nuevoPlan.id, numero: i + 2, descripcion: `Cuota de construcción ${i + 1}/${nCuotas}`, monto: montoCons, fecha_vencimiento: f.toISOString().split('T')[0], estado: 'pendiente' });
    }
    const fEntrega = new Date(fechaInicio); fEntrega.setMonth(fEntrega.getMonth() + nCuotas + 1);
    cuotasArr.push({ plan_id: nuevoPlan.id, numero: nCuotas + 2, descripcion: 'Cuota a la entrega', monto: Math.round(precio * entregaPct), fecha_vencimiento: fEntrega.toISOString().split('T')[0], estado: 'pendiente' });

    await supabase.from('cuotas').insert(cuotasArr);
    setMostrarGenerador(false);
    cargarDatos();
  };

  if (loading) return <div className="p-8 text-center py-32 text-white font-mono text-sm animate-pulse">Cargando ficha...</div>;
  if (!unidad) return <div className="p-8 text-center py-32 text-zinc-500">Unidad no encontrada</div>;

  const totalPagado = cuotas.filter(c => c.estado === 'pagado').reduce((s, c) => s + c.monto, 0);
  const totalPendiente = cuotas.filter(c => c.estado !== 'pagado').reduce((s, c) => s + c.monto, 0);
  const progreso = plan ? Math.round((totalPagado / plan.precio_total) * 100) : 0;
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen text-zinc-100">

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades`)}
          className="text-xs text-zinc-500 hover:text-[#d4ff3b] font-mono mb-3 block transition">
          ← Volver al mapa de unidades
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Ficha de Unidad</p>
            <h1 className="text-4xl font-black tracking-tight text-white">Unidad {unidad.numero}</h1>
            {unidad.tipo && <p className="text-white text-sm mt-1 capitalize">{unidad.tipo} · Piso {unidad.piso || '—'}</p>}
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${ESTADO_COLORES[unidad.estado]}`}>
            {ESTADO_TEXTO[unidad.estado]}
          </span>
        </div>
      </div>

      {/* Grid superior — datos + acciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Especificaciones */}
        <div className="md:col-span-2 bg-[#18181b] border border-zinc-800 rounded-2xl p-6">
          <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-4">Especificaciones</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Precio', value: unidad.precio ? `$${Number(unidad.precio).toLocaleString()}` : '—', highlight: true },
              { label: 'Área', value: unidad.area_m2 ? `${unidad.area_m2} m²` : '—' },
              { label: 'Habitaciones', value: unidad.habitaciones?.toString() || '—' },
              { label: 'Baños', value: unidad.banos?.toString() || '—' },
              { label: 'Estacionamientos', value: unidad.estacionamientos?.toString() || '—' },
              { label: 'Vista', value: unidad.vista || '—' },
              { label: 'Piso', value: unidad.piso?.toString() || '—' },
              { label: 'Tipo', value: unidad.tipo || '—' },
            ].map(spec => (
              <div key={spec.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-white uppercase tracking-wider mb-1">{spec.label}</p>
                <p className={`font-bold text-sm ${spec.highlight ? 'text-[#d4ff3b]' : 'text-white'}`}>{spec.value}</p>
              </div>
            ))}
          </div>
          {unidad.notas && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
              <p className="text-[10px] text-white uppercase tracking-wider mb-1">Notas</p>
              <p className="text-white text-sm">{unidad.notas}</p>
            </div>
          )}
        </div>

        {/* Panel derecho — cliente + acciones */}
        <div className="flex flex-col gap-4">
          {/* Cliente / Broker */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 flex-1">
            <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-4">Asignación</p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Cliente</p>
                <p className="text-white font-semibold text-sm">{unidad.cliente_nombre || <span className="text-zinc-600">Sin asignar</span>}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Broker</p>
                <p className="text-white font-semibold text-sm">{unidad.reservado_por || <span className="text-zinc-600">Sin asignar</span>}</p>
              </div>
              {unidad.estado === 'reservado' && unidad.reservado_hasta && (
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3">
                  <p className="text-[10px] text-amber-400 uppercase tracking-wider">⏱ Reserva temporal</p>
                  <p className="text-amber-300 font-bold text-sm mt-1">{tiempoRestante(unidad.reservado_hasta)}</p>
                  {unidad.fecha_reserva && (
                    <p className="text-amber-400/50 text-[10px] mt-0.5">
                      Desde {new Date(unidad.fecha_reserva).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5">
            <p className="text-[10px] text-white uppercase tracking-wider font-mono mb-3">Cambiar estado</p>
            <div className="flex flex-col gap-2">
              {unidad.estado !== 'libre' && (
                <button onClick={() => cambiarEstado('libre')} className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs py-2 rounded-lg transition font-semibold">
                  Marcar Libre
                </button>
              )}
              {unidad.estado !== 'reservado' && (
                <button onClick={() => cambiarEstado('reservado')} className="bg-amber-400/20 hover:bg-amber-400 text-amber-400 hover:text-black text-xs py-2 rounded-lg transition font-semibold">
                  Marcar Reservado
                </button>
              )}
              {unidad.estado !== 'vendido' && (
                <button onClick={() => cambiarEstado('vendido')} className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs py-2 rounded-lg transition font-semibold">
                  Marcar Vendido
                </button>
              )}
              <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades/${unidadId}/incidencias`)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2 rounded-lg transition">
                🔧 Ver incidencias ({incidencias.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen financiero */}
      {plan && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] text-white uppercase tracking-wider font-mono">Resumen financiero</p>
            <span className="text-[#d4ff3b] font-mono font-bold text-sm">{progreso}% cobrado</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-emerald-400 font-mono font-bold text-xl">${totalPagado.toLocaleString()}</p>
              <p className="text-[10px] text-white uppercase tracking-wider mt-1">Cobrado</p>
            </div>
            <div className="text-center">
              <p className="text-amber-400 font-mono font-bold text-xl">${totalPendiente.toLocaleString()}</p>
              <p className="text-[10px] text-white uppercase tracking-wider mt-1">Pendiente</p>
            </div>
            <div className="text-center">
              <p className="text-white font-mono font-bold text-xl">${plan.precio_total.toLocaleString()}</p>
              <p className="text-[10px] text-white uppercase tracking-wider mt-1">Total</p>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div className="bg-[#d4ff3b] h-2 rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'plan', label: `Plan de pago (${cuotas.length})` },
          { key: 'historial', label: `Historial (${historial.length})` },
          { key: 'incidencias', label: `Incidencias (${incidencias.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`text-xs px-4 py-2 rounded-lg font-mono uppercase tracking-wider transition border ${tab === t.key ? 'bg-[#d4ff3b] text-black border-[#d4ff3b]' : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Plan de pago */}
      {tab === 'plan' && (
        <>
          {!plan && !mostrarGenerador && (
            <div className="text-center py-20 bg-[#18181b] border border-zinc-800 rounded-2xl">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-white font-medium mb-4">Sin plan de pago</p>
              <button onClick={() => setMostrarGenerador(true)} className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2.5 rounded-lg font-semibold text-sm transition">
                + Generar plan
              </button>
            </div>
          )}

          {mostrarGenerador && !plan && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Configurar Plan de Pago</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white uppercase tracking-wider mb-1">Precio Total (USD)</label>
                    <input type="number" value={genData.precio_total} onChange={e => setGenData({ ...genData, precio_total: e.target.value })}
                      className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white uppercase tracking-wider mb-1">Fecha inicio</label>
                    <input type="date" value={genData.fecha_inicio} onChange={e => setGenData({ ...genData, fecha_inicio: e.target.value })}
                      className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-white uppercase tracking-wider mb-1">Inicial %</label>
                    <input type="number" value={genData.inicial_pct} onChange={e => setGenData({ ...genData, inicial_pct: e.target.value })}
                      className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white uppercase tracking-wider mb-1">Cuotas construcción</label>
                    <input type="number" value={genData.cuotas_construccion} onChange={e => setGenData({ ...genData, cuotas_construccion: e.target.value })}
                      className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white uppercase tracking-wider mb-1">Entrega %</label>
                    <input type="number" value={genData.entrega_pct} onChange={e => setGenData({ ...genData, entrega_pct: e.target.value })}
                      className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setMostrarGenerador(false)} className="bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm transition">Cancelar</button>
                  <button onClick={generarPlan} className="bg-[#d4ff3b] text-black px-6 py-2.5 rounded-lg text-sm font-bold transition">Generar plan</button>
                </div>
              </div>
            </div>
          )}

          {plan && cuotas.length > 0 && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-zinc-800/60">
                {cuotas.map(c => {
                  const vencida = c.estado === 'pendiente' && c.fecha_vencimiento < hoy;
                  return (
                    <div key={c.id} className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-900/40 transition ${vencida ? 'border-l-2 border-red-500' : ''}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-600 font-mono text-xs w-6">{c.numero}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{c.descripcion}</p>
                          <p className="text-white text-xs mt-0.5">
                            {new Date(c.fecha_vencimiento).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {vencida && <span className="text-red-400 ml-2">VENCIDA</span>}
                            {c.fecha_pago && <span className="text-emerald-400 ml-2">· Pagado {new Date(c.fecha_pago).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' })}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white">${c.monto.toLocaleString()}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${c.estado === 'pagado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : vencida ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-800 text-white border-zinc-700'}`}>
                          {c.estado === 'pagado' ? 'Pagado' : vencida ? 'Vencida' : 'Pendiente'}
                        </span>
                        {c.estado !== 'pagado' ? (
                          <button onClick={() => marcarCuotaPagada(c.id)} className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] px-3 py-1.5 rounded-lg transition font-semibold">
                            Marcar pagado
                          </button>
                        ) : (
                          <button onClick={() => marcarCuotaPendiente(c.id)} className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] px-3 py-1.5 rounded-lg transition">
                            Revertir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Historial */}
      {tab === 'historial' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
          {historial.length === 0 ? (
            <p className="text-white text-sm p-8 text-center">Sin movimientos registrados</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {historial.map(h => (
                <div key={h.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm">
                        <span className="text-zinc-500">{h.estado_anterior}</span>
                        {' → '}
                        <span className={h.estado_nuevo === 'libre' ? 'text-emerald-400' : h.estado_nuevo === 'reservado' ? 'text-amber-400' : 'text-red-400'}>
                          {h.estado_nuevo}
                        </span>
                      </p>
                      {h.actor && <p className="text-white text-xs mt-0.5">{h.actor}</p>}
                      {h.nota && <p className="text-white text-xs">{h.nota}</p>}
                    </div>
                  </div>
                  <p className="text-white text-xs font-mono">
                    {new Date(h.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Incidencias */}
      {tab === 'incidencias' && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
          {incidencias.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white text-sm mb-4">Sin incidencias registradas</p>
              <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades/${unidadId}/incidencias`)}
                className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-5 py-2 rounded-lg text-sm font-semibold transition">
                + Registrar incidencia
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {incidencias.map(i => (
                <div key={i.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-white text-sm font-medium">{i.titulo}</p>
                    <p className="text-white text-xs mt-0.5">
                      {new Date(i.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${i.prioridad === 'alta' ? 'bg-red-500/10 text-red-400 border-red-500/20' : i.prioridad === 'media' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                      {i.prioridad}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${i.estado === 'resuelta' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : i.estado === 'en_proceso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
                      {i.estado}
                    </span>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4">
                <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades/${unidadId}/incidencias`)}
                  className="text-[#d4ff3b] text-xs font-semibold hover:underline">
                  Ver todas las incidencias →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
