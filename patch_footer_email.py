path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''<footer className="foot">© 2026 SECTOR · CRM para constructoras · República Dominicana</footer>'''
new = '''<footer className="foot">
          © 2026 SECTOR · CRM para constructoras · República Dominicana
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          <a href="mailto:ventas@sector.do" className="foot-email">ventas@sector.do</a>
        </footer>'''

if old not in content:
    print("ERROR: no encontre la linea exacta del footer.")
else:
    content = content.replace(old, new, 1)
    print("OK 1: email agregado al footer.")

# Agregar estilo hover para el link del email, justo antes de </style>
style_anchor = "input::placeholder { color: #555; }"
new_style = '''input::placeholder { color: #555; }
        .foot-email { color: rgba(255,255,255,0.5); text-decoration: none; transition: color .15s; }
        .foot-email:hover { color: #CCFF00; }'''

if style_anchor not in content:
    print("ERROR: no encontre el ancla de estilos.")
else:
    content = content.replace(style_anchor, new_style, 1)
    print("OK 2: estilos de hover agregados.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
