"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Forzar a Next.js a renderizar la página en tiempo real evitando cachés estáticas
export const dynamic = 'force-dynamic';

interface Propiedad {
  id: number;
  titulo: string;
  precio: number;
  sector: string;
  imagen: string | null;
}

export default function PropertiesPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    titulo: '',
    precio: '',
    sector: 'Premium',
    imagen: ''
  });

  useEffect(() => {
    cargarPropiedades();
  }, []);

  const cargarPropiedades = async () => {
    setLoading(true);
    try {
      // Consultamos a la tabla 'propiedades' en minúscula como figura en Supabase
      const { data, error } = await supabase
        .from('propiedades') 
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error detallado de Supabase:', error.message);
      } else if (data) {
        console.log('Datos reales traídos de Supabase:', data);
        setPropiedades(data as Propiedad[]);
      }
    } catch (err) {
      console.error('Error en la petición de carga:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const datosAEnviar = {
      titulo: formData.titulo,
      precio: Number(formData.precio),
      sector: formData.sector,
      imagen: formData.imagen || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'
    };

    try {
      if (editandoId !== null) {
        const { error } = await supabase
          .from('propiedades')
          .update(datosAEnviar)
          .eq('id', editandoId);

        if (error) {
          alert('Error al actualizar: ' + error.message);
          return;
        }
        setEditandoId(null);
      } else {
        const { error } = await supabase
          .from('propiedades')
          .insert([datosAEnviar]);

        if (error) {
          alert('Error al guardar: ' + error.message);
          return;
        }
      }

      setFormData({ titulo: '', precio: '', sector: 'Premium', imagen: '' });
      cargarPropiedades();
    } catch (err) {
      console.error('Error en el envío del formulario:', err);
    }
  };

  const iniciarEdicion = (propiedad: Propiedad) => {
    setEditandoId(propiedad.id);
    setFormData({
      titulo: propiedad.titulo,
      precio: propiedad.precio.toString(),
      sector: propiedad.sector,
      imagen: propiedad.imagen || ''
    });
  };

  const eliminarPropiedad = async (id: number) => {
    if (confirm("¿Seguro que quieres eliminar esta propiedad de la base de datos real?")) {
      try {
        const { error } = await supabase
          .from('propiedades')
          .delete()
          .eq('id', id);

        if (error) {
          alert('Error al eliminar: ' + error.message);
        } else {
          cargarPropiedades();
        }
      } catch (err) {
        console.error('Error en la eliminación:', err);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-slate-900">
      {/* Título optimizado con text-3xl y text-white para el modo oscuro */}
      <h1 className="text-3xl font-bold mb-6 text-white">Panel de Propiedades Premium (Live)</h1>

      {/* FORMULARIO */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">
          {editandoId !== null ? '📝 Editar Propiedad' : '✨ Nueva Propiedad'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Título</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg text-black focus:outline-amber-500"
              required
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Precio ($)</label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg text-black focus:outline-amber-500"
              required
            />
          </div>
          <div className="w-44">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sector</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded-lg text-black focus:outline-amber-500"
            >
              <option value="Premium">Premium</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">URL Imagen (Opcional)</label>
            <input
              type="text"
              name="imagen"
              value={formData.imagen}
              onChange={handleChange}
              placeholder="https://link-de-imagen.com"
              className="w-full p-2 border border-slate-300 rounded-lg text-black focus:outline-amber-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold transition">
              {editandoId !== null ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setFormData({ titulo: '', precio: '', sector: 'Premium', imagen: '' });
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SHOWROOM */}
      {loading ? (
        <p className="text-center text-gray-400">Cargando propiedades desde Supabase...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {propiedades.map((propiedad) => (
            <div key={propiedad.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 bg-white flex flex-col justify-between">
              <div>
                <img 
                  src={propiedad.imagen || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'} 
                  alt={propiedad.titulo} 
                  className="w-full h-48 object-cover rounded-lg" 
                />
                <span className="text-xs font-bold text-amber-600 block mt-3 uppercase tracking-wider">{propiedad.sector}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{propiedad.titulo}</h3>
                <p className="text-xl font-semibold text-slate-800 mt-1">${propiedad.precio?.toLocaleString()}</p>
              </div>

              <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => iniciarEdicion(propiedad)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm py-2 rounded-lg font-medium transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarPropiedad(propiedad.id)}
                  className="flex-1 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-600 text-sm py-2 rounded-lg font-medium transition"
                >
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