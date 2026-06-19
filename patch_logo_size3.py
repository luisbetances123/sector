path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '28px', width: 'auto', maxWidth: 'none', maxHeight: 'none', display: 'block' }} />'''
new = '''<Image src="/sector-logo.png" alt="SECTOR" width={1520} height={311} priority style={{ height: '28px', width: 'auto', maxWidth: 'none', maxHeight: 'none', display: 'block' }} />'''

if old not in content:
    print("ERROR: no encontre el bloque anterior del logo.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: dimensiones intrinsecas actualizadas para el logo recortado.")
