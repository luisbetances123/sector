path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/unidades/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = """      console.log('DEBUG hist:', hist);
      console.log('DEBUG promedios:', promedios);
      setVelocidadPorPiso(promedios);"""
new = "      setVelocidadPorPiso(promedios);"

if old not in content:
    print("ERROR: no encontre el bloque de debug.")
else:
    content = content.replace(old, new, 1)
    print("OK: console.log de debug eliminado.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
