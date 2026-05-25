import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const vapidPublic = process.env.VAPID_PUBLIC_KEY || ''
const vapidPrivate = process.env.VAPID_PRIVATE_KEY || ''

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails('mailto:admin@homvi.app', vapidPublic, vapidPrivate)
}

export async function POST(request: Request) {
  const { title, body, url } = await request.json()
  const { data: subs } = await supabase.from('push_subscriptions').select('subscription')
  if (!subs) return NextResponse.json({ ok: false })

  const payload = JSON.stringify({ title, body, url })
  for (const row of subs) {
    try {
      await webpush.sendNotification(row.subscription, payload)
    } catch (e) {
      console.error('Error enviando push:', e)
    }
  }
  return NextResponse.json({ ok: true, enviadas: subs.length })
}
