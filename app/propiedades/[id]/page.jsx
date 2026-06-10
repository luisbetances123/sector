'use client'
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/app/lib/supabase"

export default function PropiedadDetalle() {
  const { id } = useParams()
  const router = useRouter()
  const [propiedad, setPropiedad] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contacto, setContacto] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "", mensaje: "" })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (id) cargar()
  }, [id])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .eq("public", true)
      .single()
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
      setTimeout(() => { setContacto(null); setEnviado(false); setFormData({ nombre: "", email: "", telefono: "", mensaje: "" }) }, 2000)
    } catch (e) { console.error(e) }
    setEnviando(false)
  }

  const formatPrecio = (p) => p ? new Intl.NumberFormat("es-DO", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p) : "Precio a consultar"

  if (loading) return (
    <div style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#64748b" }}>Cargando propiedad...</p>
    </div>
  )

  if (!propiedad) return (
    <div style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <p style={{ color: "#64748b" }}>Propiedad no encontrada.</p>
      <button onClick={() => router.push("/propiedades")} style={{ background: "#3b82f6", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Ver todas las propiedades</button>
    </div>
  )

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>SECTOR</h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>Portal de Propiedades</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => router.push("/propiedades")} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #334155", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem" }}>← Volver</button>
          <a href="/login" style={{ background: "#3b82f6", color: "#fff", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "0.875rem", fontWeight: "600" }}>Acceder al CRM</a>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Imagen principal */}
        <div style={{ background: "#e2e8f0", borderRadius: "16px", overflow: "hidden", marginBottom: "32px", height: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {propiedad.imagen ? (
            <img src={propiedad.imagen} alt={propiedad.nombre || propiedad.ubicacion} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "4rem" }}>🏠</div>
              <p>Sin imagen disponible</p>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
          {/* Info principal */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>{propiedad.type || propiedad.tipo || "Propiedad"}</span>
              {propiedad.estado && <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>{propiedad.estado}</span>}
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>{propiedad.title || propiedad.nombre || propiedad.ubicacion || "Propiedad"}</h2>
            <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "24px" }}>📍 {propiedad.location || propiedad.ubicacion}</p>
            <p style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", marginBottom: "32px" }}>{formatPrecio(propiedad.price || propiedad.precio)}</p>

            {/* Características */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
              {(propiedad.bedrooms || propiedad.recamaras) && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>🛏️</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>{propiedad.bedrooms || propiedad.recamaras}</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Recámaras</div>
                </div>
              )}
              {(propiedad.bathrooms || propiedad.banos) && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>🚿</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>{propiedad.bathrooms || propiedad.banos}</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Baños</div>
                </div>
              )}
              {(propiedad.area) && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem" }}>📐</div>
                  <div style={{ fontWeight: "700", fontSize: "1.25rem" }}>{propiedad.area}</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem" }}>m²</div>
                </div>
              )}
            </div>

            {/* Descripción */}
            {(propiedad.description || propiedad.descripcion || propiedad.notas) && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
                <h3 style={{ fontWeight: "700", marginBottom: "12px", color: "#0f172a" }}>Descripción</h3>
                <p style={{ color: "#475569", lineHeight: "1.7" }}>{propiedad.description || propiedad.descripcion || propiedad.notas}</p>
              </div>
            )}
          </div>

          {/* Panel de contacto */}
          <div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", position: "sticky", top: "24px" }}>
              <h3 style={{ fontWeight: "700", marginBottom: "4px", color: "#0f172a" }}>¿Te interesa esta propiedad?</h3>
              <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "20px" }}>Déjanos tus datos y un agente te contactará</p>
              {enviado ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#22c55e", fontWeight: "600" }}>✅ Consulta enviada exitosamente</div>
              ) : (
                <>
                  <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Tu nombre *" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "12px", boxSizing: "border-box" }} />
                  <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Tu email *" type="email" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "12px", boxSizing: "border-box" }} />
                  <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="Tu teléfono" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "12px", boxSizing: "border-box" }} />
                  <textarea value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})} placeholder="Mensaje (opcional)" rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "16px", resize: "none", boxSizing: "border-box" }} />
                  <button onClick={enviarConsulta} disabled={enviando} style={{ width: "100%", padding: "12px", background: enviando ? "#94a3b8" : "#3b82f6", color: "#fff", borderRadius: "8px", border: "none", fontWeight: "600", cursor: enviando ? "default" : "pointer" }}>
                    {enviando ? "Enviando..." : "Enviar consulta"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
