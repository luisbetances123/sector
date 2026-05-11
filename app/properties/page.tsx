'use client'
import React, { useState } from 'react'
import Link from 'next/link'

export default function PropertiesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')

  const allProperties = [
    { 
      id: 1, 
      name: 'Penthouse Bella Vista', 
      loc: 'Piantini, SD', 
      price: '$1.2M', 
      area: '450m²', 
      type: 'Penthouse',
      image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 2, 
      name: 'Villa Mar Azul', 
      loc: 'Punta Cana', 
      price: '$3.5M', 
      area: '1,200m²', 
      type: 'Villa',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 3, 
      name: 'Mansión Los Lagos', 
      loc: 'Casa de Campo', 
      price: '$5.2M', 
      area: '2,500m²', 
      type: 'Villa',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 4, 
      name: 'Sky Loft Central', 
      loc: 'Naco, SD', 
      price: '$750k', 
      area: '280m²', 
      type: 'Apartamento',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 5, 
      name: 'Residencia Tropical', 
      loc: 'Santiago, RD', 
      price: '$1.8M', 
      area: '800m²', 
      type: 'Villa',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    },
    { 
      id: 6, 
      name: 'Apartamento Serenity', 
      loc: 'Evaristo Morales, SD', 
      price: '$420k', 
      area: '180m²', 
      type: 'Apartamento',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'
    },
  ]

  const filteredProperties = allProperties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(search.toLowerCase()) || 
                          prop.loc.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Todos' || prop.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-light italic">Catálogo <span className="text-[#d4af37] not-italic font-bold">Homvi</span></h1>
        <Link href="/dashboard" className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-all">
          ← Dashboard
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input 
          type="text"
          placeholder="Buscar propiedad o ubicación..."
          className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex-1 outline-none focus:border-[#d4af37] transition-all"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['Todos', 'Villa', 'Penthouse', 'Apartamento'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs uppercase font-bold border transition-all ${
                filter === cat ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(prop => (
          <div key={prop.id} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[2.5rem] hover:border-[#d4af37]/30 transition-all group flex flex-col">
            <div className="h-64 w-full mb-6 overflow-hidden rounded-[2rem] relative">
              <img 
                src={prop.image} 
                alt={prop.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {prop.type}
              </div>
            </div>

            <div className="px-2 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold uppercase tracking-tighter text-sm">{prop.name}</h3>
                <span className="text-[#d4af37] font-mono text-sm">{prop.price}</span>
              </div>
              <p className="text-gray-500 text-xs italic mb-6">{prop.loc} • {prop.area}</p>
              <Link href={`/properties/${prop.id}`} className="mt-auto">
                <button className="w-full py-4 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#d4af37] hover:text-black transition-all">
                  Ver Detalles
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
