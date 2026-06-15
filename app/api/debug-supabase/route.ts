import { NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('proyecto_accesos')
    .select('id, token, activo')
    .limit(5)

  return NextResponse.json({
    env: {
      url: url || 'VACÍO',
      url_project_id: url?.match(/https:\/\/([^.]+)/)?.[1] || 'no detectado',
      anon_key_prefix: anon?.slice(0, 20) || 'VACÍO',
      service_key_prefix: service?.slice(0, 20) || 'VACÍO',
    },
    query_result: { data, error },
  })
}
