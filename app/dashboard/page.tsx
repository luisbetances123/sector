"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({ propiedades: 0, clientes: 0, loading: true });

  useEffect(() => {
    async function fetchData() {
      try {
        const { count: props } = await supabase.from('properties').select('*', { count: 'exact', head: true });
        const { count: clients } = await supabase.from('clients').select('*', { count: 'exact', head: true });
        setStats({ propiedades: props || 0, clientes: clients || 0, loading: false });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-10 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6">Dashboard de SECTOR</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
          <p className="text-zinc-400 text-sm">Propiedades en Inventario</p>
          <p className="text-4xl font-bold mt-2">{stats.loading ? '...' : stats.propiedades}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
          <p className="text-zinc-400 text-sm">Clientes Registrados</p>
          <p className="text-4xl font-bold mt-2">{stats.loading ? '...' : stats.clientes}</p>
        </div>
      </div>
    </div>
  );
}