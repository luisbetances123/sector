'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function PropertyDetail() {
  const { id } = useParams()
  const [sent, setSent] = useState(false)

  // Datos con las mismas fotos del catálogo
  const propertyData = {
    { 
  id: 1, 
  name: 'Penthouse Bella Vista', 
  loc: 'Piantini, SD', 
  price: '$1.2M', 
  area: '450m²', 
  type: 'Penthouse',
  image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&auto=format&fit=crop'
},
    },
    "2": { 
      name: 'Villa Mar Azul', 
      loc: 'Punta Cana', 
      price: '$3.5M', 
      area: '1,200m²', 
      rooms: 6, 
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800' 
    },
    "3": { 
      name: 'Mansión Los Lagos', 
      loc: 'Casa de Campo', 
      price: '$5.2M', 
      area: '2,500m²', 
      rooms: 8, 
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' 
    },
    "4": { 
      name: 'Sky Loft Central', 
      loc: 'Naco, SD', 
      price: '$750k', 
      area: '280m²', 
      rooms: 2, 
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800' 
    },
  }

  const prop = propertyData[id as keyof typeof propertyData] || propertyData["1"]

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="p-6 flex justify-between items-center border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/properties" className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-[#d4af37] transition-all">
          ← Volver al catálogo
        </Link>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#d4af37]">Homvi Signature</div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="inline-block px-4 py-1 border border-[#d4af37]/30 bg-[#d4af37]/10 rounded-full text-[9px] uppercase tracking-widest text-[#d4af37] mb-6">
            Propiedad Exclusiva
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light italic mb-8">
            {prop.name}
          </h1>

          {/* FOTO REAL CARGADA DINÁMICAMENTE */}
          <div className="w-full h-[500px] mb-12 overflow-hidden rounded-[3rem] border border-white/10">
            <img 
              src={prop.image} 
              className="w-full h-full object-cover" 
              alt={prop.name}
            />
          </div>

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
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem]">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Precio de Inversión</p>
            <h2 className="text-4xl font-bold text-[#d4af37] font-mono mb-8">{prop.price}</h2>

            {!sent ? (
              <div className="space-y-4">
                <input type="text" placeholder="Tu Nombre" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-[#d4af37] text-sm" />
                <button onClick={() => setSent(true)} className="w-full bg-[#d4af37] text-black py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all">
                  Solicitar Información
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#d4af37] font-bold text-sm uppercase">¡Mensaje Enviado!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
