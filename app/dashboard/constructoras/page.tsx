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
  direccion: string | null;
  anio_fundacion: string | null;
  sitio_web: string | null;
  instagram: string | null;
  linkedin: string | null;
  descripcion: string | null;
}

export default function MiEmpresaPage() {
  const [constructora, setConstructora] = useState<Constructora | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [stats, setStats] = useState({ totalProyectos: 0, totalUnidades: 0 });
  const [formData, setFormData] = useState({
    nombre: '', logo_url: '', telefono: '', email: '', contacto_nombre: '',
    direccion: '', anio_fundacion: '', sitio_web: '', instagram: '', linkedin: '', descripcion: '',
  });

  useEffect(() => { cargarEmpresa(); }, []);

  const cargarEmpresa = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('constructora_id')
      .eq('id', user.id)
      .single();

    if (!perfil?.constructora_id) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('constructoras')
      .select('*')
      .eq('id', perfil.constructora_id)
      .single();

    if (!error && data) {
      setConstructora(data);
      setFormData({
        nombre: data.nombre,
        logo_url: data.logo_url || '',
        telefono: data.telefono || '',
        email: data.email || '',
        contacto_nombre: data.contacto_nombre || '',
        direccion: data.direccion || '',
        anio_fundacion: data.anio_fundacion || '',
        sitio_web: data.sitio_web || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        descripcion: data.descripcion || '',
      });

      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('unidades_total')
        .eq('constructora_id', data.id);

      if (proyectos) setStats({
        totalProyectos: proyectos.length,
        totalUnidades: proyectos.reduce((s, p) => s + (p.unidades_total || 0), 0),
      });
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!constructora) return;
    setMensaje(null);

    const { error } = await supabase.from('constructoras').update({
      nombre: formData.nombre,
      logo_url: formData.logo_url || null,
      telefono: formData.telefono || null,
      email: formData.email || null,
      contacto_nombre: formData.contacto_nombre || null,
      direccion: formData.direccion || null,
      anio_fundacion: formData.anio_fundacion || null,
      sitio_web: formData.sitio_web || null,
      instagram: formData.instagram || null,
      linkedin: formData.linkedin || null,
      descripcion: formData.descripcion || null,
    }).eq('id', constructora.id);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Empresa actualizada.' });
      setConstructora({ ...constructora, ...formData, logo_url: formData.logo_url || null });
    }
  };

  const input = "w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#CCFF00] transition";
  const label = "block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1";

  if (loading) return (
    <div className="p-4 md:p-8 min-h-screen bg-transparent text-zinc-100">
      <div className="text-center py-20 text-white font-mono text-sm animate-pulse">Cargando empresa...</div>
    </div>
  );

  if (!constructora) return (
    <div className="p-4 md:p-8 min-h-screen bg-transparent text-zinc-100">
      <div className="text-center py-20 text-zinc-600 font-mono text-sm">No se encontró tu empresa.</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-[#CCFF00] tracking-tighter uppercase">MI EMPRESA</h1>
          <p className="text-white text-xs mt-1 uppercase tracking-widest">Perfil y datos de tu empresa en SECTOR</p>
        </div>
        <a href={`/dashboard/constructoras/${constructora.id}/proyectos`}
          className="text-center bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs px-4 py-2.5 rounded-xl font-semibold transition border border-[#d4ff3b]/20 whitespace-nowrap self-center">
          Ver Proyectos →
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Proyectos', value: stats.totalProyectos, color: 'text-[#CCFF00]' },
          { label: 'Unidades Totales', value: stats.totalUnidades, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 md:p-5">
            <p className="text-white text-xs uppercase tracking-wider mb-1 font-mono">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Formulario */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">⚡ Editar Información</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Información General */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <span>🏢</span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Información General</span>
            </div>
            <div className="flex items-center gap-5 mb-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0">
                {formData.logo_url
                  ? <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">🏗️</div>
                }
              </div>
              <div className="flex-1">
                <label className={label}>URL del Logo</label>
                <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange}
                  placeholder="https://tuempresa.com/logo.png" className={input} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>Nombre de la Empresa *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                  placeholder="Grupo Puntacana" className={input} />
              </div>
              <div>
                <label className={label}>Año de Fundación</label>
                <input type="text" name="anio_fundacion" value={formData.anio_fundacion} onChange={handleChange}
                  placeholder="2008" className={input} />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                  placeholder="Av. Winston Churchill 1099, Torre Empresarial, Santo Domingo" className={input} />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <span>📞</span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Contacto</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label}>Nombre del Contacto</label>
                <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange}
                  placeholder="María Rodríguez" className={input} />
              </div>
              <div>
                <label className={label}>Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                  placeholder="809-555-0000" className={input} />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="contacto@tuempresa.com" className={input} />
              </div>
            </div>
          </div>

          {/* Presencia Digital */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <span>🌐</span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Presencia Digital</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={label}>Sitio Web</label>
                <input type="text" name="sitio_web" value={formData.sitio_web} onChange={handleChange}
                  placeholder="https://grupopuntacana.com" className={input} />
              </div>
              <div>
                <label className={label}>Instagram</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange}
                  placeholder="@grupopuntacana" className={input} />
              </div>
              <div>
                <label className={label}>LinkedIn</label>
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange}
                  placeholder="https://linkedin.com/company/grupopuntacana" className={input} />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <span>📝</span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Descripción</span>
            </div>
            <label className={label}>Sobre la Empresa</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4}
              placeholder="Desarrolladora con más de 10 años de trayectoria en proyectos residenciales de alto standing en Santo Domingo..."
              className={`${input} resize-none`} />
          </div>

          {mensaje && (
            <div className={`text-sm px-4 py-3 rounded-xl border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit"
              className="bg-[#CCFF00] hover:bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase transition">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
