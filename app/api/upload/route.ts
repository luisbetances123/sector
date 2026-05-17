import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const path = formData.get('path') as string
  const propertyId = formData.get('property_id') as string

  if (!file || !path) {
    return NextResponse.json({ error: 'Missing file or path' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await supabase.storage
    .from('properties')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('properties').getPublicUrl(path)

  if (propertyId) {
    await supabase.from('property_images').insert([{
      property_id: propertyId,
      image_url: data.publicUrl
    }])
  }

  return NextResponse.json({ url: data.publicUrl })
}