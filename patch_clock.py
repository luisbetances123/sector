path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''if (clockRef.current) clockRef.current.textContent = new Date().toLocaleTimeString('es-DO', { hour12: false })'''
new = '''if (clockRef.current) clockRef.current.textContent = new Date().toLocaleTimeString('es-DO', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })'''

if old not in content:
    print("ERROR: no encontre la linea exacta del reloj.")
else:
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: reloj cambiado a formato 12 horas con AM/PM.")
