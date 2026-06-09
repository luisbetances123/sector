"use client";

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px", color: "#1e293b" }}>Planes SECTOR</h1>
      <p style={{ color: "#64748b", marginBottom: "48px" }}>Elige el plan que mejor se adapta a tu negocio</p>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>

        {/* Plan Free */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", width: "300px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>Free</h2>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1e293b", margin: "16px 0" }}>$0<span style={{ fontSize: "1rem", color: "#64748b" }}>/mes</span></p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            <li style={{ color: "#475569" }}>Hasta 3 propiedades</li>
            <li style={{ color: "#475569" }}>Clientes ilimitados</li>
            <li style={{ color: "#475569" }}>Pipeline basico</li>
            <li style={{ color: "#475569" }}>Calendario</li>
          </ul>
          <button style={{ width: "100%", padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "default" }}>Plan actual</button>
        </div>

        {/* Plan Pro */}
        <div style={{ background: "#1e293b", border: "1px solid #1e293b", borderRadius: "16px", padding: "32px", width: "300px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#fff" }}>Pro</h2>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", color: "#fff", margin: "16px 0" }}>$29<span style={{ fontSize: "1rem", color: "#94a3b8" }}>/mes</span></p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            <li style={{ color: "#cbd5e1" }}>Propiedades ilimitadas</li>
            <li style={{ color: "#cbd5e1" }}>Clientes ilimitados</li>
            <li style={{ color: "#cbd5e1" }}>Pipeline avanzado</li>
            <li style={{ color: "#cbd5e1" }}>Exportacion PDF</li>
            <li style={{ color: "#cbd5e1" }}>Multi-usuario</li>
            <li style={{ color: "#cbd5e1" }}>Soporte prioritario</li>
          </ul>
          <button
            onClick={() => window.location.href = "/api/stripe/checkout"}
            style={{ width: "100%", padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            Actualizar a Pro
          </button>
        </div>

      </div>
    </div>
  );
}
