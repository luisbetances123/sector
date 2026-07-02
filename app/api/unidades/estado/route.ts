import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { unidad_id, estado_nuevo, actor, nota, broker_id } = await req.json()

    if (!unidad_id || !estado_nuevo || !actor) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const estadosValidos = ['libre', 'reservada', 'vendida']
    if (!estadosValidos.includes(estado_nuevo)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Leer estado actual
    const { data: unidad, error: errorLectura } = await supabase
      .from('unidades')
      .select('estado')
      .eq('id', unidad_id)
      .single()

    if (errorLectura || !unidad) {
      return NextResponse.json({ error: 'Unidad no encontrada' }, { status: 404 })
    }

    const estado_anterior = unidad.estado

    if (estado_anterior === estado_nuevo) {
      return NextResponse.json({ error: 'La unidad ya tiene ese estado' }, { status: 400 })
    }

    // 2. Actualizar estado en unidades
    const camposExtra: Record<string, unknown> = {}
    if (estado_nuevo === 'reservada') {
      camposExtra.fecha_reserva = new Date().toISOString()
      if (nota) camposExtra.reservado_por = nota
      if (broker_id) camposExtra.broker_id = broker_id
    }
    if (estado_nuevo === 'vendida') {
      camposExtra.fecha_venta = new Date().toISOString()
      if (nota) camposExtra.cliente_nombre = nota
    }
    if (estado_nuevo === 'libre') {
      camposExtra.fecha_reserva = null
      camposExtra.reservado_por = null
      camposExtra.cliente_nombre = null
      camposExtra.broker_id = null
    }

    const { error: errorUpdate } = await supabase
      .from('unidades')
      .update({ estado: estado_nuevo, ...camposExtra })
      .eq('id', unidad_id)

    if (errorUpdate) {
      return NextResponse.json({ error: errorUpdate.message }, { status: 500 })
    }

    // 3. Registrar en historial
    const { error: errorHistorial } = await supabase
      .from('unidad_historial')
      .insert({
        unidad_id,
        estado_anterior,
        estado_nuevo,
        actor,
        nota: nota || null,
      })

    if (errorHistorial) {
      return NextResponse.json({ error: errorHistorial.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, estado_anterior, estado_nuevo })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
