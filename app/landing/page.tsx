"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

const LIME = "#CCFF00";
const BG = "#09090b";
const CARD_BG = "#111113";
const BORDER = "#1a1a1d";

const features = [
  {
    num: "01",
    title: "Mapa de Disponibilidad Real",
    sub: "Control visual absoluto de tus unidades en planos",
    desc: "Visualiza y administra el estado de cada apartamento de tu torre desde una interfaz móvil intuitiva. Verde = Libre, Amarillo = Reservado, Rojo = Vendido. Bloqueos inmediatos en plena negociación.",
    bullets: [
      "Actualización e integración al instante para brokers",
      "Bloqueo de unidades en tiempo real desde la cita",
      "Acceso directo desde cualquier celular sin instalar apps",
      "Historial de auditoría y movimientos por unidad"
    ],
    flip: false,
  },
  {
    num: "02",
    title: "Intranet de Proyecto Segura",
    sub: "Tu red de ventas externa conectada sin intermediarios",
    desc: "Asigna enlaces únicos y privados para agencias autorizadas o brokers independientes (Remax, Plusval, etc.). Permíteles consultar stock real y formalizar intenciones de compra sin crear cuentas.",
    bullets: [
      "Generación de links de acceso únicos por agencia en un clic",
      "Control de acceso y permisos centralizados por el desarrollador",
      "Reserva temporal automática de 48 horas bajo contrato digital",
      "Trazabilidad absoluta del broker que originó el cliente"
    ],
    flip: true,
  },
  {
    num: "03",
    title: "Gestión de Cobros y Postventa",
    sub: "Monitoreo financiero y avance de obra unificados",
    desc: "Centraliza múltiples proyectos inmobiliarios. Supervisa planes de pago de planos, automatiza alertas de cuotas de amortización para compradores y mantén un control de entregas de unidades.",
    bullets: [
      "Automatización de notificaciones de pago recurrentes",
      "Estados de cuenta interactivos para compradores en planos",
      "Reportes de rendimiento de ventas listos para tu junta directiva",
      "Módulo de incidencias de postventa para ingenieros de obra"
    ],
    flip: false,
  },
];

function MapaMockup() {
  const pisos = [
    { piso: "Piso 18 — PH", unidades: [
      { id: "PH1", estado: "reservado" },
      { id: "PH2", estado: "libre" },
    ]},
    { piso: "Piso 4", unidades: [
      { id: "4A", estado: "vendido" },
      { id: "4B", estado: "libre" },
      { id: "4C", estado: "reservado" },
      { id: "4D", estado: "libre" },
    ]},
    { piso: "Piso 1", unidades: [
      { id: "1A", estado: "libre" },
      { id: "1B", estado: "vendido" },
      { id: "1C", estado: "libre" },
      { id: "1D", estado: "reservado" },
    ]},
  ];
  const colores: Record<string, string> = {
    libre: "#22c55e",
    reservado: "#f59e0b",
    vendido: "#ef4444",
  };
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {[["libre","#22c55e"],["reservado","#f59e0b"],["vendido","#ef4444"]].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ color: "#aaa", fontSize: 10, textTransform: "capitalize" }}>{label}</span>
          </div>
        ))}
      </div>
      {pisos.map((p) => (
        <div key={p.piso} style={{ marginBottom: 12 }}>
          <div style={{ color: "#666", fontSize: 10, marginBottom: 6, fontFamily: "monospace" }}>{p.piso}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.unidades.map((u) => (
              <div key={u.id} style={{ background: colores[u.estado], borderRadius: 8, padding: "8px 14px", color: "#fff", fontWeight: 800, fontSize: 12 }}>
                {u.id}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IntranetMockup() {
  const brokers = [
    { nombre: "Remax Capital", unidades: 3, color: LIME },
    { nombre: "Plusval RD", unidades: 1, color: "#f59e0b" },
    { nombre: "Luis Betances", unidades: 2, color: "#4da6ff" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      <div style={{ color: "#666", fontSize: 10, fontFamily: "monospace", marginBottom: 14 }}>sector.do/proyecto/torre-piantini-abc123</div>
      {brokers.map((b) => (
        <div key={b.nombre} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a1a1d", display: "flex", alignItems: "center", justifyContent: "center", color: b.color, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
            {b.nombre[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#eee", fontWeight: 600, fontSize: 13 }}>{b.nombre}</div>
            <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{b.unidades} unidades reservadas</div>
          </div>
          <div style={{ background: b.color + "20", color: b.color, borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 800 }}>Activo</div>
        </div>
      ))}
      <div style={{ marginTop: 14, background: "#1a1a1d", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#aaa", fontSize: 12 }}>+ Generar nuevo link</span>
        <div style={{ background: LIME, color: BG, borderRadius: 6, padding: "4px 12px", fontSize: 10, fontWeight: 800 }}>Crear</div>
      </div>
    </div>
  );
}

function ProyectosMockup() {
  const proyectos = [
    { nombre: "Torre Piantini", avance: 65, libre: 24, reservado: 8, vendido: 40 },
    { nombre: "Residencias Naco", avance: 30, libre: 48, reservado: 5, vendido: 15 },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      {proyectos.map((p) => (
        <div key={p.nombre} style={{ background: "#1a1a1d", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ color: "#eee", fontWeight: 700, fontSize: 14 }}>{p.nombre}</div>
            <div style={{ color: LIME, fontSize: 12, fontWeight: 800 }}>{p.avance}% obra</div>
          </div>
          <div style={{ background: "#111", borderRadius: 4, height: 4, marginBottom: 12 }}>
            <div style={{ background: LIME, height: 4, borderRadius: 4, width: `${p.avance}%` }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
            <div>
              <div style={{ color: "#22c55e", fontWeight: 900, fontSize: 18 }}>{p.libre}</div>
              <div style={{ color: "#666", fontSize: 10 }}>Libres</div>
            </div>
            <div>
              <div style={{ color: "#f59e0b", fontWeight: 900, fontSize: 18 }}>{p.reservado}</div>
              <div style={{ color: "#666", fontSize: 10 }}>Reservadas</div>
            </div>
            <div>
              <div style={{ color: "#ef4444", fontWeight: 900, fontSize: 18 }}>{p.vendido}</div>
              <div style={{ color: "#666", fontSize: 10 }}>Vendidas</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const Mockups = [MapaMockup, IntranetMockup, ProyectosMockup];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email || !email.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const { error: sbError } = await supabase
        .from("lista_espera")
        .insert([{ email }]);
      if (sbError) {
        if (sbError.code === "23505") {
          setEnviado(true);
        } else {
          setError("Algo salió mal. Intenta de nuevo.");
        }
      } else {
        setEnviado(true);
      }
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
      setEmail("");
    }
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
          <a href="/login" style={{ background: LIME, color: BG, borderRadius: 100, padding: "9px 22px", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Acceder →</a>
        </div>
      </nav>

      {/* HERO — fondo negro */}
      <section className="hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div className="hero-label" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#aaa", marginBottom: 32, textTransform: "uppercase" }}>
          🇩🇴 &nbsp; Plataforma Comercial · República Dominicana
        </div>
        <h1 className="hero-h1" style={{ fontSize: "clamp(34px, 6.5vw, 76px)", fontWeight: 900, letterSpacing: -2.5, margin: "0 0 32px", maxWidth: 960, lineHeight: 1.1 }}>
          Tu inventario de preventa,{" "}
          <em style={{ color: LIME, fontStyle: "italic" }}>bajo tu control absoluto.</em>
        </h1>
        <p style={{ color: "#aaa", fontSize: "clamp(15px, 1.8vw, 19px)", maxWidth: 580, lineHeight: 1.6, margin: "0 0 52px", fontWeight: 400 }}>
          SECTOR conecta el inventario de tu constructora con el ejército de brokers de RD — en tiempo real, sin tocar tu ERP contable y desde cualquier dispositivo móvil.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/login" style={{ background: LIME, color: BG, borderRadius: 100, padding: "18px 36px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            Acceder a SECTOR
          </a>
          <a href="#funciones" style={{ background: "transparent", color: "#fff", borderRadius: 100, padding: "18px 36px", fontWeight: 600, fontSize: 15, textDecoration: "none", border: `1px solid #444` }}>
            Ver Funciones
          </a>
        </div>
      </section>

      {/* STATS — franja verde inmediatamente después del hero */}
      <section className="stats-section" style={{ background: LIME }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 0 }}>
          {[
            { value: "Tiempo real", label: "Disponibilidad sincronizada\nentre todos tus brokers." },
            { value: "0 apps",      label: "El broker accede desde\nsu navegador. Sin instalar nada." },
            { value: "48 horas",    label: "Reserva temporal automática.\nSin perder unidades." },
            { value: "0%",          label: "Interferencia con\ntu ERP o contabilidad fiscal." },
          ].map((s, i) => (
            <div key={s.value} style={{ padding: "20px 32px", borderLeft: i > 0 ? `1px solid rgba(0,0,0,0.15)` : "none" }}>
              <div style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 900, color: BG, lineHeight: 1, letterSpacing: -2 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-line", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="funciones">
        <div style={{ padding: "100px 48px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#aaa", marginBottom: 20, textTransform: "uppercase" }}>Ecosistema Inteligente</div>
          <h2 className="features-h2" style={{ fontSize: "clamp(34px, 4.5vw, 58px)", fontWeight: 900, letterSpacing: -2.5, margin: 0 }}>
            3 módulos que transforman<br />cómo vendes en planos.
          </h2>
        </div>

        {features.map((f, i) => {
          const MockupComponent = Mockups[i];
          const currentBg = i % 2 === 0 ? BG : "#0d0d0f";
          return (
            <div key={f.num} className="feature-section" style={{
              background: currentBg,
              borderTop: `1px solid ${BORDER}`,
            }}>
              <div className="feature-grid" style={{ direction: f.flip ? "rtl" : "ltr" }}>
                <div style={{ direction: "ltr" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: LIME, textTransform: "uppercase", marginBottom: 16 }}>{f.num}</div>
                  <h3 className="feature-h3" style={{ fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 900, letterSpacing: -1.5, margin: "0 0 8px", color: "#fff" }}>{f.title}</h3>
                  <div style={{ fontSize: 16, color: "#bbb", marginBottom: 24, fontStyle: "italic" }}>— {f.sub}</div>
                  <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.7, margin: "0 0 32px" }}>{f.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {f.bullets.map((b) => (
                      <li key={b} style={{ display: "flex", alignItems: "center", gap: 12, color: "#ddd", fontSize: 14, fontWeight: 500 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: LIME, flexShrink: 0 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ direction: "ltr" }}>
                  {MockupComponent && <MockupComponent />}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* FOOTER */}
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div className="footer-inner" style={{ padding: "40px 48px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -1 }}>SECTOR<span style={{ color: LIME }}>.</span></div>
          <div className="footer-text" style={{ color: "#aaa", fontSize: 12 }}>sector.do · Plataforma Comercial Inmobiliaria · República Dominicana · 2026</div>
        </div>
        <div style={{ fontSize: "clamp(80px, 18vw, 220px)", fontWeight: 900, letterSpacing: -8, color: "#161619", lineHeight: 0.85, padding: "0 32px", userSelect: "none", marginTop: 8 }}>
          SECTOR
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: rgba(0,0,0,0.35); }
        [data-vercel-toolbar], vercel-toolbar, #vercel-live-feedback { display: none !important; }
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .feature-section  { padding: 90px 48px; }
        .hero-section     { padding: 120px 48px 80px; }
        .stats-section    { padding: 80px 48px; }
        .cta-section      { padding: 120px 48px; }
        @media (max-width: 768px) {
          nav a:not(:last-child) { display: none; }
          .feature-grid { grid-template-columns: 1fr !important; direction: ltr !important; gap: 42px !important; }
          .feature-grid > div { direction: ltr !important; }
          .feature-section  { padding: 56px 24px !important; }
          .hero-section     { padding: 100px 24px 64px !important; }
          .stats-section    { padding: 40px 24px !important; }
          .cta-section      { padding: 56px 24px !important; }
          .hero-label  { letter-spacing: 1px !important; font-size: 11px !important; }
          .hero-h1     { line-height: 1.1 !important; letter-spacing: -1.5px !important; }
          .features-h2 { line-height: 1.15 !important;  letter-spacing: -1.5px !important; }
          .feature-h3  { line-height: 1.15 !important;  letter-spacing: -1px !important; }
          .cta-h2      { line-height: 1.0 !important;  letter-spacing: -1.5px !important; }
          .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; }
          .footer-text  { text-align: center !important; }
        }
      `}</style>
    </div>
  );
}