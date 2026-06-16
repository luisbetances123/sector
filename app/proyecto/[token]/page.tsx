import { createServerClient } from '@/app/lib/supabase';
import PortalBrokerClient from './PortalBrokerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BG = "#09090b";

export default async function PortalBrokerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let supabase;
  try { supabase = await createServerClient(); } catch { return <div style={{background:"#09090b",minHeight:"100vh",color:"#aaa",display:"flex",alignItems:"center",justifyContent:"center"}}><p>Error de configuración.</p></div>; }

  const { data: accesoArray, error } = await supabase
    .from('proyecto_accesos')
    .select('id, nombre_agencia, proyecto_id')
    .eq('token', token)
    .eq('activo', true)
    .limit(1);

  console.log('[SERVER] token:', token, '| data:', accesoArray, '| error:', error);

  const acceso = accesoArray?.[0] ?? null;

  if (!acceso) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Acceso no válido</h1>
        <p style={{ fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>
          Este enlace no existe, ha expirado o fue desactivado. Contacta a la constructora para obtener un nuevo acceso.
        </p>
      </div>
    );
  }

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

  return (
    <PortalBrokerClient
      acceso={acceso}
      proyecto={proyecto ?? null}
      unidadesIniciales={unidades ?? []}
    />
  );
}
