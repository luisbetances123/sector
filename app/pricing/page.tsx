"use client";

const PLANES = [
  {
    nombre: "Explorador",
    precio: 0,
    descripcion: "Para conocer SECTOR sin compromiso",
    color: "border-zinc-800",
    btnClass: "bg-zinc-800 text-zinc-400 cursor-default",
    btnText: "Plan actual",
    features: [
      "5 propiedades",
      "10 clientes",
      "Pipeline básico",
      "Calendario",
      "Portal público",
      "Sin exportación PDF",
      "Sin AI",
    ]
  },
  {
    nombre: "Profesional",
    precio: 25,
    descripcion: "Para el realtor independiente activo",
    color: "border-[#CCFF00]/30",
    highlight: true,
    btnClass: "bg-[#CCFF00] text-black hover:bg-[#b8e600]",
    btnText: "Empezar ahora",
    features: [
      "25 propiedades",
      "Clientes ilimitados",
      "Pipeline completo",
      "Exportación PDF",
      "AI básico por deal",
      "Conversaciones",
      "Recordatorios",
    ]
  },
  {
    nombre: "Agencia",
    precio: 49,
    descripcion: "Para agencias pequeñas y medianas",
    color: "border-zinc-700",
    btnClass: "bg-zinc-100 text-black hover:bg-white",
    btnText: "Contactar ventas",
    features: [
      "Propiedades ilimitadas",
      "Clientes ilimitados",
      "Multi-usuario (admin + agentes)",
      "Pipeline completo",
      "Exportación PDF",
      "AI completo",
      "Reportes avanzados",
      "Soporte prioritario",
    ]
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-xs font-mono text-[#CCFF00] uppercase tracking-widest">Planes</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white mt-2">Simple y transparente</h1>
        <p className="text-zinc-500 text-sm mt-2">Sin tarjeta de crédito para empezar. Sin sorpresas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {PLANES.map(plan => (
          <div key={plan.nombre} className={`bg-zinc-950 border-2 ${plan.color} rounded-2xl p-8 flex flex-col relative`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CCFF00] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Más popular
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-lg font-black text-white">{plan.nombre}</h2>
              <p className="text-zinc-500 text-xs mt-1">{plan.descripcion}</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-white font-mono">
                  {plan.precio === 0 ? 'Gratis' : `$${plan.precio}`}
                </span>
                {plan.precio > 0 && <span className="text-zinc-500 text-sm">/mes</span>}
              </div>
            </div>

            <ul className="space-y-2.5 flex-1 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="text-[#CCFF00] font-black">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => plan.precio === 25 && (window.location.href = '/api/stripe/checkout')}
              className={`w-full py-3 rounded-xl text-xs font-black transition-colors ${plan.btnClass}`}>
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-xs font-mono mt-12 text-center">
        ¿Preguntas? Escríbenos a ventas@sector.do
      </p>
    </div>
  )
}
