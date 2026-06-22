"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [constructora, setConstructora] = useState<any>(null);
  const [stats, setStats] = useState({ proyectosActivos: 0, unidadesTotales: 0 });
  const [formData, setFormData] = useState({
    nombre: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    logo_url: '',
    direccion: '',
    anio_fundacion: '',
    sitio_web: '',
    instagram: '',
    linkedin: '',
    descripcion: '',
  });

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    const { data } = await supabase.from('constructoras').select('*').limit(1).maybeSingle();
    if (data) {
      setConstructora(data);
      setFormData({
        nombre: data.nombre || '',
        contacto_nombre: data.contacto_nombre || '',
        telefono: data.telefono || '',
        email: data.email || '',
        logo_url: data.logo_url || '',
        direccion: data.direccion || '',
        anio_fundacion: data.anio_fundacion || '',
        sitio_web: data.sitio_web || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        descripcion: data.descripcion || '',
      });
      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('activo, unidades_total')
        .eq('constructora_id', data.id);
      if (proyectos) {
        setStats({
          proyectosActivos: proyectos.filter(p => p.activo).length,
          unidadesTotales: proyectos.reduce((s, p) => s + (p.unidades_total || 0), 0),
        });
      }
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const anosEnSector = formData.anio_fundacion && /^\d{4}$/.test(formData.anio_fundacion)
    ? new Date().getFullYear() - parseInt(formData.anio_fundacion)
    : null;

  if (loading) return (
    <div className="p-8 text-center py-32 text-white font-mono text-sm animate-pulse">
      Cargando perfil...
    </div>
  );

  const input = "w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#CCFF00] transition";
  const label = "block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1";

  return (
    <div className="p-4 md:p-8 min-h-screen bg-transparent text-zinc-100">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic text-[#CCFF00] tracking-tighter uppercase">MI EMPRESA</h1>
          <p className="text-white text-xs mt-1 uppercase tracking-widest">Configuración · Tu perfil en SECTOR</p>
        </div>
        <button form="form-perfil" type="submit" disabled={guardando}
          className="bg-[#CCFF00] hover:bg-white disabled:opacity-50 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase transition">
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Proyectos Activos', value: stats.proyectosActivos, color: 'text-[#CCFF00]' },
          { label: 'Unidades Totales', value: stats.unidadesTotales, color: 'text-white' },
          { label: 'Años en SECTOR', value: anosEnSector !== null ? anosEnSector : '—', color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 md:p-5">
            <p className="text-white text-xs uppercase tracking-wider mb-1 font-mono">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form id="form-perfil" onSubmit={handleGuardar}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-8">

          {/* Información General */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <span>🏢</span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Información General</span>
            </div>
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0">
                {formData.logo_url
                  ? <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🏗️</div>
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
                  placeholder="Grupo Inmobiliario Minier" className={input} />
              </div>
              <div>
                <label className={label}>Año de Fundación</label>
                <input type="text" name="anio_fundacion" value={formData.anio_fundacion} onChange={handleChange}
                  placeholder="2010" className={input} />
              </div>
              <div className="md:col-span-2">
                <label className={label}>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                  placeholder="Av. Abraham Lincoln 304, Piantini, Santo Domingo" className={input} />
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
                  placeholder="Roger Minier" className={input} />
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
                  placeholder="https://tuempresa.com" className={input} />
              </div>
              <div>
                <label className={label}>Instagram</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange}
                  placeholder="@grupominier" className={input} />
              </div>
              <div>
                <label className={label}>LinkedIn</label>
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange}
                  placeholder="https://linkedin.com/company/grupominier" className={input} />
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
              placeholder="Desarrolladora dominicana con más de 15 años de experiencia en proyectos residenciales y comerciales en Santo Domingo..."
              className={`${input} resize-none`} />
          </div>

        </div>

        {mensaje && (
          <div className={`mt-4 text-sm px-4 py-3 rounded-xl border font-mono ${mensaje.tipo === 'exito' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {mensaje.texto}
          </div>
        )}
      </form>
    </div>
  );
}
