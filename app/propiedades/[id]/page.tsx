'use client'
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase"

export default function PropiedadDetalle() {
  const { id } = useParams()
  const router = useRouter()
  const [propiedad, setPropiedad] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "", mensaje: "" })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (id) cargar()
  }, [id])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from("properties").select("*").eq("id", id).eq("public", true).single()
    setPropiedad(data)
    setLoading(false)
  }

  async function enviarConsulta() {
    setEnviando(true)
    try {
      await supabase.from("contactos_whatsapp").insert({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        mensaje: formData.mensaje,
        propiedad_id: id,
      })
      setEnviado(true)
      setTimeout(() => { setEnviado(false); setFormData({ nombre: "", email: "", telefono: "", mensaje: "" }) }, 3000)
    } catch (e) { console.error(e) }
    setEnviando(false)
  }

  const formatPrecio = (p: any) => p ? new Intl.NumberFormat("es-DO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p) : "Precio a consultar"

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const mapUrl = propiedad?.location
    ? `https://www.google.com/maps/embed/v1/search?key=${googleKey}&q=${encodeURIComponent(propiedad.location + ', Santo Domingo, República Dominicana')}&zoom=15`
    : null

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <p className="text-zinc-500 font-mono animate-pulse">Cargando propiedad...</p>
    </div>
  )

  if (!propiedad) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center flex-col gap-4">
      <p className="text-zinc-500">Propiedad no encontrada.</p>
      <button onClick={() => router.push("/listings")} className="bg-[#CCFF00] text-black px-4 py-2 rounded-xl text-sm font-black">
        Ver todas las propiedades
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* HEADER */}
      <div className="border-b border-zinc-900 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black tracking-tighter">SEC<span className="text-[#CCFF00]">TOR</span></h1>
          <p className="text-xs text-zinc-500 font-mono">Portal de Propiedades</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/listings")} className="text-zinc-400 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-medium hover:text-white transition-colors">
            ← Volver
          </button>
          <a href="/login" className="bg-[#CCFF00] text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-[#b8e600] transition-colors">
            Acceder al CRM
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* IMAGEN */}
        <div className="rounded-2xl overflow-hidden h-96 bg-zinc-950 border border-zinc-800">
          {propiedad.image_url ? (
            <img src={propiedad.image_url} alt={propiedad.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono">Sin imagen</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* INFO */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{propiedad.location}</p>
              <h2 className="text-3xl font-extrabold tracking-tighter text-white mt-1">{propiedad.title}</h2>
              <p className="text-[#CCFF00] font-black text-2xl font-mono mt-2">{formatPrecio(propiedad.price)}</p>
            </div>

            {/* SPECS */}
            <div className="grid grid-cols-3 gap-4">
              {propiedad.bedrooms && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-white font-mono">{propiedad.bedrooms}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Recámaras</p>
                </div>
              )}
              {propiedad.bathrooms && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-white font-mono">{propiedad.bathrooms}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Baños</p>
                </div>
              )}
              {propiedad.m2 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-white font-mono">{propiedad.m2}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">m²</p>
                </div>
              )}
            </div>

            {/* DESCRIPCION */}
            {propiedad.descripcion && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Descripción</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">{propiedad.descripcion}</p>
              </div>
            )}

            {/* MAPA */}
            {mapUrl && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800">
                  <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Ubicación</h3>
                  <p className="text-zinc-300 text-sm mt-0.5">{propiedad.location}, Santo Domingo, RD</p>
                </div>
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* CONTACTO */}
          <div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sticky top-6 space-y-4">
              <div>
                <h3 className="font-black text-white">¿Te interesa?</h3>
                <p className="text-zinc-500 text-xs mt-1">Un agente te contactará pronto.</p>
              </div>
              {enviado ? (
                <div className="text-center py-6 text-[#CCFF00] font-black text-sm">✅ Consulta enviada</div>
              ) : (
                <div className="space-y-3">
                  <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Tu nombre *"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none placeholder-zinc-600" />
                  <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="Tu email *" type="email"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none placeholder-zinc-600" />
                  <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})}
                    placeholder="Tu teléfono"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none placeholder-zinc-600" />
                  <textarea value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})}
                    placeholder="Mensaje (opcional)" rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] text-white text-xs rounded-xl px-4 py-3 outline-none placeholder-zinc-600 resize-none" />
                  <button onClick={enviarConsulta} disabled={enviando || !formData.nombre || !formData.email}
                    className="w-full bg-[#CCFF00] text-black font-black text-xs rounded-xl py-3 hover:bg-[#b8e600] transition-colors disabled:opacity-50">
                    {enviando ? "Enviando..." : "Enviar consulta"}
                  </button>
                  <a href={`https://wa.me/19293056500?text=${encodeURIComponent('Hola, me interesa: ' + propiedad.title)}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl py-3 hover:border-[#CCFF00] hover:text-white transition-colors font-bold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Consultar por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
