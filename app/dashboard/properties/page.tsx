"use client"; // Obligatorio en Next.js para poder usar formularios y estados

import { useState } from 'react';

// 1. Definimos qué datos tiene una Propiedad (TypeScript)
interface Propiedad {
  id: number;
  titulo: string;
  precio: number;
  sector: string;
  imagen: string;
}

// 2. Tus datos simulados iniciales (los que tenías antes)
const initialProperties: Propiedad[] = [
  { 
    id: 1, 
    titulo: 'Penthouse Vista Mar', 
    precio: 550000, 
    sector: 'Premium',
    imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'
  },
  { 
    id: 2, 
    titulo: 'Casa Familiar Norte', 
    precio: 280000, 
    sector: 'Norte',
    imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500'
  },
];

export default function PropertiesPage() {
  // Estados con tipos de TypeScript
  const [propiedades, setPropiedades] = useState<Propiedad[]>(initialProperties);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    precio: '',
    sector: 'Premium',
    imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'
  });

  // Manejador de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función para guardar o actualizar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editandoId !== null) {
      // MODO EDICIÓN
      const actualizadas = propiedades.map((p) =>
        p.id === editandoId ? { ...p, ...formData, precio: Number(formData.precio) } : p
      );
      setPropiedades(actualizadas);
      setEditandoId(null);
    } else {
      // MODO CREAR
      const nuevaPropiedad: Propiedad = {
        id: Date.now(),
        titulo: formData.titulo,
        precio: Number(formData.precio),
        sector: formData.sector,
        imagen: formData.imagen
      };
      setPropiedades([...propiedades, nuevaPropiedad]);
    }

    // Limpiar formulario
    setFormData({ 
      titulo: '', 
      precio: '', 
      sector: 'Premium', 
      imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500' 
    });
  };

  const iniciarEdicion = (propiedad: Propiedad) => {
    setEditandoId(propiedad.id);
    setFormData({
      titulo: propiedad.titulo,
      precio: propiedad.precio.toString(),
      sector: propiedad.sector,
      imagen: propiedad.imagen
    });
  };

  const eliminarPropiedad = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar esta propiedad?")) {
      setPropiedades(propiedades.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-slate-900">
      <h1 className="text-2xl font-bold mb-6">Panel de Propiedades Premium</h1>

      {/* RECUADRO DEL FORMULARIO */}
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
          
          <div className="flex gap-2">
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold transition">
              {editandoId !== null ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setFormData({ titulo: '', precio: '', sector: 'Premium', imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500' });
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* EL SHOWROOM EN 3 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {propiedades.map((propiedad) => (
          <div key={propiedad.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 bg-white flex flex-col justify-between">
            <div>
              <img src={propiedad.imagen} alt={propiedad.titulo} className="w-full h-48 object-cover rounded-lg" />
              <span className="text-xs font-bold text-amber-600 block mt-3 uppercase tracking-wider">{propiedad.sector}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{propiedad.titulo}</h3>
              <p className="text-xl font-semibold text-slate-800 mt-1">${propiedad.precio.toLocaleString()}</p>
            </div>

            {/* BOTONES CONECTADOS */}
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
    </div>
  );
}