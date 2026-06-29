import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!supabaseUrl || !supabaseServiceKey)
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const ahora = new Date()
  const en48h = new Date(ahora.getTime() + 48 * 60 * 60 * 1000).toISOString()
  const ahoraISO = ahora.toISOString()
  const hoyStr = ahoraISO.split('T')[0]

  const { data: unidades, error } = await supabase
    .from('unidades')
    .select('id, numero, reservado_hasta, reservado_por')
    .eq('estado', 'reservado')
    .gt('reservado_hasta', ahoraISO)
    .lt('reservado_hasta', en48h)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let alertas = 0
  for (const u of (unidades || [])) {
    // Deduplicar: no insertar si ya hay alerta de hoy para esta unidad
    const { data: yaExiste } = await supabase
      .from('inbox')
      .select('id')
      .eq('canal', 'sistema')
      .gte('created_at', hoyStr + 'T00:00:00')
      .ilike('mensaje', `%Unidad ${u.numero}%`)
      .maybeSingle()
    if (yaExiste) continue

    const horasRestantes = Math.round(
      (new Date(u.reservado_hasta).getTime() - ahora.getTime()) / 3600000
    )
    const fechaLegible = new Date(u.reservado_hasta).toLocaleString('es-DO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
    const { error: errorInsert } = await supabase.from('inbox').insert([{
      prospecto_id: null,
      canal: 'sistema',
      direccion: 'entrante',
      mensaje: `⚠️ Reserva próxima a vencer: Unidad ${u.numero} — vence en ${horasRestantes}h (${fechaLegible}). Confirmar o liberar antes de que expire.`,
      leido: false,
    }])
    if (errorInsert) {
      console.error(`Error insertando alerta para unidad ${u.numero}:`, errorInsert.message)
    } else {
      alertas++
    }
  }

  return NextResponse.json({
    mensaje: `${alertas} alerta(s) de reserva generada(s)`,
    alertas,
    unidades: (unidades || []).map(u => u.numero),
  })
}
