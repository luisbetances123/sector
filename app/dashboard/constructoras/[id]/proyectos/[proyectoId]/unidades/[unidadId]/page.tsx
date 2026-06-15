"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface Unidad {
  id: string;
  numero: string;
  precio: number | null;
  cliente_nombre: string | null;
  estado: string;
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
  nota: string | null;
}

const ESTADO_CUOTA: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-zinc-400', bg: 'bg-zinc-800/50 border-zinc-700' },
  pagado: { label: 'Pagado', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  vencido: { label: 'Vencido', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function PlanPagoPage() {
  const params = useParams();
  const router = useRouter();
  const constructoraId = params?.id as string;
  const proyectoId = params?.proyectoId as string;
  const unidadId = params?.unidadId as string;

  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  // Generador de plan
  const [genData, setGenData] = useState({
    precio_total: '',
    inicial_pct: '20',
    cuotas_construccion: '18',
    entrega_pct: '10',
    fecha_inicio: new Date().toISOString().split('T')[0],
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const { data: u } = await supabase.from('unidades').select('id, numero, precio, cliente_nombre, estado').eq('id', unidadId).single();
    if (u) {
      setUnidad(u);
      setGenData(prev => ({ ...prev, precio_total: u.precio?.toString() || '' }));
    }

    const { data: p } = await supabase.from('planes_pago').select('*').eq('unidad_id', unidadId).maybeSingle();
    if (p) {
      setPlan(p);
      const { data: c } = await supabase.from('cuotas').select('*').eq('plan_id', p.id).order('numero');
      if (c) setCuotas(c);
    }
    setLoading(false);
  }, [unidadId]);

  useEffect(() => {
    if (unidadId) cargarDatos();
  }, [unidadId, cargarDatos]);

  const generarPlan = async () => {
    setMensaje(null);
    const precio = Number(genData.precio_total);
    if (!precio) return;

    const inicialPct = Number(genData.inicial_pct) / 100;
    const entregaPct = Number(genData.entrega_pct) / 100;
    const construccionPct = 1 - inicialPct - entregaPct;
    const nCuotas = Number(genData.cuotas_construccion);
    const fechaInicio = new Date(genData.fecha_inicio);

    // Crear plan
    const { data: nuevoPlan, error: errorPlan } = await supabase
      .from('planes_pago')
      .insert([{ unidad_id: unidadId, cliente_nombre: unidad?.cliente_nombre, precio_total: precio, moneda: 'USD' }])
      .select().single();

    if (errorPlan || !nuevoPlan) {
      setMensaje({ tipo: 'error', texto: 'Error al crear plan: ' + errorPlan?.message });
      return;
    }

    const cuotasAInsertar = [];

    // Cuota inicial
    cuotasAInsertar.push({
      plan_id: nuevoPlan.id,
      numero: 1,
      descripcion: 'Cuota inicial',
      monto: Math.round(precio * inicialPct),
      fecha_vencimiento: fechaInicio.toISOString().split('T')[0],
      estado: 'pendiente',
    });

    // Cuotas de construcción
    const montoConstruccion = Math.round((precio * construccionPct) / nCuotas);
    for (let i = 0; i < nCuotas; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setMonth(fecha.getMonth() + i + 1);
      cuotasAInsertar.push({
        plan_id: nuevoPlan.id,
        numero: i + 2,
        descripcion: `Cuota de construcción ${i + 1}/${nCuotas}`,
        monto: montoConstruccion,
        fecha_vencimiento: fecha.toISOString().split('T')[0],
        estado: 'pendiente',
      });
    }

    // Cuota entrega
    const fechaEntrega = new Date(fechaInicio);
    fechaEntrega.setMonth(fechaEntrega.getMonth() + nCuotas + 1);
    cuotasAInsertar.push({
      plan_id: nuevoPlan.id,
      numero: nCuotas + 2,
      descripcion: 'Cuota a la entrega',
      monto: Math.round(precio * entregaPct),
      fecha_vencimiento: fechaEntrega.toISOString().split('T')[0],
      estado: 'pendiente',
    });

    const { error: errorCuotas } = await supabase.from('cuotas').insert(cuotasAInsertar);
    if (errorCuotas) {
      setMensaje({ tipo: 'error', texto: 'Error al crear cuotas: ' + errorCuotas.message });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Plan de pago generado exitosamente.' });
      setMostrarGenerador(false);
      cargarDatos();
    }
  };

  const marcarPagado = async (cuotaId: string) => {
    await supabase.from('cuotas').update({
      estado: 'pagado',
      fecha_pago: new Date().toISOString().split('T')[0],
    }).eq('id', cuotaId);
    cargarDatos();
  };

  const marcarPendiente = async (cuotaId: string) => {
    await supabase.from('cuotas').update({ estado: 'pendiente', fecha_pago: null }).eq('id', cuotaId);
    cargarDatos();
  };

  const eliminarPlan = async () => {
    if (!confirm('¿Eliminar el plan de pago? Esto borrará todas las cuotas.')) return;
    if (plan) await supabase.from('planes_pago').delete().eq('id', plan.id);
    setPlan(null);
    setCuotas([]);
    cargarDatos();
  };

  const totalPagado = cuotas.filter(c => c.estado === 'pagado').reduce((sum, c) => sum + c.monto, 0);
  const totalPendiente = cuotas.filter(c => c.estado !== 'pagado').reduce((sum, c) => sum + c.monto, 0);
  const progreso = plan ? Math.round((totalPagado / plan.precio_total) * 100) : 0;

  if (loading) return (
    <div className="p-8 max-w-4xl mx-auto text-center py-32 text-zinc-500 font-mono text-sm animate-pulse">Cargando plan de pago...</div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades`)}
            className="text-xs text-zinc-500 hover:text-[#d4ff3b] font-mono mb-2 block transition">
            ← Volver a Unidades
          </button>
          <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Unidad {unidad?.numero}</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Plan de Pago</h1>
          {unidad?.cliente_nombre && <p className="text-sm text-zinc-400 mt-1">Cliente: {unidad.cliente_nombre}</p>}
        </div>
        {!plan && (
          <button onClick={() => setMostrarGenerador(!mostrarGenerador)}
            className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black text-xs font-bold px-4 py-2 rounded-lg transition">
            {mostrarGenerador ? 'Cancelar' : '+ Generar Plan'}
          </button>
        )}
        {plan && (
          <button onClick={eliminarPlan} className="bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 text-xs px-4 py-2 rounded-lg transition border border-zinc-800">
            Eliminar plan
          </button>
        )}
      </div>

      {/* Generador de plan */}
      {mostrarGenerador && !plan && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-6">Configurar Plan de Pago</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Precio Total (USD)</label>
                <input type="number" value={genData.precio_total} onChange={e => setGenData({ ...genData, precio_total: e.target.value })}
                  placeholder="285000" className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Fecha de inicio</label>
                <input type="date" value={genData.fecha_inicio} onChange={e => setGenData({ ...genData, fecha_inicio: e.target.value })}
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Inicial %</label>
                <input type="number" value={genData.inicial_pct} onChange={e => setGenData({ ...genData, inicial_pct: e.target.value })}
                  min="0" max="100" className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Cuotas construcción</label>
                <input type="number" value={genData.cuotas_construccion} onChange={e => setGenData({ ...genData, cuotas_construccion: e.target.value })}
                  min="1" max="60" className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">A la entrega %</label>
                <input type="number" value={genData.entrega_pct} onChange={e => setGenData({ ...genData, entrega_pct: e.target.value })}
                  min="0" max="100" className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>

            {/* Preview */}
            {genData.precio_total && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-3">Vista previa del plan</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Inicial', value: `$${Math.round(Number(genData.precio_total) * Number(genData.inicial_pct) / 100).toLocaleString()}` },
                    { label: `${genData.cuotas_construccion} cuotas de`, value: `$${Math.round(Number(genData.precio_total) * (1 - Number(genData.inicial_pct)/100 - Number(genData.entrega_pct)/100) / Number(genData.cuotas_construccion)).toLocaleString()}` },
                    { label: 'A la entrega', value: `$${Math.round(Number(genData.precio_total) * Number(genData.entrega_pct) / 100).toLocaleString()}` },
                  ].map(item => (
                    <div key={item.label} className="bg-[#09090b] border border-zinc-800 rounded-lg p-3">
                      <p className="text-[#d4ff3b] font-mono font-bold text-sm">{item.value}</p>
                      <p className="text-zinc-500 text-[10px] mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mensaje && (
              <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={generarPlan} disabled={!genData.precio_total}
                className="bg-[#d4ff3b] hover:bg-[#c2eb30] disabled:opacity-40 text-black px-8 py-3 rounded-lg font-bold transition">
                Generar plan de pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan existente */}
      {plan && (
        <>
          {/* Resumen */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-emerald-400 font-mono font-bold text-xl">${totalPagado.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Cobrado</p>
              </div>
              <div className="text-center">
                <p className="text-amber-400 font-mono font-bold text-xl">${totalPendiente.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Pendiente</p>
              </div>
              <div className="text-center">
                <p className="text-white font-mono font-bold text-xl">${plan.precio_total.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total</p>
              </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-[#d4ff3b] h-2 rounded-full transition-all" style={{ width: `${progreso}%` }} />
            </div>
            <p className="text-right text-[10px] text-zinc-500 font-mono mt-1">{progreso}% cobrado</p>
          </div>

          {/* Tabla de cuotas */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Tabla de cuotas</p>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {cuotas.map(c => {
                const est = ESTADO_CUOTA[c.estado] || ESTADO_CUOTA.pendiente;
                const vencida = c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date();
                return (
                  <div key={c.id} className={`flex items-center justify-between px-5 py-4 hover:bg-zinc-900/40 transition ${vencida ? 'border-l-2 border-red-500' : ''}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-600 font-mono text-xs w-6">{c.numero}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{c.descripcion}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          Vence: {new Date(c.fecha_vencimiento).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {c.fecha_pago && ` · Pagado: ${new Date(c.fecha_pago).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' })}`}
                          {vencida && <span className="text-red-400 ml-2">· VENCIDA</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">${c.monto.toLocaleString()}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${est.bg} ${est.color}`}>
                        {est.label}
                      </span>
                      {c.estado !== 'pagado' ? (
                        <button onClick={() => marcarPagado(c.id)}
                          className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] px-3 py-1.5 rounded-lg transition font-semibold">
                          Marcar pagado
                        </button>
                      ) : (
                        <button onClick={() => marcarPendiente(c.id)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] px-3 py-1.5 rounded-lg transition">
                          Revertir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Estado vacío */}
      {!plan && !mostrarGenerador && (
        <div className="text-center py-32">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-zinc-400 font-medium mb-2">No hay plan de pago aún</p>
          <p className="text-zinc-600 text-sm mb-6">Genera un plan automático con cuotas mensuales</p>
          <button onClick={() => setMostrarGenerador(true)}
            className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-3 rounded-lg font-semibold transition">
            + Generar plan de pago
          </button>
        </div>
      )}
    </div>
  );
}
