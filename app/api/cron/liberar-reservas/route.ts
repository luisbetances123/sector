import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ahora = new Date().toISOString()

  // Buscar todas las unidades reservadas cuya reserva ya venció
  const { data: unidadesVencidas, error } = await supabase
    .from('unidades')
    .select('id, numero, reservado_por, proyecto_id')
    .eq('estado', 'reservado')
    .lt('reservado_hasta', ahora)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!unidadesVencidas || unidadesVencidas.length === 0) {
    return NextResponse.json({ mensaje: 'Sin reservas vencidas', liberadas: 0 })
  }

  let liberadas = 0

  for (const unidad of unidadesVencidas) {
    // Liberar la unidad
    const { error: errorUpdate } = await supabase
      .from('unidades')
      .update({
        estado: 'libre',
        reservado_por: null,
        reservado_hasta: null,
        fecha_reserva: null,
      })
      .eq('id', unidad.id)

    if (!errorUpdate) {
      // Registrar en historial
      await supabase.from('unidad_historial').insert([{
        unidad_id: unidad.id,
        estado_anterior: 'reservado',
        estado_nuevo: 'libre',
        actor: 'Sistema automático',
        nota: 'Reserva de 48h expirada automáticamente',
      }])
      liberadas++
    }
  }

  return NextResponse.json({
    mensaje: `${liberadas} unidad(es) liberada(s) automáticamente`,
    liberadas,
    unidades: unidadesVencidas.map(u => u.numero),
  })
}
