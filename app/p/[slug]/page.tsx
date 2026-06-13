import { createServerClient } from '@/app/lib/supabase';
import { notFound } from 'next/navigation';

interface Propiedad {
  id: string;
  nombre: string;
  precio: string;
  ubicacion: string;
  imagen: string | null;
  recamaras: string;
  banos: string;
  area: string;
  descripcion: string;
  tipo: string;
}

export default async function PortalRealtorPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();

  const { data: perfil } = await supabase
    .from('profiles')
    .select('id, nombre, bio, avatar_url, whatsapp, slug')
    .eq('slug', params.slug)
    .eq('portal_activo', true)
    .single();

  if (!perfil) return notFound();

  const { data: propiedades } = await supabase
    .from('propiedades')
    .select('*')
    .eq('user_id', perfil.id)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">

      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-black text-lg tracking-tighter">SEC<span className="text-[#CCFF00]">TOR</span></span>
        {perfil.whatsapp && (
          <a href={`https://wa.me/${perfil.whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="bg-[#d4ff3b] hover:bg-[#c2eb30] text-black text-xs font-bold px-4 py-2 rounded-lg transition">
            Contactar →
          </a>
        )}
      </div>

      {/* Perfil del realtor */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt={perfil.nombre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl">👤</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{perfil.nombre}</h1>
            {perfil.bio && <p className="text-sm text-zinc-400 mt-1 max-w-xl">{perfil.bio}</p>}
            {perfil.whatsapp && (
              <a href={`https://wa.me/${perfil.whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-[#d4ff3b] hover:underline font-mono">
                WhatsApp: +{perfil.whatsapp}
              </a>
            )}
          </div>
        </div>

        {/* Propiedades */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Propiedades Disponibles</h2>
          <p className="text-sm text-zinc-500">{propiedades?.length || 0} propiedades activas</p>
        </div>

        {!propiedades || propiedades.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 font-mono text-sm">
            Este realtor no tiene propiedades activas en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propiedades.map((p: any) => (
              <div key={p.id} className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition">
                <div className="h-48 bg-zinc-900 overflow-hidden">
                  <img
                    src={p.imagen || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'}
                    alt={p.nombre}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono uppercase bg-[#d4ff3b]/10 text-[#d4ff3b] px-2 py-0.5 rounded border border-[#d4ff3b]/20">
                      {p.ubicacion}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-zinc-500">
                      {p.tipo}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">{p.nombre}</h3>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    ${Number(p.precio) ? Number(p.precio).toLocaleString() : p.precio}
                  </p>
                  <div className="grid grid-cols-3 gap-1 mt-3 text-center text-[10px] text-zinc-500 border-t border-zinc-800 pt-3">
                    <div><span className="block text-white font-mono">{p.recamaras}</span>Recs</div>
                    <div><span className="block text-white font-mono">{p.banos}</span>Baños</div>
                    <div><span className="block text-white font-mono">{p.area}m²</span>Área</div>
                  </div>
                  {perfil.whatsapp && (
                    <a href={`https://wa.me/${perfil.whatsapp}?text=Hola ${perfil.nombre}, me interesa la propiedad: ${p.nombre}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-4 w-full block text-center bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs py-2 rounded-lg font-semibold transition border border-[#d4ff3b]/20">
                      Consultar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center py-8 text-zinc-700 text-xs font-mono border-t border-zinc-900 mt-12">
        Powered by SECTOR · sector.do
      </div>
    </div>
  );
}