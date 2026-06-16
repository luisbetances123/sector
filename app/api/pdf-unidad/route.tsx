import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0a0a0a',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  logo: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#d4ff3b',
    letterSpacing: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  constructoraNombre: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  fechaDoc: {
    fontSize: 8,
    color: '#71717a',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#1c1c1f',
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 8,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titulo: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 11,
    color: '#a1a1aa',
    marginBottom: 24,
  },
  seccionLabel: {
    fontSize: 8,
    color: '#71717a',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  grid2: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 12,
  },
  cardLabel: {
    fontSize: 7,
    color: '#71717a',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 13,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  cardValueAccent: {
    fontSize: 14,
    color: '#d4ff3b',
    fontFamily: 'Helvetica-Bold',
  },
  seccion: {
    marginBottom: 20,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 2,
  },
  tablaHeaderText: {
    fontSize: 7,
    color: '#71717a',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tablaFila: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
    alignItems: 'center',
  },
  tablaTexto: {
    fontSize: 9,
    color: '#ffffff',
  },
  tablaTextoGris: {
    fontSize: 9,
    color: '#71717a',
  },
  tablaTextoPagado: {
    fontSize: 9,
    color: '#4ade80',
    fontFamily: 'Helvetica-Bold',
  },
  tablaTextoVencido: {
    fontSize: 9,
    color: '#f87171',
    fontFamily: 'Helvetica-Bold',
  },
  resumenBox: {
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  resumenFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumenLabel: {
    fontSize: 9,
    color: '#a1a1aa',
  },
  resumenValor: {
    fontSize: 9,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  barraFondo: {
    backgroundColor: '#27272a',
    borderRadius: 4,
    height: 6,
    marginTop: 8,
  },
  barraProgreso: {
    backgroundColor: '#d4ff3b',
    borderRadius: 4,
    height: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 7,
    color: '#52525b',
  },
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const unidadId = searchParams.get('unidadId')

  if (!unidadId) {
    return NextResponse.json({ error: 'unidadId requerido' }, { status: 400 })
  }

  // Cargar datos
  const { data: unidad } = await supabase.from('unidades').select('*').eq('id', unidadId).single()
  if (!unidad) return NextResponse.json({ error: 'Unidad no encontrada' }, { status: 404 })

  const { data: proyecto } = await supabase.from('proyectos').select('*, constructoras(nombre, email, telefono)').eq('id', unidad.proyecto_id).single()
  const { data: plan } = await supabase.from('planes_pago').select('*').eq('unidad_id', unidadId).maybeSingle()
  const { data: cuotas } = plan
    ? await supabase.from('cuotas').select('*').eq('plan_id', plan.id).order('numero')
    : { data: [] }

  const hoy = new Date().toISOString().split('T')[0]
  const totalPagado = (cuotas || []).filter(c => c.estado === 'pagado').reduce((s, c) => s + c.monto, 0)
  const progreso = plan ? Math.round((totalPagado / plan.precio_total) * 100) : 0
  const constructoraNombre = proyecto?.constructoras?.nombre || 'SECTOR'
  const fechaDoc = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })

  const estadoColor = unidad.estado === 'libre' ? '#4ade80' : unidad.estado === 'reservado' ? '#fbbf24' : '#f87171'

  const pdf = await renderToBuffer(
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>SECTOR.</Text>
          <View style={styles.headerRight}>
            <Text style={styles.constructoraNombre}>{constructoraNombre}</Text>
            <Text style={styles.fechaDoc}>{fechaDoc}</Text>
            <View style={[styles.badge, { borderColor: estadoColor + '40', backgroundColor: estadoColor + '15' }]}>
              <Text style={[styles.badgeText, { color: estadoColor }]}>
                {unidad.estado === 'libre' ? 'DISPONIBLE' : unidad.estado === 'reservado' ? 'RESERVADO' : 'VENDIDO'}
              </Text>
            </View>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.titulo}>Unidad {unidad.numero}</Text>
        <Text style={styles.subtitulo}>
          {proyecto?.nombre || '—'} · {proyecto?.sector || proyecto?.ubicacion || 'República Dominicana'}
        </Text>

        {/* Especificaciones */}
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>Especificaciones</Text>
          <View style={styles.grid2}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Precio</Text>
              <Text style={styles.cardValueAccent}>
                ${unidad.precio ? Number(unidad.precio).toLocaleString() : '—'}
              </Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Área</Text>
              <Text style={styles.cardValue}>{unidad.area_m2 ? `${unidad.area_m2} m²` : '—'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Habitaciones</Text>
              <Text style={styles.cardValue}>{unidad.habitaciones || '—'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Baños</Text>
              <Text style={styles.cardValue}>{unidad.banos || '—'}</Text>
            </View>
          </View>
          <View style={styles.grid2}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Piso</Text>
              <Text style={styles.cardValue}>{unidad.piso || '—'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Tipo</Text>
              <Text style={styles.cardValue}>{unidad.tipo || '—'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Vista</Text>
              <Text style={styles.cardValue}>{unidad.vista || '—'}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Estacionamientos</Text>
              <Text style={styles.cardValue}>{unidad.estacionamientos || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Cliente */}
        {(unidad.cliente_nombre || unidad.reservado_por) && (
          <View style={styles.seccion}>
            <Text style={styles.seccionLabel}>Asignación</Text>
            <View style={styles.grid2}>
              {unidad.cliente_nombre && (
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Cliente</Text>
                  <Text style={styles.cardValue}>{unidad.cliente_nombre}</Text>
                </View>
              )}
              {unidad.reservado_por && (
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Broker</Text>
                  <Text style={styles.cardValue}>{unidad.reservado_por}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Plan de pago */}
        {plan && cuotas && cuotas.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionLabel}>Plan de Pago</Text>

            {/* Resumen */}
            <View style={styles.resumenBox}>
              <View style={styles.resumenFila}>
                <Text style={styles.resumenLabel}>Total del plan</Text>
                <Text style={styles.resumenValor}>${plan.precio_total.toLocaleString()}</Text>
              </View>
              <View style={styles.resumenFila}>
                <Text style={styles.resumenLabel}>Cobrado</Text>
                <Text style={[styles.resumenValor, { color: '#4ade80' }]}>${totalPagado.toLocaleString()}</Text>
              </View>
              <View style={styles.resumenFila}>
                <Text style={styles.resumenLabel}>Pendiente</Text>
                <Text style={[styles.resumenValor, { color: '#fbbf24' }]}>
                  ${(plan.precio_total - totalPagado).toLocaleString()}
                </Text>
              </View>
              <View style={styles.barraFondo}>
                <View style={[styles.barraProgreso, { width: `${progreso}%` }]} />
              </View>
              <Text style={[styles.resumenLabel, { marginTop: 4, textAlign: 'right' }]}>{progreso}% cobrado</Text>
            </View>

            {/* Tabla de cuotas */}
            <View style={styles.tablaHeader}>
              <Text style={[styles.tablaHeaderText, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tablaHeaderText, { flex: 3 }]}>Descripción</Text>
              <Text style={[styles.tablaHeaderText, { flex: 2 }]}>Vencimiento</Text>
              <Text style={[styles.tablaHeaderText, { flex: 1.5, textAlign: 'right' }]}>Monto</Text>
              <Text style={[styles.tablaHeaderText, { flex: 1.5, textAlign: 'right' }]}>Estado</Text>
            </View>

            {cuotas.slice(0, 20).map((c) => {
              const vencida = c.estado === 'pendiente' && c.fecha_vencimiento < hoy
              return (
                <View key={c.id} style={styles.tablaFila}>
                  <Text style={[styles.tablaTextoGris, { flex: 0.5 }]}>{c.numero}</Text>
                  <Text style={[styles.tablaTexto, { flex: 3 }]}>{c.descripcion}</Text>
                  <Text style={[styles.tablaTextoGris, { flex: 2 }]}>
                    {new Date(c.fecha_vencimiento).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={[styles.tablaTexto, { flex: 1.5, textAlign: 'right' }]}>${c.monto.toLocaleString()}</Text>
                  <Text style={[
                    c.estado === 'pagado' ? styles.tablaTextoPagado : vencida ? styles.tablaTextoVencido : styles.tablaTextoGris,
                    { flex: 1.5, textAlign: 'right' }
                  ]}>
                    {c.estado === 'pagado' ? 'Pagado' : vencida ? 'Vencida' : 'Pendiente'}
                  </Text>
                </View>
              )
            })}
            {cuotas.length > 20 && (
              <Text style={[styles.tablaTextoGris, { textAlign: 'center', marginTop: 8, fontSize: 8 }]}>
                + {cuotas.length - 20} cuotas adicionales no mostradas
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generado por SECTOR · sector.do</Text>
          <Text style={styles.footerText}>{constructoraNombre} · {fechaDoc}</Text>
        </View>

      </Page>
    </Document>
  )

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Unidad-${unidad.numero}-${proyecto?.nombre || 'SECTOR'}.pdf"`,
    },
  })
}
