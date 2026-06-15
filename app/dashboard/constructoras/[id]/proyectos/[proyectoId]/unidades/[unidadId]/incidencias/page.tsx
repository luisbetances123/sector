"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface Incidencia {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  prioridad: string;
  estado: string;
  reportado_por: string | null;
  imagen_url: string | null;
  nota_resolucion: string | null;
  created_at: string;
  resuelto_at: string | null;
}

interface Unidad {
  id: string;
  numero: string;
  cliente_nombre: string | null;
}

const CATEGORIAS = ['general', 'plomeria', 'electricidad', 'pintura', 'carpinteria', 'acabados', 'filtracion', 'otro'];
const PRIORIDADES: Record<string, { label: string; color: string; bg: string }> = {
  alta:   { label: 'Alta',   color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  media:  { label: 'Media',  color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20' },
  baja:   { label: 'Baja',   color: 'text-zinc-400',   bg: 'bg-zinc-800 border-zinc-700' },
};
const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  abierta:     { label: 'Abierta',     color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20' },
  en_proceso:  { label: 'En proceso',  color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  resuelta:    { label: 'Resuelta',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

const formVacio = {
  titulo: '', descripcion: '', categoria: 'general',
  prioridad: 'media', reportado_por: '', imagen_url: '',
};

export default function IncidenciasPage() {
  const params = useParams();
  const router = useRouter();
  const constructoraId = params?.id as string;
  const proyectoId = params?.proyectoId as string;
  const unidadId = params?.unidadId as string;

  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [notaResolucion, setNotaResolucion] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formData, setFormData] = useState(formVacio);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const { data: u } = await supabase.from('unidades').select('id, numero, cliente_nombre').eq('id', unidadId).single();
    if (u) setUnidad(u);
    const { data: i } = await supabase.from('incidencias').select('*').eq('unidad_id', unidadId).order('created_at', { ascending: false });
    if (i) setIncidencias(i);
    setLoading(false);
  }, [unidadId]);

  useEffect(() => { if (unidadId) cargarDatos(); }, [unidadId, cargarDatos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    const { error } = await supabase.from('incidencias').insert([{
      unidad_id: unidadId,
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      categoria: formData.categoria,
      prioridad: formData.prioridad,
      reportado_por: formData.reportado_por || null,
      imagen_url: formData.imagen_url || null,
      estado: 'abierta',
    }]);
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Incidencia registrada.' });
      setFormData(formVacio);
      setMostrarForm(false);
      cargarDatos();
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const extras: Record<string, string | null> = {};
    if (nuevoEstado === 'resuelta') {
      extras.resuelto_at = new Date().toISOString();
      extras.nota_resolucion = notaResolucion || null;
    }
    await supabase.from('incidencias').update({ estado: nuevoEstado, ...extras }).eq('id', id);
    setNotaResolucion('');
    setExpandida(null);
    cargarDatos();
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;
    await supabase.from('incidencias').delete().eq('id', id);
    cargarDatos();
  };

  const incidenciasFiltradas = filtro === 'todas' ? incidencias : incidencias.filter(i => i.estado === filtro);
  const conteo = {
    abierta: incidencias.filter(i => i.estado === 'abierta').length,
    en_proceso: incidencias.filter(i => i.estado === 'en_proceso').length,
    resuelta: incidencias.filter(i => i.estado === 'resuelta').length,
  };

  if (loading) return (
    <div className="p-8 max-w-4xl mx-auto text-center py-32 text-zinc-500 font-mono text-sm animate-pulse">Cargando incidencias...</div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${proyectoId}/unidades/${unidadId}`)}
            className="text-xs text-zinc-500 hover:text-[#d4ff3b] font-mono mb-2 block transition">
            ← Volver al Plan de Pago
          </button>
          <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Unidad {unidad?.numero}</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Incidencias de Entrega</h1>
          {unidad?.cliente_nombre && <p className="text-sm text-zinc-400 mt-1">Cliente: {unidad.cliente_nombre}</p>}
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black text-xs font-bold px-4 py-2 rounded-lg transition">
          {mostrarForm ? 'Cancelar' : '+ Nueva Incidencia'}
        </button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#18181b] border border-amber-400/20 rounded-xl p-4 text-center">
          <span className="block text-2xl font-mono font-bold text-amber-400">{conteo.abierta}</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Abiertas</span>
        </div>
        <div className="bg-[#18181b] border border-blue-500/20 rounded-xl p-4 text-center">
          <span className="block text-2xl font-mono font-bold text-blue-400">{conteo.en_proceso}</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">En Proceso</span>
        </div>
        <div className="bg-[#18181b] border border-emerald-500/20 rounded-xl p-4 text-center">
          <span className="block text-2xl font-mono font-bold text-emerald-400">{conteo.resuelta}</span>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Resueltas</span>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-6">Registrar Incidencia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Título *</label>
              <input type="text" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                required placeholder="Ej. Filtración en techo del baño principal"
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Categoría</label>
                <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition capitalize">
                  {CATEGORIAS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Prioridad</label>
                <select value={formData.prioridad} onChange={e => setFormData({ ...formData, prioridad: e.target.value })}
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition">
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Reportado por</label>
                <input type="text" value={formData.reportado_por} onChange={e => setFormData({ ...formData, reportado_por: e.target.value })}
                  placeholder="Cliente o broker"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Descripción</label>
              <textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3} placeholder="Describe el problema con detalle..."
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition resize-none" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">URL de foto (opcional)</label>
              <input type="text" value={formData.imagen_url} onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                placeholder="https://..."
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>

            {mensaje && (
              <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setMostrarForm(false); setFormData(formVacio); }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg text-sm font-medium transition">Cancelar</button>
              <button type="submit" className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition">
                Registrar incidencia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {[['todas', 'Todas'], ['abierta', 'Abiertas'], ['en_proceso', 'En proceso'], ['resuelta', 'Resueltas']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFiltro(val)}
            className={`text-xs px-3 py-1.5 rounded-lg font-mono uppercase tracking-wider transition border ${filtro === val ? 'bg-[#d4ff3b] text-black border-[#d4ff3b]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Estado vacío */}
      {incidencias.length === 0 && !mostrarForm && (
        <div className="text-center py-32">
          <div className="text-5xl mb-4">🔧</div>
          <p className="text-zinc-400 font-medium mb-2">Sin incidencias registradas</p>
          <p className="text-zinc-600 text-sm mb-6">Registra problemas detectados durante la entrega de la unidad</p>
          <button onClick={() => setMostrarForm(true)} className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-3 rounded-lg font-semibold transition">
            + Registrar primera incidencia
          </button>
        </div>
      )}

      {/* Lista de incidencias */}
      {incidenciasFiltradas.length > 0 && (
        <div className="space-y-4">
          {incidenciasFiltradas.map(inc => {
            const est = ESTADOS[inc.estado] || ESTADOS.abierta;
            const pri = PRIORIDADES[inc.prioridad] || PRIORIDADES.media;
            const isExpandida = expandida === inc.id;
            return (
              <div key={inc.id} className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition">
                <div className="p-5 cursor-pointer" onClick={() => setExpandida(isExpandida ? null : inc.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${est.bg} ${est.color}`}>{est.label}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full border font-mono ${pri.bg} ${pri.color}`}>{pri.label}</span>
                        <span className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 font-mono capitalize">{inc.categoria}</span>
                      </div>
                      <h3 className="text-white font-semibold">{inc.titulo}</h3>
                      {inc.reportado_por && <p className="text-zinc-500 text-xs mt-1">Reportado por: {inc.reportado_por}</p>}
                      <p className="text-zinc-600 text-xs mt-1">
                        {new Date(inc.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-zinc-500 text-sm">{isExpandida ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpandida && (
                  <div className="border-t border-zinc-800 p-5 space-y-4">
                    {inc.descripcion && (
                      <p className="text-zinc-300 text-sm leading-relaxed">{inc.descripcion}</p>
                    )}
                    {inc.imagen_url && (
                      <img src={inc.imagen_url} alt="Incidencia" className="w-full max-h-48 object-cover rounded-xl border border-zinc-800" />
                    )}
                    {inc.nota_resolucion && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono mb-1">Nota de resolución</p>
                        <p className="text-emerald-300 text-sm">{inc.nota_resolucion}</p>
                        {inc.resuelto_at && (
                          <p className="text-emerald-500/60 text-[10px] mt-1">
                            Resuelta el {new Date(inc.resuelto_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2">
                      {inc.estado !== 'en_proceso' && inc.estado !== 'resuelta' && (
                        <button onClick={() => cambiarEstado(inc.id, 'en_proceso')}
                          className="bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white text-xs px-3 py-2 rounded-lg transition font-semibold">
                          Marcar en proceso
                        </button>
                      )}
                      {inc.estado !== 'resuelta' && (
                        <div className="flex-1 flex gap-2">
                          <input type="text" value={notaResolucion} onChange={e => setNotaResolucion(e.target.value)}
                            placeholder="Nota de resolución (opcional)"
                            className="flex-1 p-2 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-[#d4ff3b] transition" />
                          <button onClick={() => cambiarEstado(inc.id, 'resuelta')}
                            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs px-3 py-2 rounded-lg transition font-semibold whitespace-nowrap">
                            ✓ Resolver
                          </button>
                        </div>
                      )}
                      {inc.estado === 'resuelta' && (
                        <button onClick={() => cambiarEstado(inc.id, 'abierta')}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs px-3 py-2 rounded-lg transition">
                          Reabrir
                        </button>
                      )}
                      <button onClick={() => eliminar(inc.id)}
                        className="bg-zinc-900 hover:bg-red-950/40 text-zinc-600 hover:text-red-400 text-xs px-3 py-2 rounded-lg transition border border-zinc-800">
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
