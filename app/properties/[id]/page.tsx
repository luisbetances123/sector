'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '../../app/lib/supabase'

interface Propiedad {
  id: string; nombre: string; ubicacion: string; precio: string; area: string; tipo: string
  imagen?: string; descripcion?: string; recamaras?: number; banos?: number
  estacionamientos?: number; estado?: string; notas?: string
}
interface Cliente { id: string; nombre: string; etapa: string }

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [clientesAsignados, setClientesAsignados] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(false)
  const [form, setForm] = useState<Partial<Propiedad>>({})
  const [fotoActual, setFotoActual] = useState(0)

  useEffect(() => { cargar() }, [id])

  const cargar = async () => {
    setCargando(true)
    const { data: prop } = await supabase.from('propiedades').select('*').eq('id', id).single()
    if (prop) { setPropiedad(prop); setForm(prop) }
    const { data: asignaciones } = await supabase.from('clientes_propiedades').select('cliente_id, clientes(id, nombre, etapa)').eq('propiedad_id', id)
    if (asignaciones) setClientesAsignados(asignaciones.map((a: any) => a.clientes).filter(Boolean) as Cliente[])
    setCargando(false)
  }

  const guardar = async () => {
    if (!propiedad) return
    setGuardando(true)
    await supabase.from('propiedades').update(form).eq('id', id)
    setPropiedad({ ...propiedad, ...form })
    setEditando(false); setGuardando(false)
  }

  const eliminar = async () => {
    await supabase.from('propiedades').delete().eq('id', id)
    router.push('/properties')
  }

  const etapaColor: Record<string, string> = { LEAD: '#3b82f6', BUSCANDO: '#d4af37', 'EN OFERTA': '#10b981', CIERRE: '#a855f7' }

  const fotos = propiedad?.imagen ? propiedad.imagen.split(',').map(f => f.trim()).filter(Boolean) : []
  const fotoAnterior = () => setFotoActual(f => (f - 1 + fotos.length) % fotos.length)
  const fotoSiguiente = () => setFotoActual(f => (f + 1) % fotos.length)

  if (cargando) return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#d4af37', letterSpacing: '4px', fontSize: '12px' }}>CARGANDO...</div></div>
  if (!propiedad) return <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}><div style={{ color: '#fff' }}>Propiedad no encontrada</div><Link href="/properties" style={{ color: '#d4af37', fontSize: '13px' }}>← Volver</Link></div>

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* HERO con carrusel */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Fotos con transición */}
        {fotos.length > 0 ? (
          <div style={{ position: 'absolute', inset: 0, transition: 'opacity 0.5s ease', background: `url(${fotos[fotoActual]}) center/cover no-repeat` }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#2d2d5e)' }} />
        )}

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.05) 35%,rgba(0,0,0,0.65) 65%,rgba(0,0,0,0.97) 100%)' }} />

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <button onClick={() => router.push('/properties')} style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', color: '#fff', padding: '10px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>← Catálogo</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditando(!editando)} style={{ background: editando ? 'rgba(212,175,55,0.9)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: `1px solid ${editando ? '#d4af37' : 'rgba(255,255,255,0.2)'}`, borderRadius: '50px', color: editando ? '#000' : '#fff', padding: '10px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{editando ? '✕ Cancelar' : '✏️ Editar'}</button>
            {!editando && <button onClick={() => setConfirmEliminar(true)} style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '50px', color: '#ef4444', padding: '10px 16px', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>}
          </div>
        </div>

        {/* Badges */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(212,175,55,0.9)', color: '#000', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{propiedad.tipo || 'Propiedad'}</div>
          {propiedad.estado && <div style={{ background: propiedad.estado === 'Disponible' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.85)', color: '#fff', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{propiedad.estado}</div>}
        </div>

        {/* Flechas carrusel — solo si hay más de 1 foto */}
        {fotos.length > 1 && (
          <>
            <button onClick={fotoAnterior} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={fotoSiguiente} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>
        )}

        <div style={{ flex: 1 }} />

        {/* Puntos de navegación */}
        {fotos.length > 1 && (
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', gap: '6px', paddingBottom: '12px' }}>
            {fotos.map((_, i) => (
              <button key={i} onClick={() => setFotoActual(i)} style={{ width: i === fotoActual ? '20px' : '6px', height: '6px', borderRadius: '3px', background: i === fotoActual ? '#d4af37' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
            ))}
          </div>
        )}

        {/* Contador fotos */}
        {fotos.length > 1 && (
          <div style={{ position: 'absolute', top: '80px', right: '24px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#fff' }}>
            {fotoActual + 1} / {fotos.length}
          </div>
        )}

        {/* Info anclada al fondo */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 24px 36px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>📍 {propiedad.ubicacion}</div>
          <div style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, lineHeight: 1.05, marginBottom: '20px' }}>{propiedad.nombre}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.45)', borderRadius: '50px', padding: '10px 22px', fontSize: '20px', fontWeight: 800, color: '#d4af37' }}>{propiedad.precio}</div>
            {propiedad.area && <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 18px', fontSize: '13px', fontWeight: 600 }}>{propiedad.area} m²</div>}
            {propiedad.recamaras != null && <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 18px', fontSize: '13px', fontWeight: 600 }}>🛏 {propiedad.recamaras} Rec.</div>}
            {propiedad.banos != null && <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 18px', fontSize: '13px', fontWeight: 600 }}>🚿 {propiedad.banos} Baños</div>}
            {propiedad.estacionamientos != null && <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50px', padding: '10px 18px', fontSize: '13px', fontWeight: 600 }}>🚗 {propiedad.estacionamientos} Est.</div>}
          </div>
        </div>
      </div>

      {/* Contenido debajo */}
      <div style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto' }}>
        {!editando ? (
          <>
            {propiedad.descripcion && <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}><div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '2px', marginBottom: '10px' }}>DESCRIPCIÓN</div><div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.7' }}>{propiedad.descripcion}</div></div>}
            {propiedad.notas && <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}><div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '2px', marginBottom: '10px' }}>NOTAS PRIVADAS</div><div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.7' }}>{propiedad.notas}</div></div>}
          </>
        ) : (
          <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: 700, marginBottom: '20px', letterSpacing: '2px' }}>EDITAR PROPIEDAD</div>
            {[['Nombre','nombre','Ej: Penthouse Polanco'],['Ubicación','ubicacion','Ej: Polanco'],['Precio','precio','Ej: $2.5M'],['Área','area','Ej: 250m²']].map(([label,key,ph]) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
                <input value={(form as any)[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              {[['recamaras','Rec.'],['banos','Baños'],['estacionamientos','Est.']].map(([key,label]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px' }}>{label}</label>
                  <input type="number" value={(form as any)[key] || ''} onChange={e => setForm({ ...form, [key]: parseInt(e.target.value) || undefined })} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '11px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            {[{label:'Estado',key:'estado',opts:['','Disponible','En negociación','Vendida','Rentada']},{label:'Tipo',key:'tipo',opts:['Apartamento','Casa','Villa','Penthouse','Local','Terreno','Oficina']}].map(({label,key,opts}) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
                <select value={(form as any)[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '11px 14px', fontSize: '14px', outline: 'none' }}>
                  {opts.map(o => <option key={o} value={o}>{o || 'Sin estado'}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fotos (URLs separadas por coma)</label>
              <textarea value={form.imagen || ''} onChange={e => setForm({ ...form, imagen: e.target.value })} rows={3} placeholder="https://foto1.jpg, https://foto2.jpg, https://foto3.jpg" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '11px 14px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Separa múltiples fotos con comas para crear un carrusel</div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción</label>
              <textarea value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} placeholder="Describe la propiedad..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '11px 14px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Notas privadas</label>
              <textarea value={form.notas || ''} onChange={e => setForm({ ...form, notas: e.target.value })} rows={2} placeholder="Notas internas..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '11px 14px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button onClick={guardar} disabled={guardando} style={{ width: '100%', background: guardando ? 'rgba(212,175,55,0.3)' : '#d4af37', color: guardando ? '#888' : '#000', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '14px', fontWeight: 700, cursor: guardando ? 'default' : 'pointer', letterSpacing: '1px' }}>{guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</button>
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '2px', marginBottom: '16px' }}>CLIENTES INTERESADOS ({clientesAsignados.length})</div>
          {clientesAsignados.length === 0 ? (
            <div style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>Ningún cliente tiene esta propiedad asignada</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clientesAsignados.map(cliente => (
                <Link key={cliente.id} href={`/clients/${cliente.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', textDecoration: 'none' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#d4af37', flexShrink: 0 }}>{cliente.nombre.split(' ').slice(0,2).map((n:string)=>n[0]).join('').toUpperCase()}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{cliente.nombre}</div><div style={{ fontSize: '11px', color: etapaColor[cliente.etapa]||'#888', marginTop: '2px' }}>{cliente.etapa}</div></div>
                  <div style={{ color: '#555', fontSize: '16px' }}>→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmEliminar && (
        <div onClick={() => setConfirmEliminar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '24px 24px 0 0', padding: '28px 24px', width: '100%', maxWidth: '600px' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>¿Eliminar propiedad?</div>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '24px' }}>Eliminarás <strong style={{ color: '#fff' }}>{propiedad.nombre}</strong> y no se puede deshacer.</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmEliminar(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '16px', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
              <button onClick={eliminar} style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', color: '#ef4444', padding: '16px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
