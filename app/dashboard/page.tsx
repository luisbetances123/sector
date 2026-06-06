'use client';

import { useState } from 'react';
import { GoogleMapsEmbed } from '@next/third-parties/google';

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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // SECTORES DE TU CAPTURA DE PANTALLA
  const sectors = [
    'LA ESPERILLA', 'EL MILLON', 'MIRADOR NORTE', 'MIRADOR SUR', 'PARAISO', 'LA CASTELLANA', 
    'JARDINES DEL NORTE', 'LOS PRADOS', 'GAZCUE', 'ENSANCHE QUISQUEYA', 'LOS RESTAURADORES', 
    'ZONA COLONIAL', 'ARROYO MANZANO', 'COLINAS DE LOS RIOS', 'FERNANDEZ', 'RENACIMIENTO'
  ];

  // TUS PROPIEDADES REALES (RECONSTRUIDAS DE TU CAPTURA)
  const propertiesData: Property[] = [
    {
      id: '1',
      title: 'Apartamento Moderno de Lujo',
      type: 'APARTAMENTO',
      sector: 'Ensanche Naco',
      address: 'Calle Rafael Augusto Sánchez No. 28, Ensanche Naco',
      price: 'US$215,000',
      beds: 2,
      baths: 2.5,
      parking: 2,
      size: '135 m²',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop',
      confotur: false,
    },
    {
      id: '2',
      title: 'Penthouse de Lujo Moderno',
      type: 'APARTAMENTO',
      sector: 'Naco',
      address: 'Calle Max Henríquez Ureña, casi esquina Winston Churchill',
      price: 'US$450,000',
      beds: 3,
      baths: 3,
      parking: 2,
      size: '240 m²',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop',
      confotur: true,
    },
    {
      id: '3',
      title: 'Prueba',
      type: 'CASA',
      sector: 'Piantini',
      address: 'Test Location - Piantini',
      price: 'US$100,000',
      beds: 4,
      baths: 4,
      parking: 3,
      size: '350 m²',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop',
      confotur: false,
    },
    {
      id: '4',
      title: 'Apartamento en Naco',
      type: 'APARTAMENTO',
      sector: 'Naco',
      address: 'Calle Núñez de Cáceres, Naco',
      price: 'US$185,000',
      beds: 2,
      baths: 2,
      parking: 1,
      size: '120 m²',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop',
      confotur: false,
    },
    {
      id: '5',
      title: 'Penthouse en Piantini',
      type: 'APARTAMENTO',
      sector: 'Piantini',
      address: 'Piantini, Santo Domingo',
      price: 'US$350,000',
      beds: 3,
      baths: 3,
      parking: 2,
      size: '280 m²',
      image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&auto=format&fit=crop',
      confotur: true,
    },
    {
      id: '6',
      title: 'Casa en Arroyo Hondo',
      type: 'CASA',
      sector: 'Arroyo Hondo',
      address: 'Calle Euclides Morillo, Arroyo Hondo',
      price: 'US$420,000',
      beds: 4,
      baths: 4,
      parking: 3,
      size: '450 m²',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop',
      confotur: false,
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      
      {/* BOTONES DE SECTORES (Estilo idéntico a tu captura original) */}
      <div className="mb-8 flex flex-wrap gap-2 max-w-5xl">
        {sectors.map((sector) => (
          <button 
            key={sector} 
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md text-xs font-mono transition-colors border border-zinc-800"
          >
            {sector}
          </button>
        ))}
      </div>

      {/* CUADRÍCULA DE PROPIEDADES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertiesData.map((property) => (
          <div 
            key={property.id}
            onClick={() => setSelectedProperty(property)}
            className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden cursor-pointer hover:border-[#CCFF00] transition-all group shadow-lg"
          >
            {/* Imagen con etiqueta Disponible */}
            <div className="relative h-56 w-full bg-zinc-950">
              <span className="absolute top-3 left-3 bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded border border-[#10b981]/20 uppercase tracking-wider z-10">
                • Disponible
              </span>
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>

            {/* Datos de la propiedad */}
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-base line-clamp-1 group-hover:text-[#CCFF00] transition-colors">
                  {property.title}
                </h3>
                <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono shrink-0 uppercase">
                  {property.type}
                </span>
              </div>
              
              <p className="text-xs text-zinc-400 font-medium line-clamp-1">
                📍 {property.address}
              </p>

              {/* Características */}
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                <span>🛏️ {property.beds}</span>
                <span>🚿 {property.baths}</span>
                <span>🚗 {property.parking}</span>
                <span>📐 {property.size}</span>
              </div>

              <div className="text-lg font-bold text-[#CCFF00] pt-1">
                {property.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* MODAL DETALLE / INTERFAZ TÁCTIL PARA MÓVIL                */}
      {/* ========================================================= */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          <div className="bg-zinc-950 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-800 p-6 max-h-[92vh] overflow-y-auto flex flex-col gap-5 shadow-2xl">
            
            {/* Cabecera */}
            <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
              <div>
                <span className="text-[9px] text-[#CCFF00] font-mono tracking-wider uppercase border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-2 py-0.5 rounded">
                  {selectedProperty.type}
                </span>
                <h2 className="text-xl font-bold mt-2">{selectedProperty.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedProperty(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white h-8 w-8 rounded-full flex items-center justify-center transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Características */}
            <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 font-mono">
              <div><span className="block font-bold text-sm text-white">{selectedProperty.beds}</span> Hab</div>
              <div><span className="block font-bold text-sm text-white">{selectedProperty.baths}</span> Baños</div>
              <div><span className="block font-bold text-sm text-white">{selectedProperty.parking}</span> Parq</div>
              <div><span className="block font-bold text-sm text-white">{selectedProperty.size}</span> Área</div>
            </div>

            {/* Ubicación y CONFOTUR */}
            <div className="text-xs space-y-2 text-zinc-400 bg-zinc-900/20 p-3 rounded-xl border border-zinc-900/50">
              <p><strong className="text-white">Dirección:</strong> {selectedProperty.address}</p>
              <p><strong className="text-white">Precio de Venta:</strong> <span className="text-[#CCFF00] font-bold text-sm">{selectedProperty.price}</span></p>
              {selectedProperty.confotur && (
                <div className="mt-2 text-[10px] bg-[#CCFF00]/10 text-[#CCFF00] px-2.5 py-1 rounded border border-[#CCFF00]/20 inline-block font-sans font-medium">
                  ✓ Exención fiscal CONFOTUR Available
                </div>
              )}
            </div>

            {/* --- MAPA DE GOOGLE EMBED --- */}
            <div className="w-full h-[240px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
              <div className="absolute top-2.5 left-2.5 z-10 bg-black/80 backdrop-blur-sm text-[9px] text-[#CCFF00] font-mono px-2.5 py-1 rounded-full border border-zinc-800">
                📍 {selectedProperty.sector}
              </div>

              <GoogleMapsEmbed
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''}
                height="100%"
                width="100%"
                mode="place"
                q={`${selectedProperty.address}, Santo Domingo, Republica Dominicana`}
                allowFullScreen={false}
                style="border:0; filter: invert(90%) hue-rotate(180deg) saturate(150%);"
              />
            </div>

            {/* Botón de ruta en tiempo real para Waze / Google Maps nativo */}
            <button 
              onClick={() => {
                const targetUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address + ', Santo Domingo, RD')}`;
                window.open(targetUrl, '_blank');
              }}
              className="w-full bg-[#CCFF00] hover:bg-[#b3df00] text-black font-bold py-3 rounded-xl transition-colors text-xs tracking-wide uppercase font-mono shadow-md shadow-[#CCFF00]/10"
            >
              Iniciar Navegación GPS
            </button>

          </div>
        </div>
      )}

    </div>
  );
}