"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  sector: string | null;
  pisos: number | null;
  unidades_total: number | null;
  fecha_entrega_estimada: string | null;
  porcentaje_avance: number;
  imagen_url: string | null;
  slug: string | null;
  activo: boolean;
}

interface Constructora {
  id: string;
  nombre: string;
}

interface Acceso {
  id: string;
  token: string;
  nombre_agencia: string | null;
  activo: boolean;
  created_at: string;
}

const formVacio = {
  nombre: '', descripcion: '', ubicacion: '', sector: '',
  pisos: '', unidades_total: '', fecha_entrega_estimada: '',
  porcentaje_avance: '0', imagen_url: '',
};

export default function ProyectosPage() {
  const params = useParams();
  const router = useRouter();
  const constructoraId = params?.id as string;

  const [constructora, setConstructora] = useState<Constructora | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [accesosProyecto, setAccesosProyecto] = useState<Record<string, Acceso[]>>({});
  const [generandoLink, setGenerandoLink] = useState<string | null>(null);
  const [nombreAgencia, setNombreAgencia] = useState('');
  const [linkGenerado, setLinkGenerado] = useState<string | null>(null);
  const [formData, setFormData] = useState(formVacio);

  useEffect(() => {
    if (constructoraId) cargarDatos();
  }, [constructoraId]);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: c } = await supabase.from('constructoras').select('id, nombre').eq('id', constructoraId).single();
    if (c) setConstructora(c);

    const { data: p } = await supabase.from('proyectos').select('*').eq('constructora_id', constructoraId).order('created_at', { ascending: false });
    if (p) {
      setProyectos(p);
      for (const proyecto of p) {
        const { data: accesos } = await supabase.from('proyecto_accesos').select('*').eq('proyecto_id', proyecto.id).order('created_at', { ascending: false });
        if (accesos) setAccesosProyecto(prev => ({ ...prev, [proyecto.id]: accesos }));
      }
    }
    setLoading(false);
  };

  const generarToken = () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

  const generarLink = async (proyectoId: string) => {
    if (!nombreAgencia.trim()) return;
    const token = generarToken();
    const { error } = await supabase.from('proyecto_accesos').insert([{ proyecto_id: proyectoId, token, nombre_agencia: nombreAgencia, activo: true }]);
    if (!error) {
      setLinkGenerado(`${window.location.origin}/proyecto/${token}`);
      setNombreAgencia('');
      cargarDatos();
    }
  };

  const desactivarAcceso = async (accesoId: string) => {
    await supabase.from('proyecto_accesos').update({ activo: false }).eq('id', accesoId);
    cargarDatos();
  };

  const generarSlug = (texto: string) =>
    texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    const datosAEnviar = {
      constructora_id: constructoraId,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      ubicacion: formData.ubicacion || null,
      sector: formData.sector || null,
      pisos: formData.pisos ? Number(formData.pisos) : null,
      unidades_total: formData.unidades_total ? Number(formData.unidades_total) : null,
      fecha_entrega_estimada: formData.fecha_entrega_estimada || null,
      porcentaje_avance: Number(formData.porcentaje_avance) || 0,
      imagen_url: formData.imagen_url || null,
      slug: generarSlug(formData.nombre),
    };
    let error;
    if (editandoId) {
      ({ error } = await supabase.from('proyectos').update(datosAEnviar).eq('id', editandoId));
    } else {
      ({ error } = await supabase.from('proyectos').insert([datosAEnviar]));
    }
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: editandoId ? 'Proyecto actualizado.' : 'Proyecto registrado.' });
      setEditandoId(null);
      setMostrarForm(false);
      setFormData(formVacio);
      cargarDatos();
    }
  };

  const iniciarEdicion = (p: Proyecto) => {
    setEditandoId(p.id);
    setFormData({
      nombre: p.nombre, descripcion: p.descripcion || '', ubicacion: p.ubicacion || '',
      sector: p.sector || '', pisos: p.pisos?.toString() || '',
      unidades_total: p.unidades_total?.toString() || '',
      fecha_entrega_estimada: p.fecha_entrega_estimada || '',
      porcentaje_avance: p.porcentaje_avance?.toString() || '0',
      imagen_url: p.imagen_url || '',
    });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setFormData(formVacio);
    setMensaje(null);
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    await supabase.from('proyectos').delete().eq('id', id);
    cargarDatos();
  };

  if (loading) return (
    <div className="p-8 max-w-6xl mx-auto text-center py-32 text-white font-mono text-sm animate-pulse">Cargando proyectos...</div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <button onClick={() => router.push('/dashboard/constructoras')} className="text-xs text-zinc-500 hover:text-[#d4ff3b] font-mono mb-2 block transition">
            ← Volver a Constructoras
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white">{constructora?.nombre || '...'}</h1>
          <p className="text-sm text-white mt-1">Proyectos registrados.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#d4ff3b]/10 text-[#d4ff3b] border border-[#d4ff3b]/20 text-xs px-3 py-1.5 rounded-full font-mono uppercase tracking-widest">
            {proyectos.length} {proyectos.length === 1 ? 'Proyecto' : 'Proyectos'}
          </span>
          {!mostrarForm && (
            <button onClick={() => setMostrarForm(true)}
              className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black text-xs px-4 py-2 rounded-lg font-semibold transition">
              + Nuevo Proyecto
            </button>
          )}
        </div>
      </div>

      {/* Formulario — solo visible cuando se activa */}
      {mostrarForm && (
        <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-2xl shadow-2xl mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {editandoId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <button onClick={cancelarForm} className="text-zinc-500 hover:text-white text-xs transition">✕ Cancelar</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Nombre del Proyecto *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Torre Piantini Residences"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Sector / Zona</label>
                <input type="text" name="sector" value={formData.sector} onChange={handleChange} placeholder="Ej. Piantini"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Pisos</label>
                <input type="number" name="pisos" value={formData.pisos} onChange={handleChange} placeholder="20"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Total Unidades</label>
                <input type="number" name="unidades_total" value={formData.unidades_total} onChange={handleChange} placeholder="80"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Entrega Estimada</label>
                <input type="date" name="fecha_entrega_estimada" value={formData.fecha_entrega_estimada} onChange={handleChange}
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Avance %</label>
                <input type="number" name="porcentaje_avance" value={formData.porcentaje_avance} onChange={handleChange} min="0" max="100"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Ubicación</label>
                <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej. Av. Abraham Lincoln esq. Gustavo Mejía Ricart"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">URL de Imagen</label>
                <input type="text" name="imagen_url" value={formData.imagen_url} onChange={handleChange} placeholder="https://..."
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} placeholder="Descripción del proyecto..."
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition resize-none" />
            </div>

            {mensaje && (
              <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={cancelarForm} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
                Cancelar
              </button>
              <button type="submit" className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition">
                {editandoId ? 'Guardar cambios' : 'Registrar Proyecto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Estado vacío */}
      {proyectos.length === 0 && !mostrarForm && (
        <div className="text-center py-32">
          <div className="text-5xl mb-4">🏗️</div>
          <p className="text-white font-medium mb-2">No hay proyectos registrados aún</p>
          <p className="text-white text-sm mb-6">Agrega el primer proyecto de {constructora?.nombre}</p>
          <button onClick={() => setMostrarForm(true)}
            className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-3 rounded-lg font-semibold transition">
            + Registrar primer proyecto
          </button>
        </div>
      )}

      {/* Lista de proyectos */}
      {proyectos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proyectos.map((p) => (
            <div key={p.id} className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition">
              {p.imagen_url && (
                <div className="h-40 overflow-hidden bg-zinc-900">
                  <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold">{p.nombre}</h3>
                    {p.sector && <span className="text-[10px] font-mono uppercase bg-[#d4ff3b]/10 text-[#d4ff3b] px-2 py-0.5 rounded border border-[#d4ff3b]/20 mt-1 inline-block">{p.sector}</span>}
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-mono border ${p.activo ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-zinc-800/60 text-xs text-zinc-500 mb-4">
                  <div><span className="block text-white font-mono font-bold">{p.pisos || '—'}</span>Pisos</div>
                  <div><span className="block text-white font-mono font-bold">{p.unidades_total || '—'}</span>Unidades</div>
                  <div><span className="block text-white font-mono font-bold">{p.porcentaje_avance}%</span>Avance</div>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-4">
                  <div className="bg-[#d4ff3b] h-1.5 rounded-full transition-all" style={{ width: `${p.porcentaje_avance}%` }} />
                </div>

                <div className="flex gap-2 mb-4">
                  <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${p.id}/unidades`)}
                    className="flex-1 text-center bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs py-2 rounded-lg font-semibold transition border border-[#d4ff3b]/20">
                    Ver Unidades →
                  </button>
                  <button onClick={() => iniciarEdicion(p)} className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded-lg transition border border-zinc-700">Editar</button>
                  <button onClick={() => eliminar(p.id)} className="bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 text-xs px-3 py-2 rounded-lg transition border border-zinc-800">Borrar</button>
                </div>

                {/* Links para brokers */}
                <div className="border-t border-zinc-800 pt-4">
                  <div className="text-[10px] text-white uppercase tracking-wider font-mono mb-3">Links para Brokers</div>
                  {(accesosProyecto[p.id] || []).filter(a => a.activo).map(acceso => (
                    <div key={acceso.id} className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-1.5">
                        <div className="text-[10px] text-white font-mono truncate">{acceso.nombre_agencia}</div>
                        <div className="text-[10px] text-zinc-600 font-mono truncate">/proyecto/{acceso.token}</div>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/proyecto/${acceso.token}`)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] px-2 py-1.5 rounded-lg transition">Copiar</button>
                      <button onClick={() => desactivarAcceso(acceso.id)}
                        className="bg-zinc-900 hover:bg-red-950/40 text-zinc-600 hover:text-red-400 text-[10px] px-2 py-1.5 rounded-lg transition">✕</button>
                    </div>
                  ))}

                  {generandoLink === p.id ? (
                    <div className="mt-2">
                      <input type="text" value={nombreAgencia} onChange={e => setNombreAgencia(e.target.value)}
                        placeholder="Nombre de la agencia o broker"
                        className="w-full p-2 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-[#d4ff3b] transition mb-2" />
                      {linkGenerado && (
                        <div className="bg-[#d4ff3b]/10 border border-[#d4ff3b]/20 rounded-lg p-3 mb-2">
                          <div className="text-[10px] text-[#d4ff3b] font-mono break-all">{linkGenerado}</div>
                          <button onClick={() => navigator.clipboard.writeText(linkGenerado)} className="text-[10px] text-[#d4ff3b] underline mt-1">Copiar link</button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => generarLink(p.id)} disabled={!nombreAgencia.trim()}
                          className="flex-1 bg-[#d4ff3b] hover:bg-[#c2eb30] disabled:opacity-40 text-black text-xs py-1.5 rounded-lg font-semibold transition">
                          Generar Link
                        </button>
                        <button onClick={() => { setGenerandoLink(null); setNombreAgencia(''); setLinkGenerado(null); }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg transition">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setGenerandoLink(p.id); setLinkGenerado(null); }}
                      className="w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white hover:text-zinc-200 text-xs py-2 rounded-lg transition border border-zinc-800 border-dashed mt-1">
                      + Generar link para broker
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
