'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '../../app/lib/supabase'

interface Propiedad {
  id: string
  nombre: string
  ubicacion: string
  precio: string
  area: string
  tipo: string
  imagen?: string
  descripcion?: string
  recamaras?: number
  banos?: number
  estacionamientos?: number
  estado?: string
  fecha_disponible?: string
  notas?: string
}

interface Cliente {
  id: string
  nombre: string
  etapa: string
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [clientesAsignados, setClientesAsignados] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(false)

  // Form state
  const [form, setForm] = useState<Partial<Propiedad>>({})

  useEffect(() => {
    cargar()
  }, [id])

  const cargar = async () => {
    setCargando(true)
    const { data: prop } = await supabase
      .from('propiedades')
      .select('*')
      .eq('id', id)
      .single()

    if (prop) {
      setPropiedad(prop)
      setForm(prop)
    }

    // Cargar clientes que tienen esta propiedad asignada
    const { data: asignaciones } = await supabase
      .from('clientes_propiedades')
      .select('cliente_id, clientes(id, nombre, etapa)')
      .eq('propiedad_id', id)

    if (asignaciones) {
      const clientes = asignaciones
        .map((a: any) => a.clientes)
        .filter(Boolean) as Cliente[]
      setClientesAsignados(clientes)
    }

    setCargando(false)
  }

  const guardar = async () => {
    if (!propiedad) return
    setGuardando(true)
    await supabase.from('propiedades').update(form).eq('id', id)
    setPropiedad({ ...propiedad, ...form })
    setEditando(false)
    setGuardando(false)
  }

  const eliminar = async () => {
    await supabase.from('propiedades').delete().eq('id', id)
    router.push('/properties')
  }

  const etapaColor: Record<string, string> = {
    LEAD: '#3b82f6',
    BUSCANDO: '#d4af37',
    'EN OFERTA': '#10b981',
    CIERRE: '#a855f7',
  }

  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '2px' }}>CARGANDO...</div>
      </div>
    )
  }

  if (!propiedad) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>Propiedad no encontrada</div>
        <Link href="/properties" style={{ color: '#d4af37', fontSize: '14px' }}>← Volver a propiedades</Link>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#12122a',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => router.push('/properties')}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Propiedad</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{propiedad.nombre}</div>
        </div>
        <button
          onClick={() => setEditando(!editando)}
          style={{
            background: editando ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${editando ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px',
            color: editando ? '#d4af37' : '#fff',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {editando ? '✕ Cancelar' : '✏️ Editar'}
        </button>
        {!editando && (
          <button
            onClick={() => setConfirmEliminar(true)}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            🗑️
          </button>
        )}
      </div>

      {/* Imagen principal */}
      <div style={{
        width: '100%',
        height: '220px',
        background: propiedad.imagen
          ? `url(${propiedad.imagen}) center/cover`
          : 'linear-gradient(135deg, #1e1e3f 0%, #2d2d5e 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        {!propiedad.imagen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            opacity: 0.3,
          }}>
            🏠
          </div>
        )}
        {/* Badge tipo */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(212,175,55,0.9)',
          color: '#000',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}>
          {propiedad.tipo || 'Propiedad'}
        </div>
        {/* Estado */}
        {propiedad.estado && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: propiedad.estado === 'Disponible' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {propiedad.estado}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Precio y ubicación */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#d4af37',
            marginBottom: '4px',
          }}>
            {propiedad.precio || 'Precio no definido'}
          </div>
          <div style={{
            fontSize: '15px',
            color: '#aaa',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            📍 {propiedad.ubicacion || 'Ubicación no definida'}
          </div>
        </div>

        {/* Métricas rápidas */}
        {(propiedad.area || propiedad.recamaras || propiedad.banos || propiedad.estacionamientos) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '20px',
          }}>
            {propiedad.area && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{propiedad.area}</div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>m²</div>
              </div>
            )}
            {propiedad.recamaras !== undefined && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{propiedad.recamaras}</div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Rec.</div>
              </div>
            )}
            {propiedad.banos !== undefined && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{propiedad.banos}</div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Baños</div>
              </div>
            )}
            {propiedad.estacionamientos !== undefined && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{propiedad.estacionamientos}</div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Est.</div>
              </div>
            )}
          </div>
        )}

        {/* Descripción */}
        {!editando ? (
          <>
            {propiedad.descripcion && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '1px', marginBottom: '8px' }}>DESCRIPCIÓN</div>
                <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>{propiedad.descripcion}</div>
              </div>
            )}

            {propiedad.notas && (
              <div style={{
                background: 'rgba(212,175,55,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '1px', marginBottom: '8px' }}>NOTAS PRIVADAS</div>
                <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>{propiedad.notas}</div>
              </div>
            )}
          </>
        ) : (
          /* Formulario de edición */
          <div style={{
            background: 'rgba(212,175,55,0.04)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '13px', color: '#d4af37', fontWeight: 600, marginBottom: '16px', letterSpacing: '1px' }}>EDITAR PROPIEDAD</div>
            {[
              { label: 'Nombre', key: 'nombre', placeholder: 'Ej: Penthouse Polanco' },
              { label: 'Ubicación', key: 'ubicacion', placeholder: 'Ej: Polanco, CDMX' },
              { label: 'Precio', key: 'precio', placeholder: 'Ej: $2,500,000 USD' },
              { label: 'Área (m²)', key: 'area', placeholder: 'Ej: 250' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</label>
                <input
                  value={(form as any)[field.key] || ''}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '10px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {['recamaras', 'banos', 'estacionamientos'].map(key => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'capitalize' }}>{key === 'recamaras' ? 'Rec.' : key === 'banos' ? 'Baños' : 'Est.'}</label>
                  <input
                    type="number"
                    value={(form as any)[key] || ''}
                    onChange={e => setForm({ ...form, [key]: parseInt(e.target.value) || undefined })}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '10px 12px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Estado</label>
              <select
                value={form.estado || ''}
                onChange={e => setForm({ ...form, estado: e.target.value })}
                style={{
                  width: '100%',
                  background: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">Sin estado</option>
                <option value="Disponible">Disponible</option>
                <option value="En negociación">En negociación</option>
                <option value="Vendida">Vendida</option>
                <option value="Rentada">Rentada</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Tipo</label>
              <select
                value={form.tipo || ''}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
                style={{
                  width: '100%',
                  background: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                {['Apartamento', 'Casa', 'Villa', 'Penthouse', 'Local', 'Terreno', 'Oficina'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>URL Imagen</label>
              <input
                value={form.imagen || ''}
                onChange={e => setForm({ ...form, imagen: e.target.value })}
                placeholder="https://..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Descripción</label>
              <textarea
                value={form.descripcion || ''}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows={3}
                placeholder="Describe la propiedad..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase' }}>Notas privadas</label>
              <textarea
                value={form.notas || ''}
                onChange={e => setForm({ ...form, notas: e.target.value })}
                rows={2}
                placeholder="Notas internas del agente..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={guardar}
              disabled={guardando}
              style={{
                width: '100%',
                background: guardando ? 'rgba(212,175,55,0.3)' : '#d4af37',
                color: guardando ? '#888' : '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: guardando ? 'default' : 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              {guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
          </div>
        )}

        {/* Clientes interesados */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '80px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '1px' }}>
              CLIENTES INTERESADOS ({clientesAsignados.length})
            </div>
          </div>
          {clientesAsignados.length === 0 ? (
            <div style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
              Ningún cliente tiene esta propiedad asignada
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clientesAsignados.map(cliente => (
                <Link
                  key={cliente.id}
                  href={`/clients/${cliente.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.2)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#d4af37',
                    flexShrink: 0,
                  }}>
                    {cliente.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{cliente.nombre}</div>
                    <div style={{
                      fontSize: '11px',
                      color: etapaColor[cliente.etapa] || '#888',
                      marginTop: '2px',
                    }}>
                      {cliente.etapa}
                    </div>
                  </div>
                  <div style={{ color: '#555', fontSize: '16px' }}>→</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {confirmEliminar && (
        <div
          onClick={() => setConfirmEliminar(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1e1e3f',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>¿Eliminar propiedad?</div>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '24px' }}>
              Esta acción eliminará <strong style={{ color: '#fff' }}>{propiedad.nombre}</strong> y no se puede deshacer.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmEliminar(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                style={{
                  flex: 1,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: '10px',
                  color: '#ef4444',
                  padding: '14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
