'use client';

import { useState } from 'react';
import { GoogleMapsEmbed } from '@next/third-parties/google';

// 1. Definimos cómo es la estructura de una propiedad (TypeScript)
interface Property {
  id: string;
  title: string;
  type: string;
  sector: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  parking: number;
  size: string;
  image: string;
  confotur: boolean;
}

export default function PropertiesPage() {
  // 2. Aquí guardamos la propiedad que el agente toque. Al inicio es null (ninguna).
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // 3. Tus datos locales (estos coinciden con los de tu captura de pantalla)
  const propertiesData: Property[] = [
    {
      id: '1',
      title: 'Apartamento Moderno de Lujo',
      type: 'APARTAMENTO',
      sector: 'Ensanche Naco',
      address: 'Calle Rafael Augusto Sánchez No. 28, Ensanche Naco',
      price: 'US$215,000', // Ajustado al formato real
      beds: 2,
      baths: 2.5,
      parking: 2,
      size: '135 m²',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop', // URL de ejemplo segura
      confotur: false,
    },
    {
      id: '2',
      title: 'Penthouse en Piantini',
      type: 'APARTAMENTO',
      sector: 'Piantini',
      address: 'Piantini, Santo Domingo',
      price: 'US$350,000',
      beds: 3,
      baths: 3,
      parking: 2,
      size: '280 m²',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop',
      confotur: true,
    }
    // ... aquí van las demás propiedades de tu lista
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      
      {/* SECCIÓN SUPERIOR: Los botones de Sectores (Los que ya tienes arriba) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {/* Tus botones de: LA ESPERILLA, EL MILLÓN, PIANTINI, etc. */}
      </div>

      {/* SECCIÓN CENTRAL: Tu cuadrícula de tarjetas de propiedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertiesData.map((property) => (
          <div 
            key={property.id}
            onClick={() => setSelectedProperty(property)} // <- AL HACER CLIC, SE SELECCIONA
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-[#CCFF00] transition-all group"
          >
            {/* Contenedor de la Imagen */}
            <div className="relative h-48 w-full bg-zinc-800">
              <span className="absolute top-3 left-3 bg-emerald-950/80 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-md border border-emerald-800 uppercase tracking-wider">
                Disponible
              </span>
              {/* Aquí va tu etiqueta de imagen <img src={property.image} ... /> */}
            </div>

            {/* Datos de la Card (Igual a tu diseño actual) */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-base group-hover:text-[#CCFF00] transition-colors">{property.title}</h3>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">{property.type}</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">📍 {property.address}</p>
              <div className="text-lg font-bold text-[#CCFF00]">{property.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* VISTA DETALLE (MODAL OPTIMIZADO PARA MÓVIL) - OPCON B     */}
      {/* ========================================================= */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          {/* Contenedor del Modal: En móvil sube desde abajo ocupando casi toda la pantalla */}
          <div className="bg-zinc-950 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-800 p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl">
            
            {/* Encabezado y Botón de Cerrar */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] text-[#CCFF00] font-mono tracking-wider uppercase border border-[#CCFF00]/30 px-2 py-0.5 rounded">
                  {selectedProperty.type}
                </span>
                <h2 className="text-xl font-bold mt-2">{selectedProperty.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedProperty(null)} // <- CIERRA EL MODAL
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2.5 rounded-full transition-colors font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Información Rápida de la Propiedad */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
              <div><span className="block font-bold text-base text-white">{selectedProperty.beds}</span> 🛏️ Hab</div>
              <div><span className="block font-bold text-base text-white">{selectedProperty.baths}</span> 🚿 Baños</div>
              <div><span className="block font-bold text-base text-white">{selectedProperty.size}</span> 📐 Área</div>
            </div>

            {/* Dirección e Indicador CONFOTUR */}
            <div className="text-sm space-y-1 text-zinc-400">
              <p><strong className="text-white">Ubicación:</strong> {selectedProperty.address}</p>
              <p><strong className="text-white">Precio:</strong> <span className="text-[#CCFF00] font-semibold">{selectedProperty.price}</span></p>
              {selectedProperty.confotur && (
                <span className="inline-block mt-2 text-[11px] bg-[#CCFF00]/10 text-[#CCFF00] px-2 py-0.5 rounded border border-[#CCFF00]/20 font-medium">
                  ✓ Beneficio CONFOTUR Aplicable
                </span>
              )}
            </div>

            {/* --- EL MAPA DE GOOGLE JUSTO AQUÍ DEBAJO --- */}
            <div className="w-full h-[280px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
              
              <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm text-[10px] text-[#CCFF00] font-mono px-2.5 py-1 rounded-full border border-zinc-800">
                📍 Vista del Sector: {selectedProperty.sector}
              </div>

              <GoogleMapsEmbed
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
                height="100%"
                width="100%"
                mode="place"
                q={`${selectedProperty.address}, Santo Domingo, Republica Dominicana`}
                allowFullScreen={false}
                style="border:0; filter: invert(90%) hue-rotate(180deg) saturate(150%);"
              />
            </div>

            {/* Botón de Acción Rápida para el Agente */}
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address)}`, '_blank')}
              className="w-full bg-[#CCFF00] hover:bg-[#b3df00] text-black font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              Abrir GPS de Navegación
            </button>

          </div>
        </div>
      )}

    </div>
  );
}