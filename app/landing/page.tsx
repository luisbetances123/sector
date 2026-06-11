"use client";

import { useEffect, useState } from "react";

const LIME = "#CCFF00";
const BG = "#09090b";
const CARD_BG = "#111113";
const BORDER = "#222226";

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

const stats = [
  { value: "5 min", label: "CONFIGURACIÓN INICIAL\nCERO DRAMA. ENTRAS Y PRODUCES" },
  { value: "1 clic", label: "ENVÍA FICHAS TÉCNICAS\nESTÉTICAS POR WHATSAPP" },
  { value: "7 en 1", label: "FACTURACIÓN, LEADS\nY PIPELINE EN UN SOLO LUGAR" },
  { value: "0%", label: "DISTRACCIONES. INTERFAZ\nDISEÑADA PARA FACTURAR" },
];

const features = [
  {
    num: "01",
    title: "Dashboard",
    sub: "Visión total de tu negocio en un vistazo",
    desc: "El centro de mando de SECTOR. Te muestra en tiempo real lo que deja dinero: leads sin responder en rojo, seguimientos urgentes del día y el estatus real de tus negociaciones.",
    bullets: ["Leads fríos y calientes destacados", "Alertas de seguimiento inmediato", "Pipeline activo consolidado", "Métricas de inventario disponible"],
  },
  {
    num: "02",
    title: "Mis Tareas",
    sub: "Tu agenda diaria inteligente",
    desc: "Cada tarea tiene cliente, propiedad y fecha. Sin notas sueltas, sin excusas. El sistema te recuerda antes de que olvides.",
    bullets: ["Tareas vinculadas a clientes y propiedades", "Recordatorios automáticos", "Vista diaria y semanal", "Filtro por urgencia"],
  },
  {
    num: "03",
    title: "Leads y Contactos",
    sub: "Tu cartera de clientes con temperatura real",
    desc: "Cada cliente tiene su perfil completo: presupuesto, origen del lead, temperatura, historial de conversaciones. Sabes exactamente dónde está cada uno.",
    bullets: ["Temperatura: Nuevo / Activo / Estancado", "Origen del lead rastreado", "Contacto directo WA, llamada, email", "Historial de interacciones"],
  },
  {
    num: "04",
    title: "Pipeline Visual",
    sub: "De prospecto a cierre, sin perder un deal",
    desc: "Kanban visual con volumen total en USD. Cada negocio muestra el cliente, la propiedad y el botón AI que sugiere el próximo paso. El único pipeline inmobiliario con IA en RD.",
    bullets: ["Etapas: Prospectos → Visitas → Negociación → Cierre", "Volumen total en USD visible siempre", "Botón AI por deal — único en el mercado", "Drag & drop entre etapas"],
  },
  {
    num: "05",
    title: "Propiedades",
    sub: "Tu inventario organizado, listo para cerrar",
    desc: "Catálogo visual con fotos, precios, recámaras, m² y notas de venta. Filtra por sector, precio o estado. Genera fichas técnicas con un clic.",
    bullets: ["Fotos, precio, m², recámaras y baños", "Filtros por sector y precio", "Notas de venta privadas", "Ficha técnica exportable en PDF"],
  },
];

const pricing = [
  {
    name: "Explorador",
    price: "Gratis",
    period: "",
    desc: "Para conocer SECTOR sin compromiso.",
    limits: ["5 propiedades", "10 clientes", "Sin PDF", "Sin AI"],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    name: "Profesional",
    price: "$19–25",
    period: "/mes",
    desc: "El realtor independiente que cierra negocios.",
    limits: ["25 propiedades", "Clientes ilimitados", "PDF incluido", "AI básico"],
    cta: "Solicitar acceso",
    highlight: true,
  },
  {
    name: "Agencia",
    price: "$39–49",
    period: "/mes",
    desc: "Para agencias con equipo y volumen.",
    limits: ["Todo ilimitado", "Multi-usuario", "Todos los módulos", "AI completo"],
    cta: "Contactar",
    highlight: false,
  },
];

function DashboardMockup() {
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "#aaa", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
        {[["3","LEADS"],["12","CLIENTES"],["8","PROPIED."],["5","SEGUIM."]].map(([v,l]) => (
          <div key={l} style={{ background: "#1a1a1d", borderRadius: 6, padding: "8px 4px", textAlign: "center" }}>
            <div style={{ color: LIME, fontWeight: 800, fontSize: 16 }}>{v}</div>
            <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#1a1a1d", borderRadius: 6, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4444" }} />
          <span style={{ fontSize: 10, color: "#ccc" }}>3 leads sin responder</span>
        </div>
        <div style={{ background: LIME, color: BG, borderRadius: 4, padding: "3px 8px", fontSize: 9, fontWeight: 700 }}>¡Atender!</div>
      </div>
    </div>
  );
}

function TasksMockup() {
  const tasks = [
    { hora: "9:00", tarea: "Llamar a Carlos Méndez", tipo: "HOY", color: "#ff4444" },
    { hora: "11:30", tarea: "Visita Piantini Apt 4B", tipo: "VISITA", color: LIME },
    { hora: "15:00", tarea: "Enviar ficha a Rodríguez", tipo: "PENDIENTE", color: "#888" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "#aaa", border: `1px solid ${BORDER}` }}>
      {tasks.map((t) => (
        <div key={t.tarea} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ color: "#555", fontSize: 10, minWidth: 34 }}>{t.hora}</div>
          <div style={{ flex: 1, color: "#ddd", fontSize: 11 }}>{t.tarea}</div>
          <div style={{ background: t.color + "22", color: t.color, borderRadius: 4, padding: "2px 7px", fontSize: 9, fontWeight: 700 }}>{t.tipo}</div>
        </div>
      ))}
    </div>
  );
}

function LeadsMockup() {
  const clientes = [
    { nombre: "María Torres", presupuesto: "$180,000", temp: "ACTIVO", tempColor: LIME },
    { nombre: "Juan Pérez", presupuesto: "$95,000", temp: "NUEVO", tempColor: "#4da6ff" },
    { nombre: "Ana Gómez", presupuesto: "$250,000", temp: "ESTANCADO", tempColor: "#ff4444" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 10, padding: "12px 14px", fontSize: 11, color: "#aaa", border: `1px solid ${BORDER}` }}>
      {clientes.map((c) => (
        <div key={c.nombre} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2a2a2d", display: "flex", alignItems: "center", justifyContent: "center", color: LIME, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
            {c.nombre[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#eee", fontWeight: 600, fontSize: 11 }}>{c.nombre}</div>
            <div style={{ color: "#555", fontSize: 10 }}>{c.presupuesto}</div>
          </div>
          <div style={{ background: c.tempColor + "22", color: c.tempColor, borderRadius: 4, padding: "2px 7px", fontSize: 9, fontWeight: 700 }}>{c.temp}</div>
        </div>
      ))}
    </div>
  );
}

function PipelineMockup() {
  const cols = [
    { stage: "Prospectos", deals: ["María T.", "Luis R."], color: "#4da6ff" },
    { stage: "Visitas", deals: ["Ana G."], color: LIME },
    { stage: "Negociación", deals: ["Pedro M."], color: "#ff9900" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 10, padding: "12px 14px", border: `1px solid ${BORDER}`, overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 8, minWidth: 320 }}>
        {cols.map((col) => (
          <div key={col.stage} style={{ flex: 1, minWidth: 90 }}>
            <div style={{ color: col.color, fontSize: 9, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>{col.stage}</div>
            {col.deals.map((d) => (
              <div key={d} style={{ background: "#1a1a1d", borderRadius: 6, padding: "7px 8px", marginBottom: 5 }}>
                <div style={{ color: "#ccc", fontSize: 10, fontWeight: 600 }}>{d}</div>
                <div style={{ background: LIME + "22", color: LIME, borderRadius: 3, padding: "2px 6px", fontSize: 8, fontWeight: 700, marginTop: 5, display: "inline-block" }}>✦ AI</div>
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
    { nombre: "Apto Piantini", precio: "$195,000", m2: "120 m²", beds: "3/2" },
    { nombre: "Casa Naco", precio: "$380,000", m2: "280 m²", beds: "4/3" },
  ];
  return (
    <div style={{ background: "#0d0d0f", borderRadius: 10, padding: "12px 14px", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {props.map((p) => (
          <div key={p.nombre} style={{ background: "#1a1a1d", borderRadius: 8 }}>
            <div style={{ height: 55, background: "#222226", borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏠</div>
            <div style={{ padding: "8px" }}>
              <div style={{ color: "#eee", fontSize: 10, fontWeight: 700 }}>{p.nombre}</div>
              <div style={{ color: LIME, fontSize: 11, fontWeight: 800, marginTop: 2 }}>{p.precio}</div>
              <div style={{ color: "#555", fontSize: 9, marginTop: 3 }}>{p.m2} · {p.beds}</div>
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: BG, color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(9,9,11,0.95)" : "transparent",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -1 }}>
          SECTOR<span style={{ color: LIME }}>.</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <a href="#funciones" style={{ color: "#888", fontSize: 13, textDecoration: "none", letterSpacing: 1, fontWeight: 600, textTransform: "uppercase" }}>Funciones</a>
          <a href="#precios" style={{ color: "#888", fontSize: 13, textDecoration: "none", letterSpacing: 1, fontWeight: 600, textTransform: "uppercase" }}>Precios</a>
          <a href="#acceso" style={{ background: LIME, color: BG, borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Comenzar</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 60px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#555", marginBottom: 28, textTransform: "uppercase" }}>
          🇩🇴 CRM INMOBILIARIO · SANTO DOMINGO
        </div>
        <h1 style={{ fontSize: "clamp(42px, 9vw, 96px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: -3, margin: "0 0 24px", maxWidth: 800 }}>
          Tu cartera de clientes,{" "}
          <span style={{ color: LIME, fontStyle: "italic" }}>bajo control total.</span>
        </h1>
        <p style={{ color: "#888", fontSize: "clamp(15px, 2vw, 19px)", maxWidth: 500, lineHeight: 1.6, margin: "0 0 44px" }}>
          SECTOR es el CRM diseñado para realtors en República Dominicana. Pipeline visual, seguimiento preciso, cierre inteligente.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#acceso" style={{ background: LIME, color: BG, borderRadius: 8, padding: "16px 32px", fontWeight: 800, fontSize: 14, letterSpacing: 1, textDecoration: "none", textTransform: "uppercase" }}>
            Solicitar Acceso Anticipado
          </a>
          <a href="#funciones" style={{ background: "transparent", color: "#fff", borderRadius: 8, padding: "16px 32px", fontWeight: 700, fontSize: 14, letterSpacing: 1, textDecoration: "none", border: `1px solid ${BORDER}`, textTransform: "uppercase" }}>
            Ver Funciones
          </a>
        </div>
      </section>

      {/* SECCIÓN RD */}
      <section style={{ padding: "80px 24px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>🇩🇴</div>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, margin: "16px 0 10px", letterSpacing: -1 }}>
          Construido para el ecosistema inmobiliario<br />de la República Dominicana
        </h2>
        <p style={{ color: "#666", fontStyle: "italic", fontSize: 14, marginBottom: 32 }}>
          Desde Piantini hasta Punta Cana, SECTOR conoce tu territorio.
        </p>
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "28px 32px", maxWidth: 680, margin: "0 auto", lineHeight: 1.8, fontSize: 15, color: "#aaa" }}>
          Configurado con los sectores donde se mueve el dinero real:{" "}
          {sectors.map((s, i) => (
            <span key={s}><span style={{ color: LIME, fontWeight: 700 }}>{s}</span>{i < sectors.length - 1 ? ", " : ""}</span>
          ))}
          {" "}— y los destinos de inversión turística como{" "}
          {turisticos.map((s, i) => (
            <span key={s}><span style={{ color: LIME, fontWeight: 700 }}>{s}</span>{i < turisticos.length - 1 ? ", " : ""}</span>
          ))}.
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, textAlign: "center" }}>
          {stats.map((s) => (
            <div key={s.value}>
              <div style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, color: LIME, lineHeight: 1, letterSpacing: -2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 12, lineHeight: 1.6, whiteSpace: "pre-line", letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" style={{ padding: "80px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: LIME, marginBottom: 14, textTransform: "uppercase" }}>Todo lo que necesitas</div>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, letterSpacing: -2, margin: 0 }}>
            7 herramientas de<br />alto rendimiento. Un solo lugar.
          </h2>
        </div>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {features.map((f, i) => {
            const MockupComponent = Mockups[i];
            return (
              <div key={f.num} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ background: LIME + "22", color: LIME, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>{f.num}</div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>{f.title}</div>
                    <div style={{ color: "#666", fontSize: 13, marginTop: 1 }}>— {f.sub}</div>
                  </div>
                </div>
                <p style={{ color: "#999", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{f.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 7 }}>
                  {f.bullets.map((b) => (
                    <li key={b} style={{ display: "flex", alignItems: "center", gap: 10, color: "#ccc", fontSize: 13 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
                {MockupComponent && <MockupComponent />}
              </div>
            );
          })}
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" style={{ padding: "80px 24px", borderTop: `1px solid ${BORDER}`, textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: LIME, marginBottom: 14, textTransform: "uppercase" }}>Sin sorpresas</div>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: -2, marginBottom: 10 }}>Precios para el mercado de RD</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 50 }}>Sin tarjeta de crédito para el plan gratuito. Ve el producto antes de comprometerte.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, maxWidth: 860, margin: "0 auto" }}>
          {pricing.map((p) => (
            <div key={p.name} style={{ background: p.highlight ? LIME : CARD_BG, border: p.highlight ? "none" : `1px solid ${BORDER}`, borderRadius: 16, padding: "36px 28px", textAlign: "left", position: "relative" }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#fff", color: BG, borderRadius: 20, padding: "3px 14px", fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  Más popular
                </div>
              )}
              <div style={{ fontWeight: 900, fontSize: 20, color: p.highlight ? BG : "#fff", marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 10 }}>
                <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -2, color: p.highlight ? BG : LIME }}>{p.price}</span>
                {p.period && <span style={{ fontSize: 14, color: p.highlight ? "#333" : "#666" }}>{p.period}</span>}
              </div>
              <p style={{ fontSize: 13, color: p.highlight ? "#333" : "#666", marginBottom: 24, lineHeight: 1.5 }}>{p.desc}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
                {p.limits.map((l) => (
                  <li key={l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: p.highlight ? BG : "#ccc" }}>
                    <span style={{ color: p.highlight ? BG : LIME, fontSize: 14, fontWeight: 900 }}>✓</span>
                    {l}
                  </li>
                ))}
              </ul>
              <a href="#acceso" style={{ display: "block", textAlign: "center", background: p.highlight ? BG : LIME, color: p.highlight ? LIME : BG, borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 13, letterSpacing: 1, textDecoration: "none", textTransform: "uppercase" }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="acceso" style={{ padding: "100px 24px", borderTop: `1px solid ${BORDER}`, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 20 }}>🇩🇴</div>
        <h2 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900, letterSpacing: -2, margin: "0 0 16px" }}>
          El CRM que el realtor<br />dominicano estaba esperando.
        </h2>
        <p style={{ color: "#666", fontSize: 15, maxWidth: 420, margin: "0 auto 44px", lineHeight: 1.6 }}>
          Solicita tu acceso anticipado. Sin tarjeta de crédito. Sin compromisos.
        </p>
        <div style={{ display: "flex", gap: 12, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            placeholder="tu@email.com"
            style={{ flex: 1, minWidth: 220, background: CARD_BG, border: `1px solid ${BORDER}`, color: "#fff", borderRadius: 8, padding: "14px 18px", fontSize: 14, outline: "none" }}
          />
          <button style={{ background: LIME, color: BG, borderRadius: 8, padding: "14px 28px", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>
            Solicitar Acceso
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "28px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -1 }}>SECTOR<span style={{ color: LIME }}>.</span></div>
        <div style={{ color: "#444", fontSize: 12 }}>sector.do · CRM para Realtors en República Dominicana · Junio 2026</div>
      </footer>

      <style>{`* { box-sizing: border-box; } body { margin: 0; } input::placeholder { color: #444; }`}</style>
    </div>
  );
}
