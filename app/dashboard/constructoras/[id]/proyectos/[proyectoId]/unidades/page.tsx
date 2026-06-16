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

interface Historial {
  id: string;
  estado_anterior: string;
  estado_nuevo: string;
  actor: string | null;
  nota: string | null;
  created_at: string;
}

interface Proyecto {
  id: string;
  nombre: string;
  unidades_total: number | null;
}

const ESTADO_COLORES: Record<string, string> = {
  libre: 'bg-emerald-500 hover:bg-emerald-400',
  reservado: 'bg-amber-400 hover:bg-amber-300',
  vendido: 'bg-red-500 hover:bg-red-400',
};

const ESTADO_TEXTO: Record<string, string> = {
  libre: 'Libre',
  reservado: 'Reservado',
  vendido: 'Vendido',
};

const formVacio = {
  numero: '', piso: '', tipo: 'apartamento', estado: 'libre',
  precio: '', area_m2: '', habitaciones: '', banos: '',
  estacionamientos: '1', vista: '', reservado_por: '', cliente_nombre: '', notas: '',
};

function tiempoRestante(reservadoHasta: string | null): string | null {
  if (!reservadoHasta) return null;
  const diff = new Date(reservadoHasta).getTime() - Date.now();
  if (diff <= 0) return 'Expirada';
  const horas = Math.floor(diff / 1000 / 60 / 60);
  const minutos = Math.floor((diff / 1000 / 60) % 60);
  return `${horas}h ${minutos}m restantes`;
}

export default function UnidadesPage() {
  const params = useParams();
  const router = useRouter();
  const constructoraId = params?.id as string;
  const proyectoId = params?.proyectoId as string;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<Unidad | null>(null);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [formData, setFormData] = useState(formVacio);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const { data: p } = await supabase.from('proyectos').select('id, nombre, unidades_total').eq('id', proyectoId).single();
    if (p) setProyecto(p);
    const { data: u } = await supabase.from('unidades').select('*').eq('proyecto_id', proyectoId).order('piso', { ascending: true });
    if (u) setUnidades(u);
    setLoading(false);
  }, [proyectoId]);

  useEffect(() => {
    if (proyectoId) cargarDatos();
  }, [proyectoId, cargarDatos]);

  const cargarHistorial = async (unidadId: string) => {
    const { data } = await supabase
      .from('unidad_historial')
      .select('*')
      .eq('unidad_id', unidadId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setHistorial(data);
  };

  const seleccionarUnidad = (u: Unidad) => {
    if (unidadSeleccionada?.id === u.id) {
      setUnidadSeleccionada(null);
      setHistorial([]);
    } else {
      setUnidadSeleccionada(u);
      cargarHistorial(u.id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    const datosAEnviar = {
      proyecto_id: proyectoId,
      numero: formData.numero,
      piso: formData.piso ? Number(formData.piso) : null,
      tipo: formData.tipo,
      estado: formData.estado,
      precio: formData.precio ? Number(formData.precio) : null,
      area_m2: formData.area_m2 ? Number(formData.area_m2) : null,
      habitaciones: formData.habitaciones ? Number(formData.habitaciones) : null,
      banos: formData.banos ? Number(formData.banos) : null,
      estacionamientos: formData.estacionamientos ? Number(formData.estacionamientos) : 1,
      vista: formData.vista || null,
      reservado_por: formData.reservado_por || null,
      cliente_nombre: formData.cliente_nombre || null,
      notas: formData.notas || null,
    };

    let error;
    if (editandoId) {
      const unidadAnterior = unidades.find(u => u.id === editandoId);
      ({ error } = await supabase.from('unidades').update(datosAEnviar).eq('id', editandoId));
      if (!error && unidadAnterior && unidadAnterior.estado !== formData.estado) {
        await supabase.from('unidad_historial').insert([{
          unidad_id: editandoId,
          estado_anterior: unidadAnterior.estado,
          estado_nuevo: formData.estado,
          actor: formData.reservado_por || 'Constructora',
          nota: 'Actualización manual',
        }]);
      }
    } else {
      ({ error } = await supabase.from('unidades').insert([datosAEnviar]));
    }

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Unidad actualizada.' : 'Unidad registrada.' });
      setEditandoId(null);
      setMostrarFormulario(false);
      setFormData(formVacio);
      cargarDatos();
    }
  };

  const iniciarEdicion = (u: Unidad) => {
    setEditandoId(u.id);
    setFormData({
      numero: u.numero, piso: u.piso?.toString() || '', tipo: u.tipo || 'apartamento',
      estado: u.estado, precio: u.precio?.toString() || '', area_m2: u.area_m2?.toString() || '',
      habitaciones: u.habitaciones?.toString() || '', banos: u.banos?.toString() || '',
      estacionamientos: u.estacionamientos?.toString() || '1', vista: u.vista || '',
      reservado_por: u.reservado_por || '', cliente_nombre: u.cliente_nombre || '', notas: u.notas || '',
    });
    setMostrarFormulario(true);
    setUnidadSeleccionada(null);
    setHistorial([]);
  };

  const cambiarEstadoRapido = async (id: string, nuevoEstado: string) => {
    const unidadAnterior = unidades.find(u => u.id === id);
    const extras: Record<string, string | null> = {};
    if (nuevoEstado === 'reservado') {
      const hasta = new Date();
      hasta.setHours(hasta.getHours() + 48);
      extras.reservado_hasta = hasta.toISOString();
      extras.fecha_reserva = new Date().toISOString();
    }
    if (nuevoEstado === 'libre') {
      extras.reservado_por = null;
      extras.reservado_hasta = null;
      extras.fecha_reserva = null;
    }
    await supabase.from('unidades').update({ estado: nuevoEstado, ...extras }).eq('id', id);
    if (unidadAnterior) {
      await supabase.from('unidad_historial').insert([{
        unidad_id: id,
        estado_anterior: unidadAnterior.estado,
        estado_nuevo: nuevoEstado,
        actor: unidadAnterior.reservado_por || 'Constructora',
        nota: null,
      }]);
    }
    cargarDatos();
    setUnidadSeleccionada(null);
    setHistorial([]);
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta unidad?')) return;
    await supabase.from('unidades').delete().eq('id', id);
    cargarDatos();
    setUnidadSeleccionada(null);
  };

  const unidadesFiltradas = filtroEstado === 'todos' ? unidades : unidades.filter(u => u.estado === filtroEstado);
  const conteo = {
    libre: unidades.filter(u => u.estado === 'libre').length,
    reservado: unidades.filter(u => u.estado === 'reservado').length,
    vendido: unidades.filter(u => u.estado === 'vendido').length,
  };
  const pisos = [...new Set(unidades.map(u => u.piso))].sort((a, b) => (b || 0) - (a || 0));

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos`)} className="text-xs text-zinc-500 hover:text-[#d4ff3b] font-mono mb-2 block transition">
            ← Volver a Proyectos
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white">{proyecto?.nombre || 'Cargando...'}</h1>
          <p className="text-sm text-zinc-300 mt-1">Mapa de disponibilidad de unidades.</p>
        </div>
        <button onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditandoId(null); setFormData(formVacio); }}
          className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black text-xs font-bold px-4 py-2 rounded-lg transition">
          {mostrarFormulario ? 'Cerrar' : '+ Agregar Unidad'}
        </button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#18181b] border border-emerald-500/20 rounded-xl p-4 text-center">
          <span className="block text-2xl font-mono font-bold text-emerald-400">{conteo.libre}</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Disponibles</span>
        </div>
        <div className="bg-[#18181b] border border-amber-400/20 rounded-xl p-4 text-center">
          <span className="block text-2xl font-mono font-bold text-amber-400">{conteo.reservado}</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Reservadas</span>
        </div>
        <div className="bg-[#18181b] border border-red-500/20 rounded-xl p-4 text-center">
          <span className="block text-2xl font-mono font-bold text-red-400">{conteo.vendido}</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Vendidas</span>
        </div>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-2xl mb-8">
          <h2 className="text-sm font-semibold mb-5 text-zinc-300 uppercase tracking-wider">
            {editandoId ? '⚡ Editar Unidad' : '＋ Registrar Unidad'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Número *</label>
                <input type="text" name="numero" value={formData.numero} onChange={handleChange} required placeholder="4A" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Piso</label>
                <input type="number" name="piso" value={formData.piso} onChange={handleChange} placeholder="4" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Tipo</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition">
                  <option value="apartamento">Apartamento</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="local">Local Comercial</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition">
                  <option value="libre">Libre</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Precio USD</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="250000" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Área M²</label>
                <input type="number" name="area_m2" value={formData.area_m2} onChange={handleChange} placeholder="120" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Habitaciones</label>
                <input type="number" name="habitaciones" value={formData.habitaciones} onChange={handleChange} placeholder="3" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Baños</label>
                <input type="number" name="banos" value={formData.banos} onChange={handleChange} placeholder="2" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Vista</label>
                <input type="text" name="vista" value={formData.vista} onChange={handleChange} placeholder="Mar, Ciudad, Jardín..." className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Reservado por</label>
                <input type="text" name="reservado_por" value={formData.reservado_por} onChange={handleChange} placeholder="Nombre del broker" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Cliente</label>
                <input type="text" name="cliente_nombre" value={formData.cliente_nombre} onChange={handleChange} placeholder="Nombre del comprador" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>

            {mensaje && (
              <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setMostrarFormulario(false); setEditandoId(null); setFormData(formVacio); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition">Cancelar</button>
              <button type="submit" className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2 rounded-lg text-sm font-semibold transition">
                {editandoId ? 'Actualizar' : 'Registrar Unidad'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {['todos', 'libre', 'reservado', 'vendido'].map(f => (
          <button key={f} onClick={() => setFiltroEstado(f)} className={`text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider transition border ${filtroEstado === f ? 'bg-[#d4ff3b] text-black border-[#d4ff3b]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
            {f === 'todos' ? 'Todas' : ESTADO_TEXTO[f]}
          </button>
        ))}
      </div>

      {/* Mapa de unidades */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm animate-pulse">Cargando unidades...</div>
      ) : unidades.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 font-mono text-sm">No hay unidades registradas. Agrega la primera unidad.</div>
      ) : (
        <div className="space-y-3">
          {pisos.map(piso => {
            const unidadesPiso = unidadesFiltradas.filter(u => u.piso === piso);
            if (unidadesPiso.length === 0) return null;
            return (
              <div key={piso} className="bg-[#18181b] border border-zinc-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-3 block">Piso {piso}</span>
                <div className="flex flex-wrap gap-2">
                  {unidadesPiso.map(u => (
                    <button key={u.id} onClick={() => seleccionarUnidad(u)}
                      className={`${ESTADO_COLORES[u.estado]} ${unidadSeleccionada?.id === u.id ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''} text-white text-xs font-bold px-3 py-2 rounded-lg transition min-w-[60px] text-center shadow-lg`}>
                      {u.numero}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel flotante con historial */}
      {unidadSeleccionada && (
        <div className="fixed bottom-6 right-6 bg-[#18181b] border border-zinc-700 rounded-2xl shadow-2xl p-6 w-84 z-50 max-h-[90vh] overflow-y-auto" style={{width: '340px'}}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Unidad</span>
              <h3 className="text-xl font-bold text-white">{unidadSeleccionada.numero}</h3>
            </div>
            <button onClick={() => { setUnidadSeleccionada(null); setHistorial([]); }} className="text-zinc-500 hover:text-white transition text-lg">✕</button>
          </div>

          <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-4 ${
            unidadSeleccionada.estado === 'libre' ? 'bg-emerald-500/20 text-emerald-400' :
            unidadSeleccionada.estado === 'reservado' ? 'bg-amber-400/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {ESTADO_TEXTO[unidadSeleccionada.estado]}
          </div>

          {/* Countdown reserva */}
          {unidadSeleccionada.estado === 'reservado' && unidadSeleccionada.reservado_hasta && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mb-4">
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">⏱ Reserva temporal</p>
              <p className="text-amber-300 font-bold text-sm">{tiempoRestante(unidadSeleccionada.reservado_hasta)}</p>
              {unidadSeleccionada.fecha_reserva && (
                <p className="text-amber-400/60 text-[10px] mt-0.5">
                  Desde {new Date(unidadSeleccionada.fecha_reserva).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1 text-xs text-zinc-400 mb-4">
            {unidadSeleccionada.precio && <p>💰 ${Number(unidadSeleccionada.precio).toLocaleString()}</p>}
            {unidadSeleccionada.area_m2 && <p>📐 {unidadSeleccionada.area_m2} m²</p>}
            {unidadSeleccionada.habitaciones && <p>🛏 {unidadSeleccionada.habitaciones} hab · {unidadSeleccionada.banos} baños</p>}
            {unidadSeleccionada.vista && <p>🌅 Vista: {unidadSeleccionada.vista}</p>}
            {unidadSeleccionada.reservado_por && <p>👤 Broker: {unidadSeleccionada.reservado_por}</p>}
            {unidadSeleccionada.cliente_nombre && <p>🏠 Cliente: {unidadSeleccionada.cliente_nombre}</p>}
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex gap-2">
              {unidadSeleccionada.estado !== 'libre' && (
                <button onClick={() => cambiarEstadoRapido(unidadSeleccionada.id, 'libre')} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs py-1.5 rounded-lg transition font-semibold">
                  Marcar Libre
                </button>
              )}
              {unidadSeleccionada.estado !== 'reservado' && (
                <button onClick={() => cambiarEstadoRapido(unidadSeleccionada.id, 'reservado')} className="flex-1 bg-amber-400/20 hover:bg-amber-400 text-amber-400 hover:text-black text-xs py-1.5 rounded-lg transition font-semibold">
                  Reservar
                </button>
              )}
              {unidadSeleccionada.estado !== 'vendido' && (
                <button onClick={() => cambiarEstadoRapido(unidadSeleccionada.id, 'vendido')} className="flex-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs py-1.5 rounded-lg transition font-semibold">
                  Vendido
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => iniciarEdicion(unidadSeleccionada)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-1.5 rounded-lg transition">Editar</button>
              <button onClick={() => eliminar(unidadSeleccionada.id)} className="bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg transition border border-zinc-800">Borrar</button>
            </div>
            <button
              onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades/${unidadSeleccionada.id}`)}
              className="w-full bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs py-2 rounded-lg transition border border-[#d4ff3b]/20 font-semibold">
              📋 Ficha completa →
            </button>
            <button
              onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades/${unidadSeleccionada.id}/incidencias`)}
              className="w-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg transition border border-zinc-700 font-semibold">
              🔧 Incidencias →
            </button>
          </div>

          {/* Historial */}
          {historial.length > 0 && (
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-3">Historial de movimientos</p>
              <div className="space-y-2">
                {historial.map(h => (
                  <div key={h.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-300">
                        <span className="text-zinc-500">{ESTADO_TEXTO[h.estado_anterior] || h.estado_anterior}</span>
                        {' → '}
                        <span className={
                          h.estado_nuevo === 'libre' ? 'text-emerald-400' :
                          h.estado_nuevo === 'reservado' ? 'text-amber-400' : 'text-red-400'
                        }>{ESTADO_TEXTO[h.estado_nuevo] || h.estado_nuevo}</span>
                      </p>
                      {h.actor && <p className="text-[10px] text-zinc-600">{h.actor}</p>}
                      <p className="text-[10px] text-zinc-700">
                        {new Date(h.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
