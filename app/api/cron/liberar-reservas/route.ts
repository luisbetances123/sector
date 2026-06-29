import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Inicialización segura que no rompe el build si faltan variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: Request) {
  // Verificar autorización simple para el cron
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials missing')
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }

  // Se crea la instancia dentro del handler en runtime
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener unidades reservadas
  const { data: unidades, error: errorUnidades } = await supabase
    .from('unidades')
    .select('id, numero, estado, reservado_hasta')
    .eq('estado', 'reservado')

  if (errorUnidades) {
    return NextResponse.json({ error: errorUnidades.message }, { status: 500 })
  }

  const ahora = new Date()
  let liberadas = 0
  const unidadesVencidas = []

  for (const unidad of (unidades || [])) {
    if (!unidad.reservado_hasta) continue
    
    const fechaReserva = new Date(unidad.reservado_hasta)
    const diferenciaHoras = (ahora.getTime() - fechaReserva.getTime()) / (1000 * 60 * 60)

    // Si pasaron más de 48 horas
    if (diferenciaHoras >= 48) {
      unidadesVencidas.push(unidad)

      // 1. Actualizar estado de la unidad
      const { error: errorUpdate } = await supabase
        .from('unidades')
        .update({ estado: 'libre', reservado_hasta: null, reservado_por: null })
        .eq('id', unidad.id)

      // 2. Registrar en el historial de cambios
      const { error: errorInsert } = await supabase.from('unidad_historial').insert([{
        unidad_id: unidad.id,
        estado_anterior: 'reservado',
        estado_nuevo: 'libre',
        actor: 'Sistema automático',
        nota: 'Reserva de 48h expirada automáticamente',
      }])

      if (errorUpdate || errorInsert) {
        console.error(`Error liberando unidad ${unidad.id}:`, errorUpdate?.message ?? errorInsert?.message)
      } else {
        liberadas++
      }
    }
  }

  return NextResponse.json({
    mensaje: `${liberadas} unidad(es) liberada(s) automáticamente`,
    liberadas,
    unidades: unidadesVencidas.map(u => u.numero),
  })
}
