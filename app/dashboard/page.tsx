'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ... (MANTÉN TUS CONSTANTES DE SECTORES AQUÍ ARRIBA IGUAL QUE ANTES) ...
const SECTORES = ['Piantini', 'Naco', 'Bella Vista', 'Evaristo Morales', 'Serralles', 'Los Cacicazgos', 'Arroyo Hondo', 'Viejo Arroyo Hondo', 'La Esperilla', 'El Millon', 'Mirador Norte', 'Mirador Sur', 'Paraíso', 'La Castellana', 'Jardines del Norte', 'Los Prados', 'Gazcue', 'Ensanche Quisqueya', 'Los Restauradores', 'Zona Colonial', 'Arroyo Manzano', 'Colinas de los Ríos', 'Fernández', 'Renacimiento']
const SECTORES_SDE = ['Alma Rosa I', 'Alma Rosa II', 'Ensanche Ozama', 'San Isidro', 'Ensanche Isabelita', 'Prado Oriental', 'Los Tres Ojos', 'Corales del Sur', 'Mirador del Este', 'Riviera del Caribe', 'Cerros del Ozama', 'Las Américas']
const SECTORES_SDN = ['Palmarejo', 'Don Honorio', 'El Condado', 'Los Girasoles', 'Villa Mella', 'Ciudad Real', 'La Isabela', 'Brisas del Norte', 'Los Alcarrizos', 'San Felipe', 'Colinas del Norte', 'Reparto Universitario']
const SECTORES_SDO = ['Manoguayabo', 'Mirador del Oeste', 'Villa Aura', 'Herrera', 'Los Alcarrizos', 'Alameda', 'Engombe', 'Los Hidalgos', 'Pantoja', 'Las Caobas', 'Avenida Monumental', 'Palmarejo']

// ... (MANTÉN TU FUNCIÓN calcularMatch AQUÍ) ...
function calcularMatch(cliente: any, propiedad: any): number {
  let score = 0
  if (cliente.zonas_interes?.length > 0 && propiedad.sector) {
    const zonaMatch = cliente.zonas_interes.some((z: string) => propiedad.sector?.toLowerCase().includes(z.toLowerCase()) || z.toLowerCase().includes(propiedad.sector?.toLowerCase() || ''))
    if (zonaMatch) score += 40
  }
  if (cliente.tipo_propiedad?.length > 0 && propiedad.type) {
    const tipoMatch = cliente.tipo_propiedad.some((t: string) => propiedad.type?.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(propiedad.type?.toLowerCase() || ''))
    if (tipoMatch) score += 30
  }
  const min = parseFloat(cliente.budget_min || cliente.presupuesto_min || '0')
  const max = parseFloat(cliente.budget_max || cliente.presupuesto_max || '0')
  const clienteCurrency = cliente.currency || 'USD'
  if (max > 0 && propiedad.price) {
    let precioPropiedad = parseFloat(propiedad.price.toString().replace(/[^0-9.]/g, ''))
    const propiedadCurrency = propiedad.currency || 'USD'
    if (!isNaN(precioPropiedad) && !isNaN(min) && !isNaN(max)) {
      if (clienteCurrency === 'USD' && propiedadCurrency === 'DOP') precioPropiedad = precioPropiedad / 60
      else if (clienteCurrency === 'DOP' && propiedadCurrency === 'USD') precioPropiedad = precioPropiedad * 60
      if (precioPropiedad >= min && precioPropiedad <= max) score += 30
      else if (precioPropiedad <= max * 1.2) score += 15
    }
  }
  return score
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [contactos, setContactos] = useState<any[]>([])

  const limpiarTelefonoWa = (tel: string) => {
    let limpio = tel.replace(/\D/g, '')
    if (limpio.length === 10 && (limpio.startsWith('809') || limpio.startsWith('829') || limpio.startsWith('849'))) limpio = '1' + limpio
    return limpio
  }

  useEffect(() => {
    async function fetchAll() {
      const [c, p, f, ct] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('properties').select('*').eq('estado', 'disponible'),
        supabase.from('followups').select('*'),
        supabase.from('contactos_whatsapp').select('*').order('fecha', { ascending: false }),
      ])
      if (c.data) setClientes(c.data)
      if (p.data) setProperties(p.data)
      if (f.data) setFollowups(f.data)
      if (ct.data) setContactos(ct.data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-black"><p className="text-amber-500 font-black text-2xl animate-pulse">HOMVI</p></div>

  const hoyStr = new Date().toISOString().split('T')[0]
  const followupsHoy = followups.filter(f => f.fecha === hoyStr && !f.hecho)
  const leads = clientes.filter(c => c.status === 'LEAD')
  const clientesActivos = clientes.filter(c => c.status === 'BUSCANDO' || c.status === 'EN OFERTA')

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 pb-40 w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-white">Hola, <span className="text-amber-500 italic">Luis</span> 👋</h1>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {[ { label: 'Clientes', val: clientes.length }, { label: 'Leads', val: leads.length }, { label: 'Propied.', val: properties.length }, { label: 'Seguim.', val: followups.filter(f => !f.hecho).length } ].map(s => (
                <div key={s.label} className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-3">
                    <p className="text-zinc-500 text-[9px] uppercase">{s.label}</p>
                    <p className="text-2xl font-black text-white">{s.val}</p>
                </div>
            ))}
        </div>

        {/* SECCIONES: Aquí es donde antes fallaba porque faltaba el contenido */}
        <section className="space-y-4">
           {/* Ejemplo de sección Leads */}
           <div className="bg-zinc-800/40 border border-zinc-700 p-6 rounded-3xl">
              <h2 className="text-white font-bold mb-4">Leads pendientes ({leads.length})</h2>
              {leads.slice(0, 3).map(c => (
                <div key={c.id} className="text-white text-sm mb-2">{c.name}</div>
              ))}
           </div>
           
           {/* Agrega aquí tus otras secciones: Sectores, Agenda, Pipeline, etc. */}
        </section>

      </div>
    </div>
  )
}