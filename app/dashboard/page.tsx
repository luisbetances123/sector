'use client';

import React from 'react';

export default function DashboardPage() {
  // Datos simulados para tus paneles rápidos de Homvi
  const stats = [
    { name: 'Propiedades Activas', value: '6', change: '+1 esta semana', changeType: 'positive' },
    { name: 'Clientes Nuevos', value: '12', change: '+3 hoy', changeType: 'positive' },
    { name: 'Pipeline de Ventas', value: 'US$1.2M', change: 'En negociación', changeType: 'neutral' },
    { name: 'Citas Programadas', value: '4', change: 'Para esta semana', changeType: 'neutral' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Bienvenido a HOMVI. Aquí tienes el resumen general de tu actividad inmobiliaria.
        </p>
      </div>

      {/* Cuadrícula de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm shadow-md"
          >
            <dt className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              {item.name}
            </dt>
            <dd className="mt-2 flex items-baseline justify-between gap-x-2">
              <span className="text-2xl font-bold text-[#CCFF00] font-sans">
                {item.value}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {item.change}
              </span>
            </dd>
          </div>
        ))}
      </div>

      {/* Contenedor de Actividad Reciente o Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 min-h-[300px]">
          <h2 className="text-lg font-bold mb-4">Rendimiento Reciente</h2>
          <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-lg p-4 text-center">
            <p className="text-xs font-mono text-zinc-500">
              [ El gráfico de analíticas y leads se renderizará aquí ]
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Acciones Rápidas</h2>
          <div className="space-y-2">
            <a 
              href="/dashboard/properties" 
              className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-4 rounded-xl border border-zinc-800 text-xs transition-colors font-mono"
            >
              🏢 Gestionar Propiedades
            </a>
            <button className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-4 rounded-xl border border-zinc-800 text-xs transition-colors font-mono">
              👥 Ver Nuevos Clientes
            </button>
            <button className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-4 rounded-xl border border-zinc-800 text-xs transition-colors font-mono">
              📅 Revisar Calendario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}