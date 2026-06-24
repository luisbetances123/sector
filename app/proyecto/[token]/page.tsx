'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase';
import PortalBrokerClient from './PortalBrokerClient';

const BG = "#09090b";

export default function PortalBrokerPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function cargar() {
      const supabase = createClient();
      const { data: accesoArray } = await supabase
        .from('proyecto_accesos')
        .select('id, nombre_agencia, proyecto_id')
        .eq('token', token)
        .eq('activo', true)
        .limit(1);

      const acceso = accesoArray?.[0] ?? null;
      if (!acceso) { setError(true); setLoading(false); return; }

      const { data: proyecto } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', acceso.proyecto_id)
        .single();

      const { data: unidades } = await supabase
        .from('unidades')
        .select('*')
        .eq('proyecto_id', acceso.proyecto_id)
        .order('piso', { ascending: true });

      setData({ acceso, proyecto, unidades: unidades || [] });
      setLoading(false);
    }
    cargar();
  }, [token]);

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontFamily: 'Inter, sans-serif' }}>
      <p>Cargando...</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Acceso no válido</h1>
      <p style={{ fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>Este enlace no existe, ha expirado o fue desactivado.</p>
    </div>
  );

  return <PortalBrokerClient acceso={data.acceso} proyecto={data.proyecto} unidadesIniciales={data.unidades} />;
}
