'use client'
import { useState } from 'react'

export default function PropertiesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')

  const allProperties = [
    { id: 1, name: 'Penthouse Bella Vista', loc: 'Piantini, SD', price: '$1.2M', status: 'Disponible', area: '450m²', type: 'Penthouse' },
    { id: 2, name: 'Villa Mar Azul', loc: 'Punta Cana', price: '$3.5M', status: 'En Oferta', area: '1,200m²', type: 'Villa' },
    { id: 3, name: 'Mansión Los Lagos', loc: 'Casa de Campo', price: '$5.2M', status: 'Vendido', area: '2,500m²', type: 'Villa' },
    { id: 4, name: 'Sky Loft Central', loc: 'Naco, SD', price: '$750k', status: 'Disponible', area: '280m²', type: 'Apartamento' },
  ]

  // Lógica de filtrado en tiempo real
  const filteredProperties = allProperties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(search.toLowerCase()) || 
                          prop.loc.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Todos' || prop.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-light tracking-tight italic">
          Catálogo <span className="not-italic text-[#d4af37]">Exclusivo</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2 italic font-light">
          Gestiona y filtra tus activos inmobiliarios de alta gama.
        </p>
      </header>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
        <div className="relative w-full md:w-1/2">
          <input 
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            className="w-full bg-[#0a0a0a] border border-white/10 py-4 px-6 rounded-2xl text-sm focus:border-[#d4af37] outline-none transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute right-6 top-4 text-gray-600 italic text-xs">BUSCAR</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {['Todos', 'Villa', 'Penthouse', 'Apartamento'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                filter === cat 
                ? 'bg-[#d4af37] text-black border-[#d4af37]' 
                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((prop) => (
            <div key={prop.id} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-[#d4af37]/30 transition-all">
              <div className="h-48 bg-neutral-900 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest">{prop.type}</span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold group-hover:text-[#d4af37] transition-colors uppercase">{prop.name}</h3>
                  <span className="text-[#d4af37] font-bold">{prop.price}</span>
                </div>
                <p className="text-gray-500 text-xs italic mb-6">{prop.loc} • {prop.area}</p>
                <button className="w-full py-4 rounded-2xl border border-white/5 bg-white/5 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black transition-all">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[2.5rem]">
            <p className="text-gray-500 italic">No se encontraron propiedades que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
}
