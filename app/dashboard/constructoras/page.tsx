"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

interface Constructora {
  id: string;
  nombre: string;
  logo_url: string | null;
  telefono: string | null;
  email: string | null;
  contacto_nombre: string | null;
  activa: boolean;
}

export default function ConstructorasPage() {
  const [constructoras, setConstructoras] = useState<Constructora[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    logo_url: '',
    telefono: '',
    email: '',
    contacto_nombre: '',
  });

  useEffect(() => {
    cargarConstructoras();
  }, []);

  const cargarConstructoras = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('constructoras')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setConstructoras(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const datosAEnviar = {
      nombre: formData.nombre,
      logo_url: formData.logo_url || null,
      telefono: formData.telefono || null,
      email: formData.email || null,
      contacto_nombre: formData.contacto_nombre || null,
    };

    if (editandoId) {
      const { error: updateError } = await supabase.from('constructoras').update(datosAEnviar).eq('id', editandoId);
      if (updateError) {
        setMensaje({ tipo: 'error', texto: 'Error: ' + updateError.message });
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('constructoras').insert([datosAEnviar]);
      if (insertError) {
        setMensaje({ tipo: 'error', texto: 'Error: ' + insertError.message });
        return;
      }
    }

    setMensaje({ tipo: 'exito', texto: editandoId ? 'Constructora actualizada.' : 'Constructora registrada.' });
    setEditandoId(null);
    setFormData({ nombre: '', logo_url: '', telefono: '', email: '', contacto_nombre: '' });
    cargarConstructoras();
  };

  const iniciarEdicion = (c: Constructora) => {
    setEditandoId(c.id);
    setFormData({
      nombre: c.nombre,
      logo_url: c.logo_url || '',
      telefono: c.telefono || '',
      email: c.email || '',
      contacto_nombre: c.contacto_nombre || '',
    });
  };

  const toggleActiva = async (id: string, activa: boolean) => {
    await supabase.from('constructoras').update({ activa: !activa }).eq('id', id);
    cargarConstructoras();
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta constructora?')) return;
    await supabase.from('constructoras').delete().eq('id', id);
    cargarConstructoras();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-transparent text-zinc-100">

      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Constructoras</h1>
          <p className="text-sm text-zinc-400 mt-1">Empresas desarrolladoras registradas en SECTOR.</p>
        </div>
        <span className="bg-[#d4ff3b]/10 text-[#d4ff3b] border border-[#d4ff3b]/20 text-xs px-3 py-1.5 rounded-full font-mono uppercase tracking-widest">
          {constructoras.length} registradas
        </span>
      </div>

      {/* Formulario */}
      <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-2xl mb-10">
        <h2 className="text-sm font-semibold mb-5 text-zinc-300 uppercase tracking-wider">
          {editandoId ? '⚡ Editar Constructora' : '＋ Registrar Constructora'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Nombre de la Empresa *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Grupo Puntacana" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Nombre del Contacto</label>
              <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} placeholder="Ej. María Rodríguez" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="8091234567" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contacto@empresa.com" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">URL del Logo</label>
              <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://..." className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
          </div>

          {mensaje && (
            <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {editandoId && (
              <button type="button" onClick={() => { setEditandoId(null); setFormData({ nombre: '', logo_url: '', telefono: '', email: '', contacto_nombre: '' }); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition">
                Cancelar
              </button>
            )}
            <button type="submit" className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2 rounded-lg text-sm font-semibold transition">
              {editandoId ? 'Actualizar' : 'Registrar Constructora'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm animate-pulse">Cargando constructoras...</div>
      ) : constructoras.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 font-mono text-sm">No hay constructoras registradas aún.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {constructoras.map((c) => (
            <div key={c.id} className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4 md:w-72 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-600 text-xl">🏗️</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{c.nombre}</h3>
                  {c.contacto_nombre && <p className="text-zinc-500 text-xs mt-0.5">{c.contacto_nombre}</p>}
                </div>
              </div>

              <div className="flex-1 flex flex-wrap gap-x-6 gap-y-1">
                {c.telefono && <p className="text-xs text-zinc-500 font-mono">📞 {c.telefono}</p>}
                {c.email && <p className="text-xs text-zinc-500 font-mono">✉️ {c.email}</p>}
              </div>

              <span className={`text-[10px] px-2 py-1 rounded-full font-mono border self-start md:self-center ${c.activa ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                {c.activa ? 'Activa' : 'Inactiva'}
              </span>

              <div className="flex gap-2 flex-shrink-0">
                <a href={`/dashboard/constructoras/${c.id}/proyectos`} className="text-center bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs px-3 py-2 rounded-lg font-semibold transition border border-[#d4ff3b]/20 whitespace-nowrap">
                  Ver Proyectos →
                </a>
                <button onClick={() => iniciarEdicion(c)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg transition border border-zinc-700">
                  Editar
                </button>
                <button onClick={() => toggleActiva(c.id, c.activa)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-2 rounded-lg transition border border-zinc-700 whitespace-nowrap">
                  {c.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => eliminar(c.id)} className="bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 text-xs px-3 py-2 rounded-lg transition border border-zinc-800">
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
