"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [constructora, setConstructora] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    logo_url: '',
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const { data } = await supabase
      .from('constructoras')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (data) {
      setConstructora(data);
      setFormData({
        nombre: data.nombre || '',
        contacto_nombre: data.contacto_nombre || '',
        telefono: data.telefono || '',
        email: data.email || '',
        logo_url: data.logo_url || '',
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    if (constructora) {
      const { error } = await supabase.from('constructoras').update(formData).eq('id', constructora.id);
      if (error) {
        setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
      } else {
        setMensaje({ tipo: 'exito', texto: 'Perfil actualizado.' });
        cargarPerfil();
      }
    }
    setGuardando(false);
  };

  if (loading) return (
    <div className="p-8 text-center py-32 text-white font-mono text-sm animate-pulse">
      Cargando perfil...
    </div>
  );

  return (
    <div className="p-8 min-h-screen bg-transparent text-zinc-100">
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Configuración</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Mi Perfil</h1>
        <p className="text-sm text-white mt-1">Información de tu cuenta en SECTOR.</p>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl shadow-2xl space-y-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Información de la Empresa</h2>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🏗️</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">URL del Logo</label>
              <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange}
                placeholder="https://..."
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Nombre de la Empresa</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                placeholder="Grupo Minier"
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Nombre del Contacto</label>
              <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange}
                placeholder="Roger Minier"
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                placeholder="809-000-0000"
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white uppercase tracking-wider mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="contacto@empresa.com"
                className="w-full p-3 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
          </div>
        </div>

        {mensaje && (
          <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={guardando}
            className="bg-[#d4ff3b] hover:bg-[#c2eb30] disabled:opacity-50 text-black px-8 py-3 rounded-lg text-sm font-semibold transition">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
