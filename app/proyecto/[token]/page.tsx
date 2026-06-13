'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

const LIME = "#CCFF00";
const BG = "#09090b";
const BORDER = "#1a1a1d";

interface Unidad {
  id: string;
  numero: string;
  piso: number | null;
  tipo: string | null;
  estado: string;
  precio: number | null;
  area_m2: number | null;
  recamaras: number | null;
  banos: number | null;
  vista: string | null;
  reservado_por: string | null;
}

interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: string | null;
  sector: string | null;
  pisos: number | null;
  unidades_total: number | null;
  porcentaje_avance: number;
  fecha_entrega_estimada: string | null;
  imagen_url: string | null;
}

interface Acceso {
  id: string;
  nombre_agencia: string | null;
  proyecto_id: string;
}

const ESTADO_COLORES: Record<string, string> = {
  libre: '#22c55e',
  reservado: '#f59e0b',
  vendido: '#ef4444',
};

const ESTADO_TEXTO: Record<string, string> = {
  libre: 'Libre',
  reservado: 'Reservado',
  vendido: 'Vendido',
};

export default function PortalBrokerPage() {
  const params = useParams();
  const token = params?.token as string;

  const [acceso, setAcceso] = useState<Acceso | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<Unidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [noValido, setNoValido] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [nombreBroker, setNombreBroker] = useState('');
  const [reservando, setReservando] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);

  useEffect(() => {
    if (token) cargarPortal();
  }, [token]);

  const cargarPortal = async () => {
    console.log('Token buscado:', token);

    const { data: accesoData, error: accesoError } = await supabase
      .from('proyecto_accesos')
      .select('id, nombre_agencia, proyecto_id')
      .eq('token', token)
      .eq('activo', true)
      .single();

    console.log('Acceso data:', accesoData);
    console.log('Acceso error:', accesoError);

    if (!accesoData) { setNoValido(true); setLoading(false); return; }
    setAcceso(accesoData);

    const { data: proyectoData } = await supabase
      .from('proyectos')
      .select('*')
      .eq('id', accesoData.proyecto_id)
      .single();

    if (proyectoData) setProyecto(proyectoData);

    const { data: unidadesData } = await supabase
      .from('unidades')
      .select('*')
      .eq('proyecto_id', accesoData.proyecto_id)
      .order('piso', { ascending: true });

    if (unidadesData) setUnidades(unidadesData);
    setLoading(false);
  };

  const reservarUnidad = async () => {
    if (!unidadSeleccionada || !nombreBroker.trim()) return;
    setReservando(true);

    const reservadoHasta = new Date();
    reservadoHasta.setHours(reservadoHasta.getHours() + 48);

    await supabase.from('unidades').update({
      estado: 'reservado',
      reservado_por: nombreBroker,
      reservado_hasta: reservadoHasta.toISOString(),
    }).eq('id', unidadSeleccionada.id);

    setReservaExitosa(true);
    setReservando(false);
    cargarPortal();
    setTimeout(() => {
      setUnidadSeleccionada(null);
      setReservaExitosa(false);
      setNombreBroker('');
    }, 3000);
  };

  const pisos = [...new Set(unidades.map(u => u.piso))].sort((a, b) => (b || 0) - (a || 0));
  const unidadesFiltradas = filtro === 'todos' ? unidades : unidades.filter(u => u.estado === filtro);
  const conteo = {
    libre: unidades.filter(u => u.estado === 'libre').length,
    reservado: unidades.filter(u => u.estado === 'reservado').length,
    vendido: unidades.filter(u => u.estado === 'vendido').length,
  };

  if (loading) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
      Cargando inventario...
    </div>
  );

  if (noValido) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Acceso no válido</h1>
      <p style={{ fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>Este enlace no existe, ha expirado o fue desactivado. Contacta a la constructora para obtener un nuevo acceso.</p>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ background: '#0d0d0f', borderBottom: `1px solid ${BORDER}`, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -1 }}>
          SECTOR<span style={{ color: LIME }}>.</span>
        </div>
        {acceso?.nombre_agencia && (
          <div style={{ background: LIME + '15', border: `1px solid ${LIME}30`, color: LIME, borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>
            {acceso.nombre_agencia}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {proyecto && (
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: -1.5, margin: '0 0 8px' }}>{proyecto.nombre}</h1>
            {proyecto.sector && (
              <span style={{ background: LIME + '15', color: LIME, border: `1px solid ${LIME}30`, borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                {proyecto.sector}
              </span>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginTop: 20 }}>
              {[
                { label: 'Pisos', value: proyecto.pisos || '—' },
                { label: 'Unidades', value: proyecto.unidades_total || '—' },
                { label: 'Avance', value: `${proyecto.porcentaje_avance}%` },
                { label: 'Entrega', value: proyecto.fecha_entrega_estimada ? new Date(proyecto.fecha_entrega_estimada).toLocaleDateString('es-DO', { month: 'short', year: 'numeric' }) : '—' },
              ].map(item => (
                <div key={item.label} style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ color: LIME, fontWeight: 900, fontSize: 20, fontFamily: 'monospace' }}>{item.value}</div>
                  <div style={{ color: '#666', fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, background: '#111', borderRadius: 4, height: 4 }}>
              <div style={{ background: LIME, height: 4, borderRadius: 4, width: `${proyecto.porcentaje_avance}%`, transition: 'width 1s' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Disponibles', value: conteo.libre, color: '#22c55e', border: '#22c55e30' },
            { label: 'Reservadas', value: conteo.reservado, color: '#f59e0b', border: '#f59e0b30' },
            { label: 'Vendidas', value: conteo.vendido, color: '#ef4444', border: '#ef444430' },
          ].map(c => (
            <div key={c.label} style={{ background: '#111', border: `1px solid ${c.border}`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ color: c.color, fontWeight: 900, fontSize: 28, fontFamily: 'monospace' }}>{c.value}</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['todos', 'libre', 'reservado', 'vendido'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ background: filtro === f ? LIME : '#111', color: filtro === f ? BG : '#aaa', border: `1px solid ${filtro === f ? LIME : BORDER}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {f === 'todos' ? 'Todas' : ESTADO_TEXTO[f]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pisos.map(piso => {
            const unidadesPiso = unidadesFiltradas.filter(u => u.piso === piso);
            if (unidadesPiso.length === 0) return null;
            return (
              <div key={piso} style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ color: '#555', fontSize: 11, fontFamily: 'monospace', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Piso {piso}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {unidadesPiso.map(u => (
                    <button key={u.id}
                      onClick={() => u.estado === 'libre' ? setUnidadSeleccionada(u) : null}
                      style={{
                        background: ESTADO_COLORES[u.estado],
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: u.estado === 'libre' ? 'pointer' : 'default',
                        opacity: u.estado === 'vendido' ? 0.6 : 1,
                        transition: 'transform 0.1s',
                        minWidth: 64,
                        textAlign: 'center',
                      }}>
                      {u.numero}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[['#22c55e', 'Libre — toca para reservar'], ['#f59e0b', 'Reservado'], ['#ef4444', 'Vendido']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              <span style={{ color: '#666', fontSize: 12 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {unidadSeleccionada && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 }}>
          <div style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, width: '100%', maxWidth: 420 }}>
            {reservaExitosa ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ color: LIME, fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>¡Reserva confirmada!</h3>
                <p style={{ color: '#aaa', fontSize: 14 }}>Unidad {unidadSeleccionada.numero} reservada por 48 horas.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                  <div>
                    <div style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Reservar Unidad</div>
                    <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>{unidadSeleccionada.numero}</h3>
                  </div>
                  <button onClick={() => setUnidadSeleccionada(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 20 }}>✕</button>
                </div>

                <div style={{ background: '#0d0d0f', borderRadius: 12, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {unidadSeleccionada.precio && <div><div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>Precio</div><div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'monospace' }}>${Number(unidadSeleccionada.precio).toLocaleString()}</div></div>}
                  {unidadSeleccionada.area_m2 && <div><div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>Área</div><div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{unidadSeleccionada.area_m2} m²</div></div>}
                  {unidadSeleccionada.recamaras && <div><div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>Habitaciones</div><div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{unidadSeleccionada.recamaras}</div></div>}
                  {unidadSeleccionada.vista && <div><div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>Vista</div><div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{unidadSeleccionada.vista}</div></div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 8 }}>Tu nombre o el de tu agencia</label>
                  <input
                    type="text" value={nombreBroker} onChange={e => setNombreBroker(e.target.value)}
                    placeholder="Ej. Juan Pérez / Remax Capital"
                    style={{ width: '100%', background: '#0d0d0f', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <p style={{ color: '#555', fontSize: 12, lineHeight: 1.5, marginBottom: 20 }}>
                  Esta reserva bloquea la unidad por 48 horas. La constructora recibirá una notificación inmediata.
                </p>

                <button onClick={reservarUnidad} disabled={reservando || !nombreBroker.trim()}
                  style={{ width: '100%', background: nombreBroker.trim() ? LIME : '#333', color: nombreBroker.trim() ? BG : '#666', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 800, fontSize: 15, cursor: nombreBroker.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                  {reservando ? 'Reservando...' : 'Confirmar Reserva de 48h'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
}