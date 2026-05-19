'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Property = {
  id: string
  title: string
  price: string
  location: string
  type: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase.from('properties').select('*')
      if (!error && data) setProperties(data)
      setLoading(false)
    }
    fetchProperties()
  }, [])

  if (loading) return <div className="p-8 text-zinc-500">Cargando propiedades...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black italic text-amber-500 tracking-tighter uppercase">PROPIEDADES</h1>
        <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{properties.length} UNIDADES EN TOTAL</p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          No hay propiedades registradas aún en Supabase.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-all">
              <h3 className="text-white font-bold text-lg mb-1">{p.title}</h3>
              <p className="text-zinc-400 text-xs mb-3">{p.location}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
                <span className="text-amber-500 font-black text-lg">{p.price}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-wider bg-zinc-800 px-2 py-1 rounded">{p.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}