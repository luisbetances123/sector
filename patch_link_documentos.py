path = "app/dashboard/constructoras/[id]/proyectos/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${p.id}/unidades`)}
                    className="flex-1 text-center bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs py-2 rounded-lg font-semibold transition border border-[#d4ff3b]/20">
                    Ver Unidades →
                  </button>'''

new = '''<button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${p.id}/unidades`)}
                    className="flex-1 text-center bg-[#d4ff3b]/10 hover:bg-[#d4ff3b] text-[#d4ff3b] hover:text-black text-xs py-2 rounded-lg font-semibold transition border border-[#d4ff3b]/20">
                    Ver Unidades →
                  </button>
                  <button onClick={() => router.push(`/dashboard/constructoras/${constructoraId}/proyectos/${p.id}`)}
                    className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2 rounded-lg font-semibold transition border border-zinc-700">
                    Documentos
                  </button>'''

if old not in content:
    print("ERROR: no encontre el bloque exacto del boton Ver Unidades.")
else:
    content = content.replace(old, new, 1)
    print("OK: boton de Documentos agregado junto a Ver Unidades.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
