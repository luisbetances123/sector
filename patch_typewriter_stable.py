path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''de inventario para <span className="acc">{typed}</span><span className="h-cursor" />'''
new = '''de inventario para <span className="acc" style={{ display: 'inline-block', minWidth: '8.8ch', textAlign: 'left' }}>{typed}</span><span className="h-cursor" />'''

if old not in content:
    print("ERROR: no encontre la linea exacta del h1 con typed.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: ancho fijo reservado para la palabra que cambia (evita reflow/temblor).")
