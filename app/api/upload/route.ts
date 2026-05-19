import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Usamos la Service Role Key para asegurar los permisos de escritura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const propertyId = formData.get('property_id') as string
    
    // Capturamos todos los archivos enviados bajo la llave 'files'
    const files = formData.getAll('files') as File[]

    if (!propertyId) {
      return NextResponse.json({ error: 'Falta el property_id' }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 })
    }

    const uploadedUrls = []

    // Procesamos cada imagen de forma secuencial en un bucle
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Creamos un path único basado en el ID de la propiedad y la estampa de tiempo
      const fileExt = file.name.split('.').pop() || 'jpg'
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const generatedPath = `${propertyId}/${uniqueName}`

      // 1. Subir al Storage de Supabase
      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(generatedPath, buffer, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('Error subiendo archivo al storage:', uploadError.message)
        continue // Si falla una foto, continúa procesando las demás
      }

      // 2. Obtener la URL pública oficial
      const { data } = supabase.storage.from('properties').getPublicUrl(generatedPath)
      const publicUrl = data.publicUrl

      // 3. Insertar la referencia en tu tabla (usando 'image_url' como pide tu DB)
      const { error: dbError } = await supabase
        .from('property_images')
        .insert([{
          property_id: propertyId,
          image_url: publicUrl
        }])

      if (dbError) {
        console.error('Error guardando en la tabla property_images:', dbError.message)
        continue
      }

      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({ 
      success: true, 
      message: `${uploadedUrls.length} imágenes procesadas con éxito.`,
      urls: uploadedUrls 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}