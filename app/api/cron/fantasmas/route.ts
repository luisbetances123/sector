import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DIAS_LIMITE = 7

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: clientes } = await supabase.from('clientes').select('id, nombre, etapa')
  const { data: contactos } = await supabase.from('contactos_whatsapp').select('cliente_id, fecha')

  if (!clientes || !contactos) return NextResponse.json({ error: 'Error cargando datos' }, { status: 500 })

  const fantasmas = clientes.filter(cliente => {
    const del_cliente = contactos.filter(c => c.cliente_id === cliente.id)
    if (del_cliente.length === 0) return true
    const ultimo = del_cliente.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
    const dias = (Date.now() - new Date(ultimo.fecha).getTime()) / (1000 * 60 * 60 * 24)
    return dias >= DIAS_LIMITE
  })

  for (const c of fantasmas) {
    await supabase.from('clientes').update({ es_fantasma: true }).eq('id', c.id)
  }
  const ids_fantasmas = fantasmas.map(c => c.id)
  const activos = clientes.filter(c => !ids_fantasmas.includes(c.id))
  for (const c of activos) {
    await supabase.from('clientes').update({ es_fantasma: false }).eq('id', c.id)
  }

  return NextResponse.json({ fantasmas: fantasmas.length, nombres: fantasmas.map(c => c.nombre) })
}
