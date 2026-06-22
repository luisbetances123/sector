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
  const limite = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()

  const { data: deals, error } = await supabase
    .from('pipeline_deals')
    .select('id, nombre_cliente, etapa, updated_at')
    .lt('updated_at', limite)
    .not('etapa', 'in', '("Entregado","Fantasma")')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let marcados = 0
  for (const deal of (deals || [])) {
    const dias = Math.floor((ahora.getTime() - new Date(deal.updated_at).getTime()) / 86400000)
    await supabase.from('pipeline_deals').update({ etapa: 'Fantasma' }).eq('id', deal.id)
    await supabase.from('inbox').insert([{
      cliente_id: null,
      canal: 'sistema',
      direccion: 'entrante',
      mensaje: `🔕 Deal inactivo: ${deal.nombre_cliente} — sin movimiento hace ${dias} días. Marcado como Fantasma automáticamente.`,
      leido: false,
    }])
    marcados++
  }

  return NextResponse.json({
    mensaje: `${marcados} deal(s) marcado(s) como Fantasma`,
    marcados,
    deals: (deals || []).map(d => d.nombre_cliente),
  })
}
