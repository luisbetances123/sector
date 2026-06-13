"use client";

import { useState, useEffect } from 'react';
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
  recamaras: number | null;
  banos: number | null;
  estacionamientos: number | null;
  vista: string | null;
  reservado_por: string | null;
  cliente_nombre: string | null;
  notas: string | null;
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

export default function UnidadesPage() {
  const params = useParams();
  const router = useRouter();
  const constructoraId = params?.id as string;
  const proyectoId = params?.proyectoId as string;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<Unidad | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const [formData, setFormData] = useState({
    numero: '',
    piso: '',
    tipo: 'apartamento',
    estado: 'libre',
    precio: '',
    area_m2: '',
    recamaras: '',
    banos: '',
    estacionamientos: '1',
    vista: '',
    reservado_por: '',
    cliente_nombre: '',
    notas: '',
  });

  useEffect(() => {
    if (proyectoId) cargarDatos();
  }, [proyectoId]);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: p } = await supabase
      .from('proyectos')
      .select('id, nombre, unidades_total')
      .eq('id', proyectoId)
      .single();
    if (p) setProyecto(p);

    const { data: u } = await supabase
      .from('unidades')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('piso', { ascending: true });
    if (u) setUnidades(u);
    setLoading(false);
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
      recamaras: formData.recamaras ? Number(formData.recamaras) : null,
      banos: formData.banos ? Number(formData.banos) : null,
      estacionamientos: formData.estacionamientos ? Number(formData.estacionamientos) : 1,
      vista: formData.vista || null,
      reservado_por: formData.reservado_por || null,
      cliente_nombre: formData.cliente_nombre || null,
      notas: formData.notas || null,
    };

    let error;
    if (editandoId) {
      ({ error } = await supabase.from('unidades').update(datosAEnviar).eq('id', editandoId));
    } else {
      ({ error } = await supabase.from('unidades').insert([datosAEnviar]));
    }

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Unidad actualizada.' : 'Unidad registrada.' });
      setEditandoId(null);
      setMostrarFormulario(false);
      resetForm();
      cargarDatos();
    }
  };

  const resetForm = () => {
    setFormData({ numero: '', piso: '', tipo: 'apartamento', estado: 'libre', precio: '', area_m2: '', recamaras: '', banos: '', estacionamientos: '1', vista: '', reservado_por: '', cliente_nombre: '', notas: '' });
  };

  const iniciarEdicion = (u: Unidad) => {
    setEditandoId(u.id);
    setFormData({
      numero: u.numero,
      piso: u.piso?.toString() || '',
      tipo: u.tipo || 'apartamento',
      estado: u.estado,
      precio: u.precio?.toString() || '',
      area_m2: u.area_m2?.toString() || '',
      recamaras: u.recamaras?.toString() || '',
      banos: u.banos?.toString() || '',
      estacionamientos: u.estacionamientos?.toString() || '1',
      vista: u.vista || '',
      reservado_por: u.reservado_por || '',
      cliente_nombre: u.cliente_nombre || '',
      notas: u.notas || '',
    });
    setMostrarFormulario(true);
    setUnidadSeleccionada(null);
  };

  const cambiarEstadoRapido = async (id: string, nuevoEstado: string) => {
    await supabase.from('unidades').update({ estado: nuevoEstado }).eq('id', id);
    cargarDatos();
    setUnidadSeleccionada(null);
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

      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos`)} className="text-xs text-zinc-500 hover:text-[#d4ff3b] font-mono mb-2 block transition">
            ← Volver a Proyectos
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white">{proyecto?.nombre || 'Cargando...'}</h1>
          <p className="text-sm text-zinc-400 mt-1">Mapa de disponibilidad de unidades.</p>
        </div>
        <button onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditandoId(null); resetForm(); }} className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black text-xs font-bold px-4 py-2 rounded-lg transition">
          {mostrarFormulario ? 'Cerrar' : '+ Agregar Unidad'}
        </button>
      </div>

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
                <input type="number" name="recamaras" value={formData.recamaras} onChange={handleChange} placeholder="3" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
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
              <button type="button" onClick={() => { setMostrarFormulario(false); setEditandoId(null); resetForm(); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition">Cancelar</button>
              <button type="submit" className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2 rounded-lg text-sm font-semibold transition">
                {editandoId ? 'Actualizar' : 'Registrar Unidad'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {['todos', 'libre', 'reservado', 'vendido'].map(f => (
          <button key={f} onClick={() => setFiltroEstado(f)} className={`text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider transition border ${filtroEstado === f ? 'bg-[#d4ff3b] text-black border-[#d4ff3b]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
            {f === 'todos' ? 'Todas' : ESTADO_TEXTO[f]}
          </button>
        ))}
      </div>

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
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-3 block">
                  Piso {piso}
                </span>
                <div className="flex flex-wrap gap-2">
                  {unidadesPiso.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setUnidadSeleccionada(unidadSeleccionada?.id === u.id ? null : u)}
                      className={`${ESTADO_COLORES[u.estado]} text-white text-xs font-bold px-3 py-2 rounded-lg transition min-w-[60px] text-center shadow-lg`}
                    >
                      {u.numero}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {unidadSeleccionada && (
        <div className="fixed bottom-6 right-6 bg-[#18181b] border border-zinc-700 rounded-2xl shadow-2xl p-6 w-80 z-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Unidad</span>
              <h3 className="text-xl font-bold text-white">{unidadSeleccionada.numero}</h3>
            </div>
            <button onClick={() => setUnidadSeleccionada(null)} className="text-zinc-500 hover:text-white transition text-lg">✕</button>
          </div>

          <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-4 ${
            unidadSeleccionada.estado === 'libre' ? 'bg-emerald-500/20 text-emerald-400' :
            unidadSeleccionada.estado === 'reservado' ? 'bg-amber-400/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {ESTADO_TEXTO[unidadSeleccionada.estado]}
          </div>

          <div className="space-y-1 text-xs text-zinc-400 mb-4">
            {unidadSeleccionada.precio && <p>💰 ${Number(unidadSeleccionada.precio).toLocaleString()}</p>}
            {unidadSeleccionada.area_m2 && <p>📐 {unidadSeleccionada.area_m2} m²</p>}
            {unidadSeleccionada.recamaras && <p>🛏 {unidadSeleccionada.recamaras} habitaciones · {unidadSeleccionada.banos} baños</p>}
            {unidadSeleccionada.vista && <p>🌅 Vista: {unidadSeleccionada.vista}</p>}
            {unidadSeleccionada.reservado_por && <p>👤 Broker: {unidadSeleccionada.reservado_por}</p>}
            {unidadSeleccionada.cliente_nombre && <p>🏠 Cliente: {unidadSeleccionada.cliente_nombre}</p>}
          </div>

          <div className="space-y-2">
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
          </div>
        </div>
      )}
    </div>
  );
}