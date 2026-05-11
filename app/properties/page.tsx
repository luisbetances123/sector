'use client'
import React, { useState } from 'react'

export default function PropertiesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')

  const allProperties = [
    { id: 1, name: 'Penthouse Bella Vista', loc: 'Piantini, SD', price: '$1.2M', status: 'Disponible', area: '450m²', type: 'Penthouse' },
    { id: 2, name: 'Villa Mar Azul', loc: 'Punta Cana', price: '$3.5M', status: 'En Oferta', area: '1,200m²', type: 'Villa' },
    { id: 3, name: 'Mansión Los Lagos', loc: 'Casa de Campo', price: '$5.2M', status: 'Vendido', area: '2,500m²', type: 'Villa' },
    { id: 4, name: 'Sky Loft Central', loc: 'Naco, SD', price: '$750k', status: 'Disponible', area: '280m²', type: 'Apartamento' },
  ]

  const filteredProperties = allProperties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(search.toLowerCase()) || 
                          prop.loc.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Todos' || prop.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <header className="mb-10">
        <h1 className="text-3xl font-light italic">Catálogo <span className="text-[#d4af37] not-italic font-bold">Homvi</span></h1>
      </header>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input 
          type="text"
          placeholder="Buscar..."
          className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex-1 outline-none focus:border-[#d4af37] transition-all"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['Todos', 'Villa', 'Penthouse'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold border transition-all ${
                filter === cat ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'border-white/10 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rejilla */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(prop => (
          <div key={prop.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] hover:border-[#d4af37]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold uppercase tracking-tighter">{prop.name}</h3>
              <span className="text-[#d4af37] font-mono">{prop.price}</span>
            </div>
            <p className="text-gray-500 text-xs italic mb-4">{prop.loc}</p>
            <div className="text-[9px] uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/10 w-fit px-3 py-1 rounded-full border border-[#d4af37]/20">
              {prop.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
