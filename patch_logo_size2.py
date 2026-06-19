path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '40px', width: 'auto' }} />'''
new = '''<Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '28px', width: 'auto', maxWidth: 'none', maxHeight: 'none', display: 'block' }} />'''

if old not in content:
    print("ERROR: no encontre el bloque anterior del logo.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: logo ajustado a 28px (altura del boton Acceder) con maxWidth/maxHeight forzados.")
