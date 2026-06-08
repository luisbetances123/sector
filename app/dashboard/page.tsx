"use client";

import React, { useState } from 'react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  status: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  image: string;
  tag: string;
}

export default function PropertiesPage() {
  // Datos simulados premium
  const [properties] = useState<Property[]>([
    {
      id: '1',
      title: 'Penthouse en Naco con Vista 360',
      location: 'Naco, Santo Domingo',
      price: 'US$ 540,000',
      type: 'Penthouse',
      status: 'DISPONIBLE',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      tag: 'Luxury'
    },
    {
      id: '2',
      title: 'Villa Moderna en Cap Cana',
      location: 'Punta Cana, La Altagracia',
      price: 'US$ 1,250,000',
      type: 'Villa',
      status: 'RESERVADO',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      tag: 'Exclusive'
    },
    {
      id: '3',
      title: 'Apartamento de Lujo en Piantini',
      location: 'Piantini, Santo Domingo',
      price: 'US$ 325,000',
      type: 'Apartamento',
      status: 'DISPONIBLE',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      tag: 'Investment'
    },
    {
      id: '4',
      title: 'Casa de Campo Style - Dye Fore',
      location: 'La Romana',
      price: 'US$ 3,500,000',
      type: 'Casa',
      status: 'VENDIDO',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      tag: 'Golf Front'
    },
    {
      id: '5',
      title: 'Apt. Moderno en Bella Vista',
      location: 'Bella Vista, Santo Domingo',
      price: 'US$ 195,000',
      type: 'Apartamento',
      status: 'DISPONIBLE',
      image: 'https://images.unsplash.com/photo-1600607687940-477a4a6999a3?auto=format&fit=crop&w=800&q=80',
      tag: 'Modern'
    }
  ]);

  const sectors = ["Piantini", "Naco", "Cap Cana", "Bella Vista", "Evaristo Morales", "Serrallés", "Arroyo Hondo", "Gazcue"];

  return (
    <div className="min-h-screen text-zinc-100 p-8 font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* CABECERA Y ACCIÓN PRINCIPAL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-sm font-mono text-[#CCFF00] uppercase tracking-widest">Inventario Premium</span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white mt-2">Propiedades</h1>
          </div>
          <button className="bg-[#CCFF00] text-black font-black uppercase text-xs px-6 py-4 rounded-xl hover:bg-[#b5e600] transition-all shadow-lg shadow-[#CCFF00]/10">
            + Nueva Propiedad
          </button>
        </header>

        {/* INDICADORES (KPIs) - MÁS ESPACIADOS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Disponibles', val: '84', color: 'text-white' },
            { label: 'En Proceso', val: '12', color: 'text-[#CCFF00]' },
            { label: 'Cerradas', val: '28', color: 'text-zinc-500' },
            { label: 'Valor Total', val: '$14.2M', color: 'text-white' },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{item.label}</p>
              <p className={`text-3xl font-black mt-1 ${item.color}`}>{item.val}</p>
            </div>
          ))}
        </section>

        {/* FILTRADO INTELIGENTE (Adiós a la nube de tags apretada) */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Buscar por nombre, calle o ID..."
              className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-[#CCFF00] text-sm px-5 py-4 rounded-xl outline-none transition-all"
            />
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {sectors.slice(0, 5).map(s => (
                <button key={s} className="whitespace-nowrap px-4 py-2 rounded-full border border-zinc-800 text-[11px] font-mono hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all uppercase">
                  {s}
                </button>
              ))}
              <button className="px-4 py-2 rounded-full border border-dashed border-zinc-700 text-[11px] font-mono text-zinc-500 uppercase">
                Ver todos
              </button>
            </div>
          </div>
        </section>

        {/* GRID DE PROPIEDADES - MÁS DESAHOGADO (3 Columnas) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p) => (
            <div key={p.id} className="group bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-900 hover:border-[#CCFF00]/30 transition-all duration-500">
              {/* Contenedor Imagen con Aspect Ratio Premium */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/60 backdrop-blur-md text-[#CCFF00] text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                    {p.tag}
                  </span>
                </div>
                <div className="absolute top-4 right-4 text-[9px] font-mono font-bold px-2 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800">
                  {p.status}
                </div>
              </div>

              {/* Información Desahogada */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-zinc-500 mt-1">
                    <span className="text-[10px] font-mono">📍 {p.location}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-zinc-900">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase">Precio Inversión</p>
                    <p className="text-xl font-black text-[#CCFF00] tracking-tighter mt-0.5">{p.price}</p>
                  </div>
                  <button className="p-3 bg-zinc-900 hover:bg-white hover:text-black rounded-xl transition-all">
                    <span className="text-xs">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}