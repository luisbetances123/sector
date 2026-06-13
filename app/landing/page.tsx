"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

const LIME = "#CCFF00";
const BG = "#09090b";
const BORDER = "#1a1a1d";

const modules = [
  {
    num: "01",
    title: "Mapa de Disponibilidad Real",
    bullets: [
      "Control visual de unidades",
      "Actualización al instante para brokers",
      "Filtrado por etapa de obra",
    ],
    mockup: "mapa",
  },
  {
    num: "02",
    title: "Intranet de Proyecto Segura",
    bullets: [
      "Acceso privado para agencias autorizadas",
      "Reservas de 48H con firma digital",
      "Trazabilidad total de ventas",
    ],
    mockup: "intranet",
  },
  {
    num: "03",
    title: "Gestión de Cobros y Postventa",
    bullets: [
      "Automatización de planes de pago",
      "Estados de cuenta interactivos para clientes",
      "Portal de incidencias de entrega",
    ],
    mockup: "proyectos",
  },
];

function MapaPreview() {
  const colores: Record<string, string> = { libre: "#22c55e", reservado: "#f59e0b", vendido: "#ef4444" };
  const pisos = [
    { piso: "PH", unidades: [{ id: "PH1", estado: "reservado" }, { id: "PH2", estado: "libre" }] },
    { piso: "4", unidades: [{ id: "4A", estado: "vendido" }, { id: "4B", estado: "libre" }, { id: "4C", estado: "reservado" }, { id: "4D", estado: "libre" }] },
    { piso: "1", unidades: [{ id: "1A", estado: "libre" }, { id: "1B", estado: "vendido" }, { id: "1C", estado: "libre" }, { id: "1D", estado: "reservado" }] },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 12, padding: 16, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {[["libre", "#22c55e"], ["reservado", "#f59e0b"], ["vendido", "#ef4444"]].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 2, background: c }} />
            <span style={{ color: "#888", fontSize: 9, textTransform: "capitalize" }}>{l}</span>
          </div>
        ))}
      </div>
      {pisos.map(p => (
        <div key={p.piso} style={{ marginBottom: 8 }}>
          <div style={{ color: "#555", fontSize: 9, marginBottom: 4, fontFamily: "monospace" }}>Piso {p.piso}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.unidades.map(u => (
              <div key={u.id} style={{ background: colores[u.estado], borderRadius: 6, padding: "5px 10px", color: "#fff", fontWeight: 800, fontSize: 10 }}>{u.id}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IntranetPreview() {
  const brokers = [
    { nombre: "Remax Capital", u: 3, color: LIME },
    { nombre: "Plusval RD", u: 1, color: "#f59e0b" },
    { nombre: "Luis Betances", u: 2, color: "#4da6ff" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 12, padding: 16, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
      <div style={{ color: "#555", fontSize: 9, fontFamily: "monospace", marginBottom: 10 }}>sector.do/proyecto/torre-abc123</div>
      {brokers.map(b => (
        <div key={b.nombre} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a1a1d", display: "flex", alignItems: "center", justifyContent: "center", color: b.color, fontWeight: 900, fontSize: 11, flexShrink: 0 }}>{b.nombre[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#eee", fontWeight: 600, fontSize: 11 }}>{b.nombre}</div>
            <div style={{ color: "#888", fontSize: 10 }}>{b.u} unidades</div>
          </div>
          <div style={{ background: b.color + "20", color: b.color, borderRadius: 4, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>Activo</div>
        </div>
      ))}
    </div>
  );
}

function ProyectosPreview() {
  const proyectos = [
    { nombre: "Torre Piantini", avance: 65, libre: 24, reservado: 8, vendido: 40 },
    { nombre: "Residencias Naco", avance: 30, libre: 48, reservado: 5, vendido: 15 },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 12, padding: 16, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
      {proyectos.map(p => (
        <div key={p.nombre} style={{ background: "#1a1a1d", borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ color: "#eee", fontWeight: 700, fontSize: 11 }}>{p.nombre}</div>
            <div style={{ color: LIME, fontSize: 10, fontWeight: 800 }}>{p.avance}% obra</div>
          </div>
          <div style={{ background: "#111", borderRadius: 3, height: 3, marginBottom: 8 }}>
            <div style={{ background: LIME, height: 3, borderRadius: 3, width: `${p.avance}%` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center" }}>
            <div><div style={{ color: "#22c55e", fontWeight: 900, fontSize: 14 }}>{p.libre}</div><div style={{ color: "#666", fontSize: 9 }}>Libres</div></div>
            <div><div style={{ color: "#f59e0b", fontWeight: 900, fontSize: 14 }}>{p.reservado}</div><div style={{ color: "#666", fontSize: 9 }}>Reservadas</div></div>
            <div><div style={{ color: "#ef4444", fontWeight: 900, fontSize: 14 }}>{p.vendido}</div><div style={{ color: "#666", fontSize: 9 }}>Vendidas</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email || !email.includes("@")) { setError("Ingresa un email válido."); return; }
    setError("");
    setEnviando(true);
    try {
      const { error: sbError } = await supabase.from("lista_espera").insert([{ email }]);
      if (sbError) { if (sbError.code === "23505") { setEnviado(true); } else { setError("Algo salió mal. Intenta de nuevo."); } }
      else { setEnviado(true); }
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    finally { setEnviando(false); setEmail(""); }
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: BG, color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(9,9,11,0.96)" : "transparent",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -1 }}>
          SECTOR<span style={{ color: LIME }}>.</span>
        </div>
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <a href="#funciones" style={{ color: "#aaa", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Funciones</a>
          <a href="/pricing" style={{ color: "#aaa", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Precios</a>
          <a href="/login" style={{ background: LIME, color: BG, borderRadius: 100, padding: "9px 22px", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Acceder →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 48px 60px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#aaa", marginBottom: 28, textTransform: "uppercase" }}>
          🇩🇴 &nbsp; Plataforma Comercial · República Dominicana
        </div>
        <h1 style={{ fontSize: "clamp(38px, 7vw, 84px)", fontWeight: 900, letterSpacing: -3, margin: "0 0 28px", maxWidth: 900, lineHeight: 1.05 }}>
          Tu inventario de preventa,{" "}
          <em style={{ color: LIME, fontStyle: "italic" }}>bajo tu control absoluto.</em>
        </h1>
        <p style={{ color: "#aaa", fontSize: "clamp(15px, 1.8vw, 18px)", maxWidth: 560, lineHeight: 1.6, margin: "0 0 44px", fontWeight: 400 }}>
          SECTOR conecta el inventario de tu constructora con el ejército de brokers de RD — en tiempo real, sin tocar tu ERP, desde cualquier celular.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/login" style={{ background: LIME, color: BG, borderRadius: 100, padding: "16px 32px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            Acceder a SECTOR
          </a>
          <a href="#funciones" style={{ background: "transparent", color: "#fff", borderRadius: 100, padding: "16px 32px", fontWeight: 600, fontSize: 15, textDecoration: "none", border: `1px solid #444` }}>
            Ver Funciones
          </a>
        </div>
      </section>

      {/* 3 MÓDULOS EN FILA */}
      <section id="funciones" style={{ padding: "0 48px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#aaa", marginBottom: 16, textTransform: "uppercase" }}>3 Módulos que Revolucionan la Preventa</div>
        </div>
        <div className="modules-grid">
          {modules.map((m) => (
            <div key={m.num} style={{ background: "#111113", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "28px", display: "flex", flexDirection: "column" }}>
              {m.mockup === "mapa" && <MapaPreview />}
              {m.mockup === "intranet" && <IntranetPreview />}
              {m.mockup === "proyectos" && <ProyectosPreview />}
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: LIME, textTransform: "uppercase", marginBottom: 10 }}>{m.num}</div>
              <h3 style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 900, letterSpacing: -0.5, margin: "0 0 16px", color: "#fff" }}>{m.title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {m.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "center", gap: 10, color: "#aaa", fontSize: 13, fontWeight: 500 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: LIME, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: LIME, padding: "60px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 0 }}>
          {[
            { value: "Tiempo real", label: "Disponibilidad sincronizada\nentre todos tus brokers." },
            { value: "0 apps", label: "El broker accede desde\nsu navegador. Sin instalar nada." },
            { value: "48 horas", label: "Reserva temporal automática.\nSin perder unidades." },
            { value: "0%", label: "Interferencia con\ntu ERP o contabilidad fiscal." },
          ].map((s, i) => (
            <div key={s.value} style={{ padding: "20px 32px", borderLeft: i > 0 ? `1px solid rgba(0,0,0,0.15)` : "none" }}>
              <div style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 900, color: BG, lineHeight: 1, letterSpacing: -2 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-line", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 48px", textAlign: "center", borderTop: `1px solid ${BORDER}` }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, letterSpacing: -3, margin: "0 0 20px" }}>
          ¿Listo para digitalizar<br />tu fuerza de ventas?
        </h2>
        <p style={{ color: "#aaa", fontSize: 17, maxWidth: 440, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Sin tocar tu ERP. Sin cambiar tu contabilidad. Solo más ventas, más rápido.
        </p>
        {enviado ? (
          <div style={{ background: "#1a1a1d", borderRadius: 16, padding: "24px 32px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ color: LIME, fontWeight: 800, fontSize: 18, margin: "0 0 8px" }}>¡Listo! Te contactamos pronto.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="email" placeholder="tu@constructora.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ flex: 1, minWidth: 240, background: "#111", border: `1px solid ${BORDER}`, color: "#fff", borderRadius: 100, padding: "16px 24px", fontSize: 15, outline: "none" }}
              />
              <button onClick={handleSubmit} disabled={enviando}
                style={{ background: LIME, color: BG, borderRadius: 100, padding: "16px 32px", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}>
                {enviando ? "Enviando..." : "Solicitar Demo"}
              </button>
            </div>
            {error && <p style={{ color: "#aaa", fontSize: 13, marginTop: 12 }}>{error}</p>}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div style={{ padding: "40px 48px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -1 }}>SECTOR<span style={{ color: LIME }}>.</span></div>
          <div style={{ color: "#aaa", fontSize: 12 }}>sector.do · Plataforma Comercial Inmobiliaria · República Dominicana · 2026</div>
        </div>
        <div style={{ fontSize: "clamp(80px, 18vw, 220px)", fontWeight: 900, letterSpacing: -8, color: "#161619", lineHeight: 0.85, padding: "0 32px", userSelect: "none", marginTop: 8 }}>
          SECTOR
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #555; }
        [data-vercel-toolbar], vercel-toolbar, #vercel-live-feedback { display: none !important; }
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .modules-grid { grid-template-columns: 1fr !important; }
          nav a:not(:last-child) { display: none; }
        }
      `}</style>
    </div>
  );
}