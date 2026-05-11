'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PropertyDetail() {
  const { id } = useParams()

  const propertyData = {
    "1": { name: 'Penthouse Bella Vista', loc: 'Piantini, SD', price: '$1.2M', area: '450m²', features: ['Cine', 'Piscina'] },
    "2": { name: 'Villa Mar Azul', loc: 'Punta Cana', price: '$3.5M', area: '1,200m²', features: ['Playa', 'Chef'] },
    "3": { name: 'Mansión Los Lagos', loc: 'Casa de Campo', price: '$5.2M', area: '2,500m²', features: ['Spa', 'Heliopuerto'] },
  }

  const prop = propertyData[id as keyof typeof propertyData] || propertyData["1"]

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16">
      <Link href="/properties" className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-[#d4af37] mb-12 block">
        ← Volver al catálogo
      </Link>
      <h1 className="text-6xl font-light italic text-[#d4af37] mb-4">{prop.name}</h1>
      <p className="text-gray-400 text-lg mb-8">{prop.loc} | {prop.area}</p>
      <div className="text-4xl font-bold mb-8 text-white">{prop.price}</div>
      <div className="flex gap-4">
        <button className="bg-[#d4af37] text-black px-12 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Agendar Visita</button>
      </div>
    </div>
  )
}
