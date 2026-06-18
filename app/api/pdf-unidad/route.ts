import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const unidadId = searchParams.get('unidadId')

  if (!unidadId) {
    return new NextResponse('unidadId requerido', { status: 400 })
  }

  const supabaseAdmin = getAdmin()

  const { data: unidad, error: errorUnidad } = await supabaseAdmin
    .from('unidades')
    .select('*, proyectos(nombre, constructoras(nombre))')
    .eq('id', unidadId)
    .single()

  if (errorUnidad || !unidad) {
    return new NextResponse('Unidad no encontrada', { status: 404 })
  }

  const { data: plan } = await supabaseAdmin
    .from('planes_pago')
    .select('*')
    .eq('unidad_id', unidadId)
    .maybeSingle()

  let cuotas: Array<{
    numero: number
    descripcion: string | null
    monto: number
    fecha_vencimiento: string
    estado: string
    fecha_pago: string | null
  }> = []
  if (plan) {
    const { data: c } = await supabaseAdmin
      .from('cuotas')
      .select('*')
      .eq('plan_id', plan.id)
      .order('numero')
    cuotas = c || []
  }

  const formatUSD = (n: number) =>
    'US$ ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  const estadoLabel: Record<string, string> = {
    libre: 'Libre',
    reservado: 'Reservado',
    vendido: 'Vendido',
  }

  const estadoColor: Record<string, string> = {
    libre: '#22c55e',
    reservado: '#f59e0b',
    vendido: '#ef4444',
  }

  const proyectoNombre =
    (unidad.proyectos as { nombre?: string } | null)?.nombre || '—'
  const constructoraNombre =
    (
      (unidad.proyectos as { constructoras?: { nombre?: string } } | null)
        ?.constructoras
    )?.nombre || '—'

  const totalPagado = cuotas
    .filter((c) => c.estado === 'pagado')
    .reduce((s, c) => s + c.monto, 0)
  const progreso = plan
    ? Math.round((totalPagado / plan.precio_total) * 100)
    : 0
  const hoy = new Date().toISOString().split('T')[0]

  const cuotasHTML =
    cuotas.length > 0
      ? `
    <div class="section-title">Plan de Pago</div>
    <div class="plan-header">
      <div>
        <span class="plan-label">Cliente</span>
        <span class="plan-value">${plan?.cliente_nombre || '—'}</span>
      </div>
      <div>
        <span class="plan-label">Precio total</span>
        <span class="plan-value highlight">${formatUSD(plan!.precio_total)}</span>
      </div>
      <div>
        <span class="plan-label">Cobrado</span>
        <span class="plan-value">${formatUSD(totalPagado)} (${progreso}%)</span>
      </div>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar" style="width: ${progreso}%"></div>
    </div>
    <table class="cuotas-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Descripción</th>
          <th>Vencimiento</th>
          <th>Monto</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${cuotas
          .map((c) => {
            const vencida =
              c.estado === 'pendiente' && c.fecha_vencimiento < hoy
            const estadoCuota = c.estado === 'pagado'
              ? 'Pagado'
              : vencida
              ? 'Vencida'
              : 'Pendiente'
            const colorCuota = c.estado === 'pagado'
              ? '#22c55e'
              : vencida
              ? '#ef4444'
              : '#888'
            return `<tr ${vencida ? 'style="background:#fff5f5"' : ''}>
              <td class="mono">${c.numero}</td>
              <td>${c.descripcion || '—'}</td>
              <td class="mono">${formatFecha(c.fecha_vencimiento)}</td>
              <td class="mono bold">${formatUSD(c.monto)}</td>
              <td><span style="color:${colorCuota};font-weight:700;font-size:11px">${estadoCuota}</span></td>
            </tr>`
          })
          .join('')}
      </tbody>
    </table>
  `
      : ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ficha Unidad ${unidad.numero} — SECTOR</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #fff; color: #111; -webkit-print-color-adjust: exact; }
  .page { width: 794px; min-height: 1123px; padding: 48px; margin: 0 auto; }
  .header { border-bottom: 3px solid #d4ff3b; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 26px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
  .logo span { color: #d4ff3b; background: #111; padding: 2px 6px; border-radius: 4px; }
  .meta { text-align: right; }
  .meta p { font-size: 10px; font-family: monospace; color: #888; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6; }
  .title-block { margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; }
  .title-block h1 { font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
  .title-block .sub { font-size: 13px; color: #555; margin-top: 4px; }
  .estado-badge { font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; border: 2px solid; text-transform: uppercase; letter-spacing: 1px; }
  .specs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .spec { border: 1px solid #e5e5e5; border-radius: 10px; padding: 14px; }
  .spec-label { font-size: 9px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 6px; }
  .spec-value { font-size: 20px; font-weight: 900; font-family: monospace; }
  .price-callout { background: #111; color: #d4ff3b; padding: 18px 24px; border-radius: 12px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; }
  .price-callout .price-label { font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; opacity: .7; }
  .price-callout .price-value { font-size: 30px; font-weight: 900; font-family: monospace; }
  .cliente-box { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; display: flex; gap: 40px; }
  .cliente-item .cl-label { font-size: 9px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
  .cliente-item .cl-value { font-size: 14px; font-weight: 700; }
  .notas { background: #f9f9f9; border-radius: 10px; padding: 16px 18px; margin-bottom: 28px; font-size: 13px; line-height: 1.6; color: #444; }
  .section-title { font-size: 9px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 12px; }
  .plan-header { display: flex; gap: 36px; margin-bottom: 12px; }
  .plan-label { font-size: 9px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 3px; }
  .plan-value { font-size: 14px; font-weight: 700; display: block; }
  .plan-value.highlight { color: #111; }
  .progress-bar-wrap { height: 6px; background: #e5e5e5; border-radius: 99px; margin-bottom: 20px; }
  .progress-bar { height: 6px; background: #d4ff3b; border-radius: 99px; }
  .cuotas-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .cuotas-table th { text-align: left; font-size: 9px; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #e5e5e5; padding: 8px 10px; }
  .cuotas-table td { padding: 9px 10px; border-bottom: 1px solid #f0f0f0; }
  .cuotas-table .mono { font-family: monospace; }
  .cuotas-table .bold { font-weight: 700; }
  .footer { margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; }
  .footer-text { font-size: 9px; color: #bbb; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; }
  .footer-dot { display: inline-block; width: 7px; height: 7px; background: #d4ff3b; border-radius: 50%; margin-right: 5px; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="logo">SEC<span>TOR</span></div>
    <div class="meta">
      <p>${constructoraNombre}</p>
      <p>${proyectoNombre}</p>
      <p>Generado ${new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <div class="title-block">
    <div>
      <h1>Unidad ${unidad.numero}</h1>
      <p class="sub">${unidad.tipo ? unidad.tipo.charAt(0).toUpperCase() + unidad.tipo.slice(1) : ''}${unidad.piso ? ` · Piso ${unidad.piso}` : ''}</p>
    </div>
    <span class="estado-badge" style="color:${estadoColor[unidad.estado] || '#888'};border-color:${estadoColor[unidad.estado] || '#888'}">
      ${estadoLabel[unidad.estado] || unidad.estado}
    </span>
  </div>

  ${
    unidad.precio
      ? `<div class="price-callout">
      <span class="price-label">Precio de Venta</span>
      <span class="price-value">${formatUSD(unidad.precio)}</span>
    </div>`
      : ''
  }

  <div class="specs">
    ${unidad.area_m2 ? `<div class="spec"><div class="spec-label">Área</div><div class="spec-value">${unidad.area_m2}<span style="font-size:14px;font-weight:400"> m²</span></div></div>` : ''}
    ${unidad.habitaciones != null ? `<div class="spec"><div class="spec-label">Habitaciones</div><div class="spec-value">${unidad.habitaciones}</div></div>` : ''}
    ${unidad.banos != null ? `<div class="spec"><div class="spec-label">Baños</div><div class="spec-value">${unidad.banos}</div></div>` : ''}
    ${unidad.estacionamientos != null ? `<div class="spec"><div class="spec-label">Parqueos</div><div class="spec-value">${unidad.estacionamientos}</div></div>` : ''}
    ${unidad.vista ? `<div class="spec"><div class="spec-label">Vista</div><div class="spec-value" style="font-size:14px">${unidad.vista}</div></div>` : ''}
    ${unidad.piso != null ? `<div class="spec"><div class="spec-label">Piso</div><div class="spec-value">${unidad.piso}</div></div>` : ''}
  </div>

  ${
    unidad.cliente_nombre || unidad.reservado_por
      ? `<div class="cliente-box">
      ${unidad.cliente_nombre ? `<div class="cliente-item"><div class="cl-label">Cliente</div><div class="cl-value">${unidad.cliente_nombre}</div></div>` : ''}
      ${unidad.reservado_por ? `<div class="cliente-item"><div class="cl-label">Broker</div><div class="cl-value">${unidad.reservado_por}</div></div>` : ''}
    </div>`
      : ''
  }

  ${unidad.notas ? `<div class="section-title">Notas</div><div class="notas">${unidad.notas}</div>` : ''}

  ${cuotasHTML}

  <div class="footer">
    <div class="footer-text"><span class="footer-dot"></span>sector.do — CRM para Constructoras en RD</div>
    <div class="footer-text">Ficha generada por SECTOR · ${new Date().getFullYear()}</div>
  </div>

</div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
