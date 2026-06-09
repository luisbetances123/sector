"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

interface Propiedad {
  id: number;
  titulo: string;
  precio: string;
  sector: string;
  imagen: string | null;
  recamaras: string;
  banos: string;
  metros_cuadrados: string;
  notas: string;
  // Galería extendida local para el visualizer premium
  imagenes_galeria: string[];
}

export default function PropertiesPage() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal / Ventana Flotante
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Propiedad | null>(null);
  const [fotoActivaIndex, setFotoActivaIndex] = useState<number>(0);

  const [formData, setFormData] = useState({
    titulo: '',
    precio: '',
    sector: 'Premium',
    imagen: '',
    recamaras: '4',
    banos: '5',
    metros_cuadrados: '480',
    notas: ''
  });

  useEffect(() => {
    cargarPropiedades();
  }, []);

  const cargarPropiedades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('propiedades') 
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error Supabase:', error.message);
      } else if (data) {
        const mapeadas = data.map((item: any) => {
          const imgPrincipal = item.imagen || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200';
          return {
            id: item.id,
            titulo: item.nombre || 'Propiedad sin título',
            precio: item.precio ? item.precio.toString() : '0',
            sector: item.ubicacion || 'Premium', 
            imagen: imgPrincipal,
            recamaras: item.recamaras ? item.recamaras.toString() : '4',
            banos: item.banos ? item.banos.toString() : '5',
            metros_cuadrados: item.area ? item.area.toString() : '480',
            notas: item.notas || item.descripcion || '',
            // Set de fotos complementarias para alimentar la ventana flotante de lujo
            imagenes_galeria: [
              imgPrincipal,
              'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
              'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
              'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
            ]
          };
        });
        setPropiedades(mapeadas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const datosAEnviar: any = {
      nombre: formData.titulo,
      precio: formData.precio, 
      ubicacion: formData.sector,
      imagen: formData.imagen || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      recamaras: formData.recamaras ? Number(formData.recamaras) : 4,
      banos: formData.banos ? Number(formData.banos) : 5,
      area: formData.metros_cuadrados, 
      notas: formData.notas || 'Ficha premium generada desde el nuevo panel SECTOR.'
    };

    try {
      if (editandoId !== null) {
        const { error } = await supabase.from('propiedades').update(datosAEnviar).eq('id', editandoId);
        if (error) return alert("Error al actualizar: " + error.message);
        setEditandoId(null);
      } else {
        const { error } = await supabase.from('propiedades').insert([datosAEnviar]);
        if (error) return alert("Error al guardar: " + error.message);
      }

      setFormData({ titulo: '', precio: '', sector: 'Premium', imagen: '', recamaras: '4', banos: '5', metros_cuadrados: '480', notas: '' });
      cargarPropiedades();
    } catch (err) {
      console.error(err);
    }
  };

  const iniciarEdicion = (propiedad: Propiedad) => {
    setEditandoId(propiedad.id);
    setFormData({
      titulo: propiedad.titulo,
      precio: propiedad.precio,
      sector: propiedad.sector,
      imagen: propiedad.imagen || '',
      recamaras: propiedad.recamaras,
      banos: propiedad.banos,
      metros_cuadrados: propiedad.metros_cuadrados,
      notas: propiedad.notas
    });
  };

  const eliminarPropiedad = async (id: number) => {
    if (confirm("¿Remover esta propiedad de la lista de SECTOR?")) {
      const { error } = await supabase.from('propiedades').delete().eq('id', id);
      if (!error) cargarPropiedades();
    }
  };

  // Funciones auxiliares para navegar las fotos en la ventana flotante
  const fotoSiguiente = () => {
    if (!propiedadSeleccionada) return;
    setFotoActivaIndex((prev) => (prev + 1) % propiedadSeleccionada.imagenes_galeria.length);
  };

  const fotoAnterior = () => {
    if (!propiedadSeleccionada) return;
    setFotoActivaIndex((prev) => (prev - 1 + propiedadSeleccionada.imagenes_galeria.length) % propiedadSeleccionada.imagenes_galeria.length);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-transparent text-zinc-100 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Catálogo de Propiedades</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestión de activos con visualizador flotante integrado multimedios.</p>
        </div>
        <span className="bg-[#d4ff3b]/10 text-[#d4ff3b] border border-[#d4ff3b]/20 text-xs px-3 py-1.5 rounded-full font-mono uppercase tracking-widest">
          Módulo Flotante Listo
        </span>
      </div>

      {/* FORMULARIO */}
      <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-xl shadow-2xl mb-10">
        <h2 className="text-md font-semibold mb-5 text-zinc-300 flex items-center gap-2">
          {editandoId !== null ? '⚡ Editar Parámetros del Activo' : '＋ Registrar Nueva Propiedad'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Título de la Propiedad</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej. Penthouse Duplex Minimalista con Vista al Golf"
                className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Precio de Salida</label>
              <input
                type="text"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="Ej. 4250000"
                className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d4ff3b] transition"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Ubicación / Sector</label>
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                placeholder="Ej. Evaristo Morales, SD"
                className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition"
              />
            </div>
          </div>

          {/* DETALLES ARQUITECTURA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Recámaras</label>
              <input type="number" name="recamaras" value={formData.recamaras} onChange={handleChange} className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Baños</label>
              <input type="number" name="banos" value={formData.banos} onChange={handleChange} className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Área M²</label>
              <input type="number" name="metros_cuadrados" value={formData.metros_cuadrados} onChange={handleChange} className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">URL de Imagen Principal</label>
              <input
                type="text"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Notas de Venta / Especificaciones Especiales</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={2}
              placeholder="Escribe los acabados, detalles de lujo o comentarios de venta aquí..."
              className="w-full p-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4ff3b] transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editandoId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setFormData({ titulo: '', precio: '', sector: 'Premium', imagen: '', recamaras: '4', banos: '5', metros_cuadrados: '480', notas: '' });
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancelar
              </button>
            )}
            <button type="submit" className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black px-6 py-2 rounded-lg text-sm font-semibold transition shadow-md shadow-[#d4ff3b]/10">
              {editandoId !== null ? 'Actualizar Parámetros' : 'Publicar Propiedad'}
            </button>
          </div>
        </form>
      </div>

      {/* SHOWROOM SECTOR */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-mono text-sm tracking-widest animate-pulse">
          Sincronizando base de datos de SECTOR...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {propiedades.map((propiedad) => (
            <div key={propiedad.id} className="bg-[#18181b] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl hover:border-zinc-700 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="relative group overflow-hidden h-52 bg-zinc-950">
                  <img src={propiedad.imagen || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'} alt={propiedad.titulo} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-[#09090b]/80 backdrop-blur-md text-[#d4ff3b] border border-zinc-800 text-[10px] font-mono px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {propiedad.sector}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{propiedad.titulo}</h3>
                  <p className="text-2xl font-semibold text-white mt-1.5 font-mono">
                    ${Number(propiedad.precio) ? Number(propiedad.precio).toLocaleString() : propiedad.precio}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 border-y border-zinc-800/60 text-center text-xs font-medium text-zinc-400">
                    <div>
                      <span className="block text-white font-mono text-sm">{propiedad.recamaras}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Recs</span>
                    </div>
                    <div className="border-x border-zinc-800/60">
                      <span className="block text-white font-mono text-sm">{propiedad.banos}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Baños</span>
                    </div>
                    <div>
                      <span className="block text-white font-mono text-sm">{propiedad.metros_cuadrados} <span className="text-[10px] text-zinc-400">m²</span></span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Área</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#09090b]/40 p-3 rounded-lg border border-zinc-800/40">
                    <span className="block text-[10px] text-zinc-500 uppercase font-mono tracking-wider mb-1">Notas de Venta:</span>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {propiedad.notas || 'Sin notas internas registradas.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCIONES COMPLETA */}
              <div className="p-5 pt-0 space-y-2">
                <button
                  onClick={() => {
                    setPropiedadSeleccionada(propiedad);
                    setFotoActivaIndex(0);
                  }}
                  className="w-full bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs py-2.5 rounded-lg font-semibold transition border border-[#d4ff3b]/20 text-center block"
                >
                  Ver Más Fotos / Detalles
                </button>
                
                <div className="flex gap-2">
                  <button onClick={() => iniciarEdicion(propiedad)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs py-2 rounded-lg font-medium transition border border-zinc-700/50">
                    Editar
                  </button>
                  <button onClick={() => eliminarPropiedad(propiedad.id)} className="px-3 bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 text-xs py-2 rounded-lg font-medium transition border border-zinc-800">
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── VENTANA FLOTANTE (MODAL INTERACTIVO DE LUJO) ─── */}
      {propiedadSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#18181b] border border-zinc-800 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* BOTÓN CERRAR */}
            <button 
              onClick={() => setPropiedadSeleccionada(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-full border border-zinc-800 transition"
            >
              ✕
            </button>

            {/* VISUALIZADOR DE FOTOS PRINCIPAL */}
            <div className="relative bg-zinc-950 aspect-[16/9] flex items-center justify-center overflow-hidden group">
              <img 
                src={propiedadSeleccionada.imagenes_galeria[fotoActivaIndex]} 
                alt="Visualización de Lujo" 
                className="w-full h-full object-cover transition duration-500"
              />

              {/* FLECHA IZQUIERDA */}
              <button 
                onClick={fotoAnterior}
                className="absolute left-4 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-zinc-700/50 backdrop-blur-sm transition focus:outline-none"
              >
                ◀
              </button>

              {/* FLECHA DERECHA */}
              <button 
                onClick={fotoSiguiente}
                className="absolute right-4 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full border border-zinc-700/50 backdrop-blur-sm transition focus:outline-none"
              >
                ▶
              </button>

              {/* INDICADOR DE POSICIÓN */}
              <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 text-[11px] font-mono text-zinc-300 rounded-md border border-zinc-800">
                Foto {fotoActivaIndex + 1} de {propiedadSeleccionada.imagenes_galeria.length}
              </div>
            </div>

            {/* CAROUSEL DE MINIATURAS INFERIORES */}
            <div className="p-4 bg-[#111113] border-b border-zinc-800/80 flex gap-2 overflow-x-auto scrollbar-none">
              {propiedadSeleccionada.imagenes_galeria.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setFotoActivaIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition ${
                    idx === fotoActivaIndex ? 'border-[#d4ff3b]' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* PIE DE DETALLES DEL MODAL */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-[#d4ff3b]/10 text-[#d4ff3b] px-2.5 py-1 rounded-md border border-[#d4ff3b]/20 tracking-wider">
                    {propiedadSeleccionada.sector}
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight mt-2">{propiedadSeleccionada.titulo}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block tracking-wider font-mono">Precio Solicitado</span>
                  <span className="text-2xl font-mono font-bold text-white">
                    ${Number(propiedadSeleccionada.precio) ? Number(propiedadSeleccionada.precio).toLocaleString() : propiedadSeleccionada.precio}
                  </span>
                </div>
              </div>

              {/* FICHA TÉCNICA MINI */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-[#09090b]/60 border border-zinc-800 rounded-xl text-center">
                <div>
                  <span className="block text-md font-mono text-white font-bold">{propiedadSeleccionada.recamaras}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Habitaciones</span>
                </div>
                <div className="border-x border-zinc-800">
                  <span className="block text-md font-mono text-white font-bold">{propiedadSeleccionada.banos}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Baños Completos</span>
                </div>
                <div>
                  <span className="block text-md font-mono text-white font-bold">{propiedadSeleccionada.metros_cuadrados} m²</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Superficie Total</span>
                </div>
              </div>

              {/* NOTAS COMPLETAS */}
              <div>
                <span className="block text-[11px] text-zinc-500 font-mono uppercase tracking-wider mb-1">Descripción y Detalles Premium:</span>
                <p className="text-sm text-zinc-300 leading-relaxed bg-[#09090b]/30 p-4 rounded-xl border border-zinc-800/40">
                  {propiedadSeleccionada.notas || "Esta propiedad no cuenta con comentarios de venta adicionales agregados."}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}