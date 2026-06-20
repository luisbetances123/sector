path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<div className="flex items-center gap-2">

                    href={doc.url}'''

new = '''<div className="flex items-center gap-2">
                  
                    href={doc.url}'''

if old not in content:
    print("ERROR: no encontre el bloque exacto a corregir.")
else:
    content = content.replace(old, new, 1)
    print("OK: etiqueta <a faltante restaurada.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
