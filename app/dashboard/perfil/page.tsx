"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    bio: '',
    avatar_url: '',
    whatsapp: '',
    portal_activo: true,
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre, slug, bio, avatar_url, whatsapp, portal_activo')
      .eq('id', user.id)
      .single();
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        slug: profile.slug || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        whatsapp: profile.whatsapp || '',
        portal_activo: profile.portal_activo ?? true,
      });
    }
    setLoading(false);
  };

  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    setFormData(prev => ({
      ...prev,
      nombre,
      slug: prev.slug || generarSlug(nombre),
    }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        nombre: formData.nombre,
        slug: formData.slug,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        whatsapp: formData.whatsapp,
        portal_activo: formData.portal_activo,
      })
      .eq('id', user.id);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: '¡Perfil actualizado correctamente!' });
    }
    setGuardando(false);
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-500 font-mono text-sm tracking-widest animate-pulse">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen bg-transparent text-zinc-100">

      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mi Perfil</h1>
          <p className="text-sm text-zinc-400 mt-1">Configura tu portal público en sector.do/p/{formData.slug || 'tu-nombre'}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-mono uppercase tracking-widest border ${formData.portal_activo ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
          Portal {formData.portal_activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">

        {/* Foto y datos básicos */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-2xl space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Información Personal</h2>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl">👤</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">URL de Foto de Perfil</label>
              <input type="text" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="https://..." className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Nombre Completo</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleNombreChange} placeholder="Ej. María González" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition" required />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Biografía</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} maxLength={300} placeholder="Realtor especializado en propiedades de lujo en Santo Domingo..." className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition resize-none" />
            <span className="text-[10px] text-zinc-600 font-mono">{formData.bio.length}/300</span>
          </div>
        </div>

        {/* Portal público */}
        <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-2xl space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Portal Público</h2>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">URL de tu Portal</label>
            <div className="flex items-center gap-0">
              <span className="p-2.5 bg-zinc-900 border border-r-0 border-zinc-800 rounded-l-lg text-zinc-500 text-sm font-mono">sector.do/p/</span>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="tu-nombre" className="flex-1 p-2.5 bg-[#09090b] border border-zinc-800 rounded-r-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition font-mono" />
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">Solo letras, números y guiones. Ej: maria-gonzalez</p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">WhatsApp</label>
            <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="18091234567" className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition font-mono" />
            <p className="text-[10px] text-zinc-600 mt-1">Sin espacios ni símbolos. Ej: 18091234567</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#09090b]/60 border border-zinc-800 rounded-xl">
            <div>
              <p className="text-sm text-white font-medium">Portal Activo</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Tu portal será visible públicamente en sector.do/p/{formData.slug || 'tu-nombre'}</p>
            </div>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, portal_activo: !prev.portal_activo }))} className={`relative w-12 h-6 rounded-full transition-colors ${formData.portal_activo ? 'bg-[#d4ff3b]' : 'bg-zinc-700'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-transform ${formData.portal_activo ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {mensaje && (
          <div className={`text-sm px-4 py-3 rounded-lg border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#d4ff3b]/10 text-[#d4ff3b] border-[#d4ff3b]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={guardando} className="bg-[#d4ff3b] hover:bg-[#c2eb30] disabled:opacity-50 text-black px-8 py-2.5 rounded-lg text-sm font-semibold transition shadow-md shadow-[#d4ff3b]/10">
            {guardando ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        </div>

      </form>
    </div>
  );
}