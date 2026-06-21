path_layout = "app/layout.tsx"
path_css = "app/globals.css"

with open(path_layout, "r", encoding="utf-8") as f:
    layout = f.read()

old_head = "<title>SECTOR - Sistema de Inventario para Constructoras</title>"
new_head = '''<title>SECTOR - Sistema de Inventario para Constructoras</title>
        <style dangerouslySetInnerHTML={{ __html: 'body{opacity:0}' }} />'''

if old_head not in layout:
    print("ERROR 1: no encontre el title en layout.tsx")
else:
    layout = layout.replace(old_head, new_head, 1)
    print("OK 1: estilo critico inline agregado en el head.")

with open(path_layout, "w", encoding="utf-8") as f:
    f.write(layout)

with open(path_css, "r", encoding="utf-8") as f:
    css = f.read()

old_css = '@import "tailwindcss";'
new_css = '''@import "tailwindcss";

body {
  opacity: 1 !important;
  transition: opacity 0.15s ease;
}'''

if old_css not in css:
    print("ERROR 2: no encontre el import de tailwindcss en globals.css")
else:
    css = css.replace(old_css, new_css, 1)
    print("OK 2: regla de visibilidad agregada en globals.css")

with open(path_css, "w", encoding="utf-8") as f:
    f.write(css)
