path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/unidades/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "      setVelocidadPorPiso(promedios);"
new = """      console.log('DEBUG hist:', hist);
      console.log('DEBUG promedios:', promedios);
      setVelocidadPorPiso(promedios);"""

if old not in content:
    print("ERROR: no encontre la linea exacta.")
else:
    content = content.replace(old, new, 1)
    print("OK: console.log agregado para debug.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
