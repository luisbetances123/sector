import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const { subscription } = await request.json()
  await supabase.from('push_subscriptions').insert({ subscription })
  return NextResponse.json({ ok: true })
}
