"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

const LIME = "#CCFF00";
const BG = "#09090b";
const CARD_BG = "#111113";
const BORDER = "#1a1a1d";

const sectors = [
  "Piantini", "Naco", "Bella Vista", "Serrallés",
  "Los Cacicazgos", "La Esperilla", "Mirador Norte", "Mirador Sur",
  "Arroyo Hondo", "Viejo Arroyo Hondo", "Gazcue", "Zona Colonial",
  "Los Prados", "La Castellana", "Fernández", "Evaristo Morales",
];

const turisticos = [
  "Punta Cana", "Bávaro", "Las Terrenas", "Juan Dolio",
  "Santiago", "Bayahíbe", "La Romana", "Sosúa",
];

const features = [
  {
    num: "01",
    title: "Dashboard",
    sub: "Visión total de tu negocio en un vistazo",
    desc: "El centro de mando de SECTOR. Te muestra en tiempo real lo que deja dinero: leads sin responder en rojo, seguimientos urgentes del día y el estatus real de tus negociaciones. Cero métricas de vanidad.",
    bullets: ["Leads fríos y calientes destacados", "Alertas de seguimiento inmediato", "Pipeline activo consolidado", "Métricas de inventario disponible"],
    flip: false,
  },
  {
    num: "02",
    title: "Mis Tareas",
    sub: "Tu agenda diaria inteligente",
    desc: "Cada tarea tiene cliente, propiedad y fecha. Sin notas sueltas, sin excusas. El sistema te recuerda antes de que olvides. Diseñado para el ritmo del broker moderno.",
    bullets: ["Tareas vinculadas a clientes y propiedades", "Recordatorios automáticos", "Vista diaria y semanal", "Filtro por urgencia"],
    flip: true,
  },
  {
    num: "03",
    title: "Leads y Contactos",
    sub: "Tu cartera con temperatura real",
    desc: "Cada cliente tiene su perfil completo: presupuesto, origen del lead, temperatura, historial de conversaciones. Sabes exactamente dónde está cada uno sin abrir WhatsApp.",
    bullets: ["Temperatura: Nuevo / Activo / Estancado", "Origen del lead rastreado", "Contacto directo WA, llamada, email", "Historial de interacciones"],
    flip: false,
  },
  {
    num: "04",
    title: "Pipeline Visual",
    sub: "De prospecto a cierre, sin perder un deal",
    desc: "Kanban visual con volumen total en USD. Cada negocio muestra el cliente, la propiedad y el botón AI que sugiere el próximo paso. El único pipeline inmobiliario con IA en RD.",
    bullets: ["Prospectos → Visitas → Negociación → Cierre", "Volumen total en USD visible siempre", "Botón AI por deal — único en el mercado", "Drag & drop entre etapas"],
    flip: true,
  },
  {
    num: "05",
    title: "Propiedades",
    sub: "Tu inventario organizado, listo para cerrar",
    desc: "Catálogo visual con fotos, precios, habitaciones, m² y notas de venta. Filtra por sector, precio o estado. Genera fichas técnicas estéticas con un clic y envíalas por WhatsApp.",
    bullets: ["Fotos, precio, m², habitaciones y baños", "Filtros por sector y precio", "Notas de venta privadas", "Ficha técnica exportable en PDF"],
    flip: false,
  },
];

function DashboardMockup() {
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        {[["3","LEADS"],["12","CLIENTES"],["8","PROPIED."],["5","SEGUIM."]].map(([v,l]) => (
          <div key={l} style={{ background: "#1a1a1d", borderRadius: 10, padding: "12px 6px", textAlign: "center" }}>
            <div style={{ color: LIME, fontWeight: 900, fontSize: 22 }}>{v}</div>
            <div style={{ fontSize: 9, color: "#bbb", marginTop: 3, letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#1a1a1d", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff4444", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#bbb" }}>3 leads sin responder</span>
        </div>
        <div style={{ background: LIME, color: BG, borderRadius: 6, padding: "4px 12px", fontSize: 10, fontWeight: 800 }}>Atender</div>
      </div>
    </div>
  );
}

function TasksMockup() {
  const tasks = [
    { hora: "9:00",  tarea: "Llamar a Carlos Méndez",  tipo: "HOY",       dot: "#ff4444" },
    { hora: "11:30", tarea: "Visita Piantini Apt 4B",   tipo: "Visita",    dot: LIME },
    { hora: "15:00", tarea: "Enviar ficha a Rodríguez", tipo: "Pendiente", dot: "#888" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      {tasks.map((t) => (
        <div key={t.tarea} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ color: "#aaa", fontSize: 11, minWidth: 38 }}>{t.hora}</div>
          <div style={{ flex: 1, color: "#ddd", fontSize: 13 }}>{t.tarea}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#aaa" }}>{t.tipo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadsMockup() {
  const clientes = [
    { nombre: "María Torres",  presupuesto: "$180,000", temp: "Activo",    dot: LIME },
    { nombre: "Juan Pérez",    presupuesto: "$95,000",  temp: "Nuevo",     dot: "#4da6ff" },
    { nombre: "Ana Gómez",     presupuesto: "$250,000", temp: "Estancado", dot: "#ff4444" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      {clientes.map((c) => (
        <div key={c.nombre} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a1a1d", display: "flex", alignItems: "center", justifyContent: "center", color: LIME, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
            {c.nombre[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#eee", fontWeight: 600, fontSize: 13 }}>{c.nombre}</div>
            <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{c.presupuesto}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#aaa" }}>{c.temp}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelineMockup() {
  const cols = [
    { stage: "Prospectos", deals: ["María T.", "Luis R."], color: "#4da6ff" },
    { stage: "Visitas",    deals: ["Ana G."],              color: LIME },
    { stage: "Negociación",deals: ["Pedro M."],            color: "#ff9900" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", gap: 10 }}>
        {cols.map((col) => (
          <div key={col.stage} style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
              <span style={{ color: "#aaa", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{col.stage}</span>
            </div>
            {col.deals.map((d) => (
              <div key={d} style={{ background: "#1a1a1d", borderRadius: 8, padding: "10px", marginBottom: 6 }}>
                <div style={{ color: "#ccc", fontSize: 12, fontWeight: 600 }}>{d}</div>
                <div style={{ color: LIME, borderRadius: 4, fontSize: 9, fontWeight: 800, marginTop: 6, display: "inline-block", letterSpacing: 1 }}>✦ AI</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PropiedadesMockup() {
  const props = [
    { nombre: "Apto Piantini",    precio: "$195,000", m2: "120 m²", beds: "3/2" },
    { nombre: "Casa Naco",        precio: "$380,000", m2: "280 m²", beds: "4/3" },
    { nombre: "PH Serrallés",     precio: "$520,000", m2: "340 m²", beds: "4/4" },
    { nombre: "Villa Cacicazgos", precio: "$890,000", m2: "600 m²", beds: "5/5" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 16, padding: "20px", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {props.map((p, i) => (
          <div key={p.nombre} style={{ background: "#1a1a1d", borderRadius: 10 }}>
            <div style={{ height: 60, borderRadius: "10px 10px 0 0", background: "#1a1a1d", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.18 }}>
                <defs>
                  <pattern id={`dots-${i}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#CCFF00" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${i})`} />
              </svg>
              <div style={{ position: "relative", zIndex: 1, width: 20, height: 20, borderRadius: 4, border: "1px solid #444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="1" y="2" width="8" height="6" rx="1" stroke="#666" strokeWidth="1"/>
                  <circle cx="3.5" cy="4.5" r="1" fill="#666"/>
                  <path d="M1 7l2.5-2 2 1.5L8 4l1 3" stroke="#666" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={{ padding: "10px" }}>
              <div style={{ color: "#eee", fontSize: 11, fontWeight: 700 }}>{p.nombre}</div>
              <div style={{ color: LIME, fontSize: 13, fontWeight: 900, marginTop: 2 }}>{p.precio}</div>
              <div style={{ color: "#aaa", fontSize: 10, marginTop: 3 }}>{p.m2} · {p.beds}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Mockups = [DashboardMockup, TasksMockup, LeadsMockup, PipelineMockup, PropiedadesMockup];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail]       = useState("");
  const [enviado, setEnviado]   = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState("");

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
        console.error("Supabase error:", sbError);
        if (sbError.code === "23505") {
          setEnviado(true);
        } else {
          setError("Algo salió mal. Intenta de nuevo.");
        }
      } else {
        setEnviado(true);
      }
    } catch (err) {
      console.error("Network error:", err);
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
          <a href="#acceso" style={{ background: LIME, color: BG, borderRadius: 100, padding: "9px 22px", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Comenzar</a>
        </div>
      </nav>

      <section className="hero-section" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div className="hero-label" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#aaa", marginBottom: 32, textTransform: "uppercase" }}>
          🇩🇴 &nbsp; CRM Inmobiliario · República Dominicana
        </div>
        <h1 className="hero-h1" style={{ fontSize: "clamp(52px, 10vw, 120px)", fontWeight: 900, letterSpacing: -4, margin: "0 0 32px", maxWidth: 900 }}>
          Tu cartera de clientes,{" "}
          <em style={{ color: LIME, fontStyle: "italic" }}>bajo control total.</em>
        </h1>
        <p style={{ color: "#aaa", fontSize: "clamp(16px, 2vw, 20px)", maxWidth: 520, lineHeight: 1.6, margin: "0 0 52px", fontWeight: 400 }}>
          SECTOR es el CRM diseñado para realtors en República Dominicana. Pipeline visual, seguimiento preciso, cierre inteligente.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#acceso" style={{ background: LIME, color: BG, borderRadius: 100, padding: "18px 36px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            Solicitar Acceso Anticipado
          </a>
          <a href="#funciones" style={{ background: "transparent", color: "#fff", borderRadius: 100, padding: "18px 36px", fontWeight: 600, fontSize: 15, textDecoration: "none", border: `1px solid #444` }}>
            Ver Funciones
          </a>
        </div>
      </section>

      <section className="stats-section" style={{ background: LIME }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 0 }}>
          {[
            { value: "5 min",  label: "Configuración inicial.\nCero drama." },
            { value: "1 clic", label: "Fichas técnicas listas\npara WhatsApp." },
            { value: "7 en 1", label: "Leads, pipeline y\nfacturación juntos." },
            { value: "0%",     label: "Distracciones.\nSolo lo que cierra." },
          ].map((s, i) => (
            <div key={s.value} style={{ padding: "20px 32px", borderLeft: i > 0 ? `1px solid rgba(0,0,0,0.15)` : "none" }}>
              <div style={{ fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 900, color: BG, lineHeight: 1, letterSpacing: -3 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-line", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rd-section" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#aaa", marginBottom: 24, textTransform: "uppercase" }}>🇩🇴 &nbsp; Hecho para RD</div>
          <h2 className="rd-h2" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, letterSpacing: -3, margin: "0 0 24px", maxWidth: 700 }}>
            Construido para el ecosistema inmobiliario de la República Dominicana.
          </h2>
          <p style={{ color: "#aaa", fontSize: 18, maxWidth: 560, lineHeight: 1.6, marginBottom: 60 }}>
            Desde Piantini hasta Punta Cana, SECTOR conoce tu territorio.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720 }}>
            <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 16 }}>Distrito Nacional</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sectors.slice(0, 6).map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: LIME, flexShrink: 0 }} />
                    <span style={{ color: "#ddd", fontSize: 14, fontWeight: 500 }}>{s}</span>
                  </div>
                ))}
                <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>+{sectors.length - 6} sectores más</div>
              </div>
            </div>
            <div style={{ background: "#111", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 16 }}>Turismo e Inversión</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {turisticos.map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: LIME + "99", flexShrink: 0 }} />
                    <span style={{ color: "#ddd", fontSize: 14, fontWeight: 500 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones">
        <div style={{ padding: "80px 48px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#aaa", marginBottom: 20, textTransform: "uppercase" }}>Todo lo que necesitas</div>
          <h2 className="features-h2" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, letterSpacing: -3, margin: 0 }}>
            7 herramientas de alto rendimiento.<br />Un solo lugar.
          </h2>
        </div>

        {features.map((f, i) => {
          const MockupComponent = Mockups[i];
          const isLime = i % 3 === 2;
          return (
            <div key={f.num} className="feature-section" style={{
              background: isLime ? LIME : (i % 2 === 0 ? BG : "#0d0d0f"),
              borderTop: `1px solid ${isLime ? "transparent" : BORDER}`,
            }}>
              <div className="feature-grid" style={{ direction: f.flip ? "rtl" : "ltr" }}>
                <div style={{ direction: "ltr" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: isLime ? "rgba(0,0,0,0.5)" : "#888", textTransform: "uppercase", marginBottom: 16 }}>{f.num}</div>
                  <h3 className="feature-h3" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: -2, margin: "0 0 8px", color: isLime ? BG : "#fff" }}>{f.title}</h3>
                  <div style={{ fontSize: 17, color: isLime ? "rgba(0,0,0,0.6)" : "#bbb", marginBottom: 24, fontStyle: "italic" }}>— {f.sub}</div>
                  <p style={{ color: isLime ? "rgba(0,0,0,0.7)" : "#bbb", fontSize: 16, lineHeight: 1.7, margin: "0 0 32px" }}>{f.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {f.bullets.map((b) => (
                      <li key={b} style={{ display: "flex", alignItems: "center", gap: 12, color: isLime ? BG : "#ddd", fontSize: 15, fontWeight: 500 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: isLime ? BG : LIME, flexShrink: 0 }} />
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

      <section id="acceso" className="cta-section" style={{ background: LIME, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 24 }}>🇩🇴</div>
        <h2 className="cta-h2" style={{ fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 900, letterSpacing: -4, margin: "0 0 20px", color: BG }}>
          El CRM que el realtor<br />dominicano estaba esperando.
        </h2>
        <p style={{ color: "rgba(0,0,0,0.6)", fontSize: 18, maxWidth: 440, margin: "0 auto 52px", lineHeight: 1.6 }}>
          Solicita tu acceso anticipado. Sin tarjeta de crédito. Sin compromisos.
        </p>
        {enviado ? (
          <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 16, padding: "24px 32px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ color: BG, fontWeight: 800, fontSize: 18, margin: "0 0 8px" }}>¡Listo! Te avisamos pronto.</p>
            <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 14, margin: 0 }}>Recibirás un email cuando tu acceso esté listo.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ flex: 1, minWidth: 240, background: "rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.2)", color: BG, borderRadius: 100, padding: "16px 24px", fontSize: 15, outline: "none" }}
              />
              <button
                onClick={handleSubmit}
                disabled={enviando}
                style={{ background: BG, color: LIME, borderRadius: 100, padding: "16px 32px", fontWeight: 800, fontSize: 14, border: "none", cursor: enviando ? "not-allowed" : "pointer", opacity: enviando ? 0.7 : 1 }}>
                {enviando ? "Enviando..." : "Solicitar Acceso"}
              </button>
            </div>
            {error && (
              <p style={{ color: "rgba(0,0,0,0.6)", fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</p>
            )}
          </div>
        )}
      </section>

      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div className="footer-inner" style={{ padding: "40px 48px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -1 }}>SECTOR<span style={{ color: LIME }}>.</span></div>
          <div className="footer-text" style={{ color: "#aaa", fontSize: 12 }}>sector.do · CRM para Realtors en República Dominicana · 2026</div>
        </div>
        <div style={{ fontSize: "clamp(80px, 18vw, 220px)", fontWeight: 900, letterSpacing: -8, color: "#222", lineHeight: 0.85, padding: "0 32px", userSelect: "none", marginTop: 8 }}>
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
        .feature-section  { padding: 100px 48px; }
        .hero-section     { padding: 120px 48px 80px; }
        .rd-section       { padding: 120px 48px; }
        .stats-section    { padding: 80px 48px; }
        .cta-section      { padding: 120px 48px; }
        @media (max-width: 768px) {
          nav a:not(:last-child) { display: none; }
          .feature-grid { grid-template-columns: 1fr !important; direction: ltr !important; gap: 32px !important; }
          .feature-grid > div { direction: ltr !important; }
          .feature-section  { padding: 48px 20px !important; }
          .hero-section     { padding: 90px 20px 48px !important; }
          .rd-section       { padding: 48px 20px !important; }
          .stats-section    { padding: 40px 20px !important; }
          .cta-section      { padding: 48px 20px !important; }
          .hero-label  { letter-spacing: 1px !important; font-size: 11px !important; }
          .hero-h1     { line-height: 1.05 !important; letter-spacing: -2px !important; }
          .rd-h2       { line-height: 1.1 !important;  letter-spacing: -2px !important; }
          .features-h2 { line-height: 1.1 !important;  letter-spacing: -2px !important; }
          .feature-h3  { line-height: 1.1 !important;  letter-spacing: -1px !important; }
          .cta-h2      { line-height: 1.0 !important;  letter-spacing: -2px !important; }
          .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; }
          .footer-text  { text-align: center !important; }
        }
      `}</style>
    </div>
  );
}