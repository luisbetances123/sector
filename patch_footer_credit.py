path = "app/landing/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<span style={{ opacity: 0.5 }}>Developed by LB Software · New York, USA</span>'''
new = '''<span>Developed by Fraglaz Software · New York, USA</span>'''

if old not in content:
    print("ERROR: no encontre la linea exacta del credito de desarrollo.")
else:
    content = content.replace(old, new, 1)
    print("OK: nombre cambiado a Fraglaz Software y opacidad igualada a la linea superior.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
