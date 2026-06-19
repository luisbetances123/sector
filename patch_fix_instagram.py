path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Quitar Instagram del import de lucide-react
old_import = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown, Instagram } from 'lucide-react'"
new_import = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react'"

if old_import not in content:
    print("ERROR 1: no encontre el import con Instagram.")
else:
    content = content.replace(old_import, new_import, 1)
    print("OK 1: Instagram removido del import de lucide-react.")

# 2) Agregar componente SVG propio para Instagram, junto al de LinkedIn
anchor = "function LinkedinIcon({ size = 14 }: { size?: number }) {"
instagram_svg_component = '''function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

'''

if anchor not in content:
    print("ERROR 2: no encontre el ancla para insertar el componente Instagram.")
else:
    content = content.replace(anchor, instagram_svg_component + anchor, 1)
    print("OK 2: componente InstagramIcon agregado.")

# 3) Reemplazar el uso de <Instagram size={14} /> por <InstagramIcon size={14} />
old_usage = '<Instagram size={14} />'
new_usage = '<InstagramIcon size={14} />'

if old_usage not in content:
    print("ERROR 3: no encontre el uso de <Instagram size={14} />.")
else:
    content = content.replace(old_usage, new_usage, 1)
    print("OK 3: uso del icono actualizado a InstagramIcon.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
