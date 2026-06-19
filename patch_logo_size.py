path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<Image src="/sector-logo.png" alt="SECTOR" width={120} height={28} priority style={{ height: '24px', width: 'auto' }} />'''
new = '''<Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '40px', width: 'auto' }} />'''

if old not in content:
    print("ERROR: no encontre el bloque anterior del logo.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: tamaño del logo actualizado a 40px de alto.")
