import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen p-4">
      <div className="text-amber-500 font-bold text-xl mb-8 px-2">HOMVI</div>
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="block p-2 hover:bg-zinc-900 rounded text-zinc-400">Dashboard</Link>
        <Link href="/clients" className="block p-2 bg-zinc-900 rounded text-white font-medium">Clientes</Link>
      </nav>
    </div>
  );
}
