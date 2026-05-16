'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Property = {
  id: string
  title: string
  type: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  status: string
  initial: string
  image_url: string
}

type PropertyImage = {
  id: string
  property_id: string
  image_url: string
}

const statusColors: Record<string, string> = {
  DISPONIBLE: 'bg-green-900 text-green-300',
  RESERVADA: 'bg-amber-900 text-amber-300',
  VENDIDA: 'bg-zinc-700 text-zinc-400',
}

export default function PropertyPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (id) {
      fetchProperty()
      fetchImages()
    }
  }, [id])

  async function fetchProperty() {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single()
    if (data) setProperty(data)
    setLoading(false)
  }

  async function fetchImages() {
    const { data } = await supabase.from('property_images').select('*').eq('property_id', id).order('created_at')
    if (data) setImages(data)
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !id) return
    setUploading(true)
    setUploadError('')
    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const path = `${id}_${fileName}`
      const { error: upErr } = await supabase.storage.from('properties').upload(path, file, { upsert: true })
      if (upErr) { setUploadError(upErr.message); continue }
      const { data } = supabase.storage.from('properties').getPublicUrl(path)
      await supabase.from('property_images').insert([{ property_id: id, image_url: data.publicUrl }])
    }
    fetchImages()
    setUploading(false)
  }

  async function deleteImage(imageId: string) {
    await supabase.from('property_images').delete().eq('id', imageId)
    setActiveIndex(0)
    fetchImages()
  }

  async function deleteProperty() {
    if (!confirm('Eliminar esta propiedad?')) return
    await supabase.from('properties').delete().eq('id', id)
    router.push('/properties')
  }

  if (loading) return <div className="p-8 text-zinc-500">Cargando...</div>
  if (!property) return <div className="p-8 text-zinc-500">Propiedad no encontrada.</div>

  const allImages = images.length > 0 ? images : (property.image_url ? [{ id: 'main', property_id: id, image_url: property.image_url }] : [])

  return (
    <div className="p-8 max-w-5xl">
      <button onClick={() => router.push('/properties')} className="text-zinc-500 hover:text-amber-500 text-sm mb-6">
        Volver a Propiedades
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            {allImages.length > 0 ? (
              <img src={allImages[activeIndex]?.image_url} alt={property.title} className="w-full h-72 object-cover" />
            ) : (
              <div className="w-full h-72 flex items-center justify-center text-6xl bg-zinc-800">🏠</div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveIndex(i => (i - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black">&#8249;</button>
                <button onClick={() => setActiveIndex(i => (i + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black">&#8250;</button>
              </>
            )}
          </div>
          {uploadError && <div className="mt-2 text-red-400 text-xs">{uploadError}</div>}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <div key={img.id} className="relative flex-shrink-0 group">
                <img src={img.image_url} onClick={() => setActiveIndex(i)} className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 ${i === activeIndex ? 'border-amber-500' : 'border-zinc-700'}`} />
                {img.id !== 'main' && (
                  <button onClick={() => deleteImage(img.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 items-center justify-center text-xs hidden group-hover:flex">x</button>
                )}
              </div>
            ))}
            <label className={`w-20 h-20 flex-shrink-0 border-2 border-dashed border-zinc-700 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center cursor-pointer text-zinc-500 hover:text-amber-500 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <span className="text-2xl">+</span>
              <span className="text-xs">{uploading ? '...' : 'Foto'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
            </label>
          </div>
        </div>
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-white">{property.title}</h1>
              <div className="text-zinc-400 text-sm mt-1">{property.type}</div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusColors[property.status]}`}>{property.status}</span>
          </div>
          <div className="text-3xl font-black text-amber-500 mb-6">{property.price}</div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {property.location && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-2">
                <div className="text-zinc-500 text-xs mb-1">UBICACION</div>
                <div className="text-white font-medium">📍 {property.location}</div>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-zinc-500 text-xs mb-1">HABITACIONES</div>
                <div className="text-white font-bold text-xl">🛏 {property.bedrooms}</div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-zinc-500 text-xs mb-1">BANOS</div>
                <div className="text-white font-bold text-xl">🚿 {property.bathrooms}</div>
              </div>
            )}
          </div>
          <button onClick={deleteProperty} className="w-full bg-red-900 text-red-300 py-3 rounded-xl text-sm hover:bg-red-800 transition-all">Eliminar Propiedad</button>
        </div>
      </div>
    </div>
  )
}
