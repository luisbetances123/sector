"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PropiedadesPublicas() {
  const [propiedades, setPropiedades] = useState([]);
  const [filtros, setFiltros] = useState({ tipo: "", zona: "", precioMax: "", estado: "" });
  const [loading, setLoading] = useState(true);
  const [contacto, setContacto] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviarConsulta() {
    if (!formData.nombre || !formData.email || !formData.telefono) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId: contacto.id,
          propertyName: contacto.name || contacto.title || "Propiedad",
        }),
      });
      if (res.ok) {
        setEnviado(true);
        setTimeout(() => { setContacto(null); setEnviado(false); setFormData({ nombre: "", email: "", telefono: "", mensaje: "" }); }, 2000);
      }
    } catch (e) { console.error(e); }
    setEnviando(false);
  }

  useEffect(() => { cargar(); }, [filtros]);

  async function cargar() {
    setLoading(true);
    let query = supabase.from("properties").select("*").eq("public", true);
    if (filtros.tipo) query = query.eq("type", filtros.tipo);
    if (filtros.zona) query = query.ilike("location", `%${filtros.zona}%`);
    if (filtros.precioMax) query = query.lte("price", filtros.precioMax);
    if (filtros.estado) query = query.eq("status", filtros.estado);
    const { data } = await query.order("created_at", { ascending: false });
    setPropiedades(data || []);
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#1e293b", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>SECTOR</h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.875rem" }}>Portal de Propiedades</p>
        </div>
        <a href="/login" style={{ background: "#3b82f6", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "0.875rem", fontWeight: "600" }}>
          Acceder al CRM
        </a>
      </div>

      {/* Filtros */}
      <div style={{ background: "#fff", padding: "24px 40px", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>TIPO</label>
          <select value={filtros.tipo} onChange={e => setFiltros({...filtros, tipo: e.target.value})}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", minWidth: "140px" }}>
            <option value="">Todos</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Local">Local Comercial</option>
            <option value="Terreno">Terreno</option>
            <option value="Penthouse">Penthouse</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>ZONA</label>
          <input value={filtros.zona} onChange={e => setFiltros({...filtros, zona: e.target.value})}
            placeholder="Piantini, Naco..." 
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", minWidth: "180px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>PRECIO MAX</label>
          <input value={filtros.precioMax} onChange={e => setFiltros({...filtros, precioMax: e.target.value})}
            placeholder="500000" type="number"
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", minWidth: "140px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px", fontWeight: "600" }}>ESTADO</label>
          <select value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}
            style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", minWidth: "140px" }}>
            <option value="">Todos</option>
            <option value="Disponible">Disponible</option>
            <option value="En Oferta">En Oferta</option>
            <option value="Alquiler">Alquiler</option>
          </select>
        </div>
        <button onClick={() => setFiltros({ tipo: "", zona: "", precioMax: "", estado: "" })}
          style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", cursor: "pointer", background: "#f8fafc" }}>
          Limpiar
        </button>
      </div>

      {/* Contenido */}
      <div style={{ padding: "40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>Cargando propiedades...</div>
        ) : propiedades.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>No hay propiedades disponibles con estos filtros.</div>
        ) : (
          <>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>{propiedades.length} propiedad{propiedades.length !== 1 ? "es" : ""} encontrada{propiedades.length !== 1 ? "s" : ""}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {propiedades.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", transition: "transform 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  {/* Imagen placeholder */}
                  <div style={{ background: "linear-gradient(135deg, #1e293b, #334155)", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ fontSize: "3rem" }}>🏠</span>
                    <span style={{ position: "absolute", top: "12px", right: "12px", background: p.status === "Disponible" ? "#22c55e" : p.status === "En Oferta" ? "#f59e0b" : "#3b82f6", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>
                      {p.status || "Disponible"}
                    </span>
                    <span style={{ position: "absolute", top: "12px", left: "12px", background: "#1e293b", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem" }}>
                      {p.type || "Propiedad"}
                    </span>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", fontWeight: "700", color: "#1e293b" }}>{p.name || p.title || "Propiedad"}</h3>
                    <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: "0.875rem" }}>📍 {p.location || p.zone || "Santo Domingo"}</p>
                    {p.bedrooms && <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: "0.875rem" }}>🛏 {p.bedrooms} hab &nbsp;|&nbsp; {p.bathrooms} ban &nbsp;{p.area ? `|&nbsp; ${p.area}m²` : ""}</p>}
                    <p style={{ margin: "16px 0 0 0", fontSize: "1.25rem", fontWeight: "700", color: "#1e293b" }}>
                      {p.price ? `$${Number(p.price).toLocaleString()}` : "Consultar precio"}
                    </p>
                    <button onClick={() => window.location.href = `/propiedades/${p.id}`}
                      style={{ width: "100%", marginTop: "16px", padding: "10px", background: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.875rem" }}>
                      Consultar propiedad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de contacto */}
      {contacto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}
          onClick={() => setContacto(null)}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", maxWidth: "440px", width: "100%" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>Consultar propiedad</h3>
            <p style={{ color: "#64748b", margin: "0 0 24px 0", fontSize: "0.875rem" }}>{contacto.name || contacto.title}</p>
            {enviado ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#22c55e", fontWeight: "600" }}>
                Consulta enviada exitosamente
              </div>
            ) : (
              <>
                <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Tu nombre *" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "12px", fontSize: "0.875rem", boxSizing: "border-box", color: "#1e293b", background: "#fff" }} />
                <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Tu email *" type="email" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "12px", fontSize: "0.875rem", boxSizing: "border-box", color: "#1e293b", background: "#fff" }} />
                <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="Tu telefono *" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "12px", fontSize: "0.875rem", boxSizing: "border-box", color: "#1e293b", background: "#fff" }} />
                <textarea value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})} placeholder="Mensaje (opcional)" rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", marginBottom: "16px", fontSize: "0.875rem", boxSizing: "border-box", resize: "none", color: "#1e293b", background: "#fff" }} />
                <button onClick={enviarConsulta} disabled={enviando} style={{ width: "100%", padding: "12px", background: enviando ? "#94a3b8" : "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: enviando ? "default" : "pointer" }}>
                  {enviando ? "Enviando..." : "Enviar consulta"}
                </button>
              </>
            )}
            <button onClick={() => setContacto(null)} style={{ width: "100%", padding: "10px", background: "transparent", color: "#64748b", border: "none", cursor: "pointer", marginTop: "8px" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
