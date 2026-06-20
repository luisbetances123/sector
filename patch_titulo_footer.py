import os

root = "app"
old_title = "SECTOR - CRM Inmobiliario"
new_title = "SECTOR - Sistema de Inventario para Constructoras"

old_footer = "© 2026 SECTOR · CRM para constructoras · República Dominicana"
new_footer = "© 2026 SECTOR · Sistema de inventario para constructoras · República Dominicana"

changed_files = []

for dirpath, _, filenames in os.walk(root):
    for fname in filenames:
        if not fname.endswith((".tsx", ".ts")):
            continue
        path = os.path.join(dirpath, fname)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        original = content
        if old_title in content:
            content = content.replace(old_title, new_title)
        if old_footer in content:
            content = content.replace(old_footer, new_footer)
        if content != original:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            changed_files.append(path)

if changed_files:
    print("OK, archivos modificados:")
    for p in changed_files:
        print(" -", p)
else:
    print("ERROR: no encontre ninguna coincidencia exacta de title o footer.")
