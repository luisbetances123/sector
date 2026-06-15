import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/app/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: 'https://www.sector.do/update-password' }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await resend.emails.send({
    from: 'SECTOR <noreply@sector.do>',
    to: email,
    subject: 'Restablecer contraseña — SECTOR',
    html: `<p>Haz click aquí para restablecer tu contraseña:</p><a href="${data.properties?.action_link}">${data.properties?.action_link}</a>`
  })

  return NextResponse.json({ ok: true })
}
