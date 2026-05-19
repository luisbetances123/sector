'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Property = {
  id: string
  title: string
  price: string
  location: string
  type: string
  bedrooms?: number
  bathrooms?: number
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
  DISPONIBLE: 'bg-green-900 text-green-300 border-green-800',
  RESERVADA: 'bg-amber-900 text-amber-300 border-amber-800',
  VENDIDA: 'bg-zinc-700 text-zinc-400 border-zinc-600',
}

export default function PropertyPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  // Estados originales guardados
  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Estados nuevos para el formulario de edición
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editStatus, setEditStatus] = useState('DISPONIBLE')
  const [editBedrooms, setEditBedrooms] = useState(0)
  const [editBathrooms, setEditBathrooms] = useState(0)

  useEffect(() => {
    if (id) {
      fetchProperty()
      fetchImages()
    }
  }, [id])

  async function fetchProperty() {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single()
    if (data) {
      setProperty(data)
      // Llenamos el formulario con lo que tiene la base de datos actualmente
      setEditTitle(data.title || '')
      setEditPrice(data.price || '')
      setEditLocation(data.location || '')
      setEditStatus(data.status || 'DISPONIBLE')
      setEditBedrooms(data.bedrooms || 0)
      setEditBathrooms(data.bathrooms || 0)
    }
    setLoading(false)
  }

  async function fetchImages() {
    const { data } = await supabase.from('property_images').select('*').eq('property_id', id).order('created_at')
    if (data) setImages(data)
  }

  // FUNCIÓN DE SUBIDA CONECTADA AL BOTÓN INTERACTIVO
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0 || !id) {
      alert('Error inicial: No hay archivos o falta el ID de propiedad')
      return
    }

    setUploading(true)
    setUploadError('')
    alert(`Iniciando intento de subida para ${files.length} archivo(s)...`)

    const formData = new FormData()
    formData.append('property_id', id)
    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const mensajeError = data.error || 'Error interno del backend en la API Route'
        setUploadError(mensajeError)
        alert('ALERTA DE ERROR EN LA API:\n' + mensajeError)
      } else {
        alert('¡ÉXITO REALIZADO! El servidor dice que subió todo bien.')
        await fetchProperty()
        await fetchImages() // Recargar la galería de fotos
      }
    } catch (err: any) {
      console.error('Error de red:', err)
      setUploadError(err.message || 'Error de conexión')
      alert('ALERTA DE ERROR EN EL FRONTEND/RED:\n' + (err.message || 'Error de conexión'))
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  // FUNCIÓN PARA ELIMINAR FOTOS INDIVIDUALES
  async function deleteImage(imageId: string) {
    const confirmar = confirm('¿Seguro que quieres eliminar esta imagen?')
    if (!confirmar) return

    await supabase.from('property_images').delete().eq('id', imageId)
    setActiveIndex(0)
    fetchImages()
  }

  // FUNCIÓN PARA GUARDAR TEXTOS EDITADOS
  async function handleSaveChanges() {
    if (!id) return
    setLoading(true)

    const { error } = await supabase
      .from('properties')
      .update({
        title: editTitle,
        price: editPrice,
        location: editLocation,
        status: editStatus,
        bedrooms: Number(editBedrooms),
        bathrooms: Number(editBathrooms),
      })
      .eq('id', id)

    if (error) {
      alert('Error al actualizar la propiedad: ' + error.message)
    } else {
      alert('¡Propiedad actualizada correctamente!')
      fetchProperty()
    }
    setLoading(false)
  }

  // FUNCIÓN PARA ELIMINAR PROPIEDAD COMPLETA
  async function handleDelete() {
    if (!id) return
    const confirmar = confirm('¿Seguro que quieres eliminar esta propiedad?')
    if (!confirmar) return

    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) {
      alert('Propiedad eliminada con éxito.')
      router.push('/properties')
    } else {
      alert('Error al eliminar: ' + error.message)
    }
  }

  if (loading && !property) return <div className="p-8 text-zinc-500">Cargando detalle...</div>
  if (!property) return <div className="p-8 text-zinc-500">No se encontró la propiedad.</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button 
        onClick={() => router.push('/properties')}
        className="text-zinc-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-all"
      >
        ← Volver a Propiedades
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUMNA IZQUIERDA: VISUALIZADOR DE IMÁGENES */}
        <div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-80 flex items-center justify-center mb-4 relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <img 
                  src={images[activeIndex]?.image_url} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => deleteImage(images[activeIndex].id)}
                  className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-lg text-xs font-bold uppercase transition-all"
                >
                  🗑️ Eliminar Foto
                </button>
              </>
            ) : (
              <span className="text-6xl">🏠</span>
            )}
          </div>

          {/* Carrusel/Miniaturas de fotos subidas actualmente */}
          {images.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeIndex === idx ? 'border-amber-500' : 'border-zinc-800'}`}
                >
                  <img src={img.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Input oculto real controlado por el botón de abajo */}
          <input 
            type="file" 
            ref={fileRef} 
            onChange={handleUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />

          {/* Caja punteada interactiva de subir fotos */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-32 h-32 border-2 border-dashed border-zinc-800 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-amber-500 transition-all gap-2 bg-zinc-950/50"
          >
            <span className="text-2xl">{uploading ? '⏳' : '+'}</span>
            <span className="text-xs uppercase font-bold tracking-wider">
              {uploading ? 'Subiendo...' : 'Foto'}
            </span>
          </button>
          {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y FORMULARIO */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">{property.title}</h1>
              <p className="text-zinc-400 mt-1">📍 {property.location}</p>
            </div>
            <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[property.status] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
              {property.status}
            </span>
          </div>

          <div className="text-3xl font-black text-amber-500">${property.price}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
              <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider mb-1">Habitaciones</span>
              <span className="text-white font-bold text-lg">🛏️ {property.bedrooms || 0}</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
              <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider mb-1">Baños</span>
              <span className="text-white font-bold text-lg">🚿 {property.bathrooms || 0}</span>
            </div>
          </div>

          <hr className="border-zinc-800" />

          {/* NUEVO PANEL DE FORMULARIO INTEGRADO */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-white font-black uppercase text-sm tracking-wider text-amber-500">Editar Datos de la Propiedad</h3>
            
            <div>
              <label className="text-xs text-zinc-400 block uppercase font-medium mb-1">Título de la Propiedad</label>
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block uppercase font-medium mb-1">Precio</label>
                <input 
                  type="text" 
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block uppercase font-medium mb-1">Ubicación</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block uppercase font-medium mb-1">Estado</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm h-[38px]"
                >
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="RESERVADA">RESERVADA</option>
                  <option value="VENDIDA">VENDIDA</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block uppercase font-medium mb-1">Habits.</label>
                <input 
                  type="number" 
                  value={editBedrooms}
                  onChange={(e) => setEditBedrooms(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block uppercase font-medium mb-1">Baños</label>
                <input 
                  type="number" 
                  value={editBathrooms}
                  onChange={(e) => setEditBathrooms(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSaveChanges}
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider transition-all mt-2"
            >
              Guardar Cambios
            </button>
          </div>

          {/* BOTÓN ELIMINAR */}
          <button 
            onClick={handleDelete}
            className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-900 text-red-400 font-bold py-2.5 rounded-xl text-sm uppercase tracking-wider transition-all"
          >
            Eliminar Propiedad totalmente
          </button>
        </div>

      </div>
    </div>
  )
}