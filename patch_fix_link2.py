path = "app/dashboard/constructoras/[id]/proyectos/[proyectoId]/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Buscamos la linea que tiene "href={doc.url}" y vemos si la anterior esta vacia
target_idx = None
for i, line in enumerate(lines):
    if "href={doc.url}" in line:
        target_idx = i
        break

if target_idx is None:
    print("ERROR: no encontre la linea con href={doc.url}")
else:
    anterior = lines[target_idx - 1]
    print(f"Linea {target_idx}: {repr(lines[target_idx])}")
    print(f"Linea anterior {target_idx - 1}: {repr(anterior)}")

    if anterior.strip() == "":
        # Calculamos la indentacion basandonos en la linea href
        indent = len(lines[target_idx]) - len(lines[target_idx].lstrip())
        nueva_apertura = " " * (indent - 2) + "<a\n"
        lines[target_idx - 1] = nueva_apertura
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print("OK: etiqueta <a insertada en la linea vacia.")
    else:
        print("ERROR: la linea anterior no estaba vacia, revisar manualmente.")
