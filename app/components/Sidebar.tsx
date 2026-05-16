import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen p-4">
      <div className="text-amber-500 font-bold text-xl mb-8 px-2">HOMVI</div>
      <nav className="flex flex-col space-y-1">
        <Link href="/dashboard" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Dashboard</Link>
        <Link href="/clients" className="block p-2 hover:bg-zinc-900 rounded text-white font-medium">Clientes</Link>
        <Link href="/properties" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Propiedades</Link>
        <Link href="/pipeline" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Pipeline</Link>
        <Link href="/calendar" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Calendario</Link>
        <Link href="/reports" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400 font-medium">Reportes</Link>
      </nav>
    </div>
  );
};
