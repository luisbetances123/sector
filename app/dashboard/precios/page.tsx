"use client";

export default function PreciosPage() {
  const planes = [
    {
      nombre: 'Explorador',
      precio: 'Gratis',
      descripcion: 'Para conocer SECTOR sin compromiso',
      actual: true,
      features: [
        '1 proyecto activo',
        'Hasta 20 unidades',
        'Portal de brokers',
        'Mapa de disponibilidad',
        'Sin plan de pago',
        'Sin incidencias',
      ],
    },
    {
      nombre: 'Profesional',
      precio: '$49',
      periodo: '/mes',
      descripcion: 'Para constructoras activas',
      popular: true,
      features: [
        '3 proyectos simultáneos',
        'Unidades ilimitadas',
        'Portal de brokers con firma',
        'Planes de pago automatizados',
        'Portal de incidencias',
        'Historial de movimientos',
        'Soporte prioritario',
      ],
    },
    {
      nombre: 'Empresa',
      precio: '$99',
      periodo: '/mes',
      descripcion: 'Para grupos inmobiliarios',
      features: [
        'Proyectos ilimitados',
        'Unidades ilimitadas',
        'Multi-usuario con roles',
        'Reportes avanzados',
        'API de integración',
        'Onboarding dedicado',
        'Soporte 24/7',
      ],
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-transparent text-zinc-100">
      <div className="mb-10 border-b border-zinc-800 pb-5">
        <p className="text-xs text-[#d4ff3b] font-mono uppercase tracking-widest mb-1">Planes</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Simple y transparente</h1>
        <p className="text-sm text-white mt-1">Sin tarjeta de crédito para empezar. Sin sorpresas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map((plan) => (
          <div key={plan.nombre} className={`relative bg-[#18181b] border rounded-2xl p-6 flex flex-col ${plan.popular ? 'border-[#d4ff3b]/50 shadow-[0_0_30px_rgba(212,255,59,0.08)]' : 'border-zinc-800'}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#d4ff3b] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Más popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-white font-bold text-lg">{plan.nombre}</h2>
              <p className="text-white text-xs mt-1">{plan.descripcion}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className={`font-black text-4xl tracking-tight ${plan.popular ? 'text-[#d4ff3b]' : 'text-white'}`}>
                  {plan.precio}
                </span>
                {plan.periodo && <span className="text-white text-sm mb-1">{plan.periodo}</span>}
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white">
                  <span className="text-[#d4ff3b] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-xl text-sm font-bold transition ${
              plan.actual ? 'bg-zinc-800 text-white cursor-default' :
              plan.popular ? 'bg-[#d4ff3b] hover:bg-[#c2eb30] text-black' :
              'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
            }`}>
              {plan.actual ? 'Plan actual' : plan.nombre === 'Empresa' ? 'Contactar ventas' : 'Empezar ahora'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-[#18181b] border border-zinc-800 rounded-2xl p-6 text-center">
        <p className="text-white text-sm">¿Preguntas? Escríbenos a <span className="text-[#d4ff3b]">ventas@sector.do</span></p>
      </div>
    </div>
  );
}
