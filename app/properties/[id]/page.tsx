'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function PropertyDetail() {
  const { id } = useParams()
  const [sent, setSent] = useState(false)

  const propertyData = {
    "1": { name: 'Penthouse Bella Vista', loc: 'Piantini, SD', price: '$1.2M', area: '450m²', rooms: 4, baths: 5, tags: ['Cine Privado', 'Piscina Infinity'], color: 'from-gold-500' },
    "2": { name: 'Villa Mar Azul', loc: 'Punta Cana', price: '$3.5M', area: '1,200m²', rooms: 6, baths: 7, tags: ['Acceso a Playa', 'Chef Privado'], color: 'from-blue-500' },
    "3": { name: 'Mansión Los Lagos', loc: 'Casa de Campo', price: '$5.2M', area: '2,500m²', rooms: 8, baths: 10, tags: ['Heliopuerto', 'Cava de Vinos'], color: 'from-purple-500' },
    "4": { name: 'Sky Loft Central', loc: 'Naco, SD', price: '$750k', area: '280m²', rooms: 2, baths: 3, tags: ['Domótica', 'Terraza 360'], color: 'from-gray-500' },
  }

  const prop = propertyData[id as keyof typeof propertyData] || propertyData["1"]

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Barra de Navegación Fina */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/properties" className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-[#d4af37] transition-all">
          ← Volver al catálogo
        </Link>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#d4af37]">Homvi Signature</div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Columna Izquierda: Contenido */}
        <div className="lg:col-span-2">
          {/* Badge de Categoría */}
          <div className="inline-block px-4 py-1 border border-[#d4af37]/30 bg-[#d4af37]/10 rounded-full text-[9px] uppercase tracking-widest text-[#d4af37] mb-6">
            Propiedad Exclusiva
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light italic text-white mb-6 leading-tight">
            {prop.name.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-[#d4af37] not-italic font-bold block">{word}</span> : word + ' ')}
          </h1>

          {/* Galería Simulada */}
          <div className="grid grid-cols-2 gap-4 my-12">
            <div className="h-[400px] bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] border border-white/5 flex items-center justify-center text-gray-700 uppercase tracking-tighter text-4xl font-bold italic">Vista Principal</div>
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-center text-xs text-gray-600 uppercase tracking-widest italic">Interior</div>
              <div className="bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-center text-xs text-gray-600 uppercase tracking-widest italic">Detalles</div>
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-3 gap-8 border-y border-white/5 py-10 my-10">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Metraje</p>
              <p className="text-xl font-mono">{prop.area}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Habitaciones</p>
              <p className="text-xl font-mono">{prop.rooms}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Ubicación</p>
              <p className="text-xl font-mono">{prop.loc.split(',')[0]}</p>
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed text-lg italic">
            Una pieza maestra de la arquitectura contemporánea situada en el corazón de {prop.loc}. 
            Diseñada para quienes exigen lo extraordinario, esta propiedad redefine el concepto de elegancia y privacidad.
          </p>
        </div>

        {/* Columna Derecha: Tarjeta de Contacto Fija */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem]">
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Precio de Inversión</p>
              <h2 className="text-4xl font-bold text-[#d4af37] font-mono">{prop.price}</h2>
            </div>

            {!sent ? (
              <div className="space-y-4">
                <input type="text" placeholder="Tu Nombre" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37] transition-all text-sm" />
                <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37] transition-all text-sm" />
                <button 
                  onClick={() => setSent(true)}
                  className="w-full bg-[#d4af37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-white transition-all"
                >
                  Solicitar Dossier
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#d4af37] font-bold text-sm uppercase tracking-widest">Solicitud Enviada</p>
                <p className="text-gray-500 text-[10px] mt-2">Un agente Homvi le contactará en breve.</p>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center text-black font-bold">LB</div>
                <div>
                  <p className="text-xs font-bold">Luis Betances</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Socio Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
