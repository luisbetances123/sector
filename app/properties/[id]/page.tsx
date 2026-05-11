'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function PropertyDetail() {
  const { id } = useParams()
  const [sent, setSent] = useState(false)

  const propertyData = {
    "1": { name: 'Penthouse Bella Vista', loc: 'Piantini, SD', price: '$1.2M', area: '450m²', rooms: 4, images: ['https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800'] },
    "2": { name: 'Villa Mar Azul', loc: 'Punta Cana', price: '$3.5M', area: '1,200m²', rooms: 6, images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'] },
    "3": { name: 'Mansión Los Lagos', loc: 'Casa de Campo', price: '$5.2M', area: '2,500m²', rooms: 8, images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80'] },
    "4": { name: 'Sky Loft Central', loc: 'Naco, SD', price: '$750k', area: '280m²', rooms: 2, images: ['https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1571450/pexels-photo-1571450.jpeg?auto=compress&cs=tinysrgb&w=800'] },
  }

  const prop = propertyData[id as keyof typeof propertyData] || propertyData["1"]

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      {/* NAV ADAPTADA */}
      <nav className="p-4 md:p-6 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <Link href="/properties" className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500">
          ← Catálogo
        </Link>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#d4af37]">Homvi</div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-8xl font-light italic mb-4 leading-tight">{prop.name}</h1>
          <p className="text-gray-500 tracking-widest uppercase text-[9px] md:text-xs">{prop.loc} • {prop.area}</p>
        </div>

        {/* GRILLA RESPONSIVA: 1 columna en móvil, 4 en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          {/* Foto Principal: Más pequeña en móvil para que no ocupe toda la pantalla */}
          <div className="md:col-span-2 h-[300px] md:h-[600px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5">
            <img src={prop.images[0]} className="w-full h-full object-cover" alt="Principal" />
          </div>
          
          {/* Fotos Secundarias: Se ocultan en móvil o se ponen debajo */}
          <div className="grid grid-cols-2 md:grid-cols-1 md:col-span-1 gap-4 h-[150px] md:h-[600px]">
             <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5">
                <img src={prop.images[1]} className="w-full h-full object-cover" alt="Interior 1" />
             </div>
             <div className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5">
                <img src={prop.images[2]} className="w-full h-full object-cover" alt="Interior 2" />
             </div>
          </div>

          {/* Tarjeta de Información: Siempre visible y se adapta al ancho */}
          <div className="md:col-span-1 bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white/5 flex flex-col justify-between shadow-2xl">
             <div className="mb-6 md:mb-0">
                <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 mb-2">Precio</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#d4af37] font-mono">{prop.price}</h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-1 gap-4 mb-8 md:mb-0">
                <div className="border-t border-white/10 pt-4">
                   <p className="text-[8px] uppercase text-gray-500 mb-1">Área</p>
                   <p className="text-lg md:text-xl font-mono">{prop.area}</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                   <p className="text-[8px] uppercase text-gray-500 mb-1">Hab.</p>
                   <p className="text-lg md:text-xl font-mono">{prop.rooms}</p>
                </div>
             </div>

             {!sent ? (
               <button onClick={() => setSent(true)} className="w-full bg-white text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-bold uppercase text-[9px] tracking-widest hover:bg-[#d4af37] transition-all">
                 Contactar
               </button>
             ) : (
               <div className="bg-[#d4af37]/10 p-4 rounded-xl text-center">
                 <p className="text-[#d4af37] text-[9px] uppercase font-bold">Enviado</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
