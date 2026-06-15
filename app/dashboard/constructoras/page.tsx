"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

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
  const [constructora, setConstructora] = useState<Constructora | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    logo_url: '',
    telefono: '',
    email: '',
    contacto_nombre: '',
  });

  useEffect(() => {
    cargarConstructora();
  }, []);

  const cargarConstructora = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('constructoras')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      setConstructora(data);
      setFormData({
        nombre: data.nombre,
        logo_url: data.logo_url || '',
        telefono: data.telefono || '',
        email: data.email || '',
        contacto_nombre: data.contacto_nombre || '',
      });
    } else {
      setConstructora(null);
      setEditando(true); // Si no existe, mostramos el formulario directo
    }
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

    let error;
    if (constructora) {
      ({ error } = await supabase.from('constructoras').update(datosAEnviar).eq('id', constructora.id));
    } else {
      ({ error } = await supabase.from('constructoras').insert([datosAEnviar]));
    }

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: constructora ? 'Perfil actualizado.' : 'Constructora registrada.' });
      setEditando(false);
      cargarConstructora();
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center py-32 text-zinc-500 font-mono text-sm animate-pulse">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Mi Empresa</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Perfil de Constructora</h1>
          <p className="text-sm text-zinc-400 mt-1">Información de tu empresa en SECTOR.</p>
        </div>
        {constructora && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-4 py-2 rounded-lg transition border border-zinc-700 font-medium"
          >
            Editar perfil
          </button>
        )}
      </div>

      {/* Perfil existente (modo vista) */}
      {constructora && !editando && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo + Nombre */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {constructora.logo_url ? (
                <img src={constructora.logo_url} alt={constructora.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🏗️</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{constructora.nombre}</h2>
              {constructora.contacto_nombre && (
                <p className="text-zinc-400 text-sm mt-1">Contacto: {constructora.contacto_nombre}</p>
              )}
              <span className={`inline-block mt-2 text-[10px] px-2 py-1 rounded-full font-mono border ${constructora.activa ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                {constructora.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">Teléfono</p>
              <p className="text-white text-sm font-medium">{constructora.telefono || <span className="text-zinc-600">No registrado</span>}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">Email</p>
              <p className="text-white text-sm font-medium">{constructora.email || <span className="text-zinc-600">No registrado</span>}</p>
            </div>
          </div>

          {/* Acceso rápido a proyectos */}
          <div className="mt-6">
            <a
              href={`/dashboard/constructoras/${constructora.id}/proyectos`}
              className="w-full flex items-center justify-between bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black px-6 py-4 rounded-xl font-semibold transition border border-[#d4ff3b]/20 group"
            >
              <span>Ver mis proyectos</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      )}

      {/* Formulario (modo edición o primera vez) */}
      {editando && (
        <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-sm font-semibold mb-6 text-zinc-300 uppercase tracking-wider">
            {constructora ? 'Editar información' : 'Completa el perfil de tu empresa'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Nombre de la Empresa *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Grupo Puntacana"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Nombre del Contacto</label>
                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} placeholder="Ej. María Rodríguez"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="809-123-4567"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contacto@empresa.com"
                  className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">URL del Logo</label>
              <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://..."
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>

            {mensaje && (
              <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              {constructora && (
                <button type="button" onClick={() => { setEditando(false); setMensaje(null); }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg text-sm font-medium transition">
                  Cancelar
                </button>
              )}
              <button type="submit"
                className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2.5 rounded-lg text-sm font-semibold transition">
                {constructora ? 'Guardar cambios' : 'Registrar empresa'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
