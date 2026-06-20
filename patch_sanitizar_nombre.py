path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''    const rutaArchivo = `${proyectoId}/${Date.now()}-${file.name}`'''

new = '''    const nombreSanitizado = file.name
      .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\\-]/g, '_')
    const rutaArchivo = `${proyectoId}/${Date.now()}-${nombreSanitizado}`'''

if old not in content:
    print("ERROR: no encontre la linea de rutaArchivo.")
else:
    content = content.replace(old, new, 1)
    print("OK: nombre de archivo sanitizado antes de subir.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
