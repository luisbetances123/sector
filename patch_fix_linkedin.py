path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Quitar Linkedin del import de lucide-react (dejar solo Instagram)
old_import = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown, Instagram, Linkedin } from 'lucide-react'"
new_import = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown, Instagram } from 'lucide-react'"

if old_import not in content:
    print("ERROR 1: no encontre el import con Linkedin.")
else:
    content = content.replace(old_import, new_import, 1)
    print("OK 1: Linkedin removido del import de lucide-react.")

# 2) Agregar un componente SVG propio para LinkedIn, justo despues del import
linkedin_svg_component = '''
function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.56V9h3.554v11.452z"/>
    </svg>
  )
}
'''

anchor = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown, Instagram } from 'lucide-react'"
if anchor not in content:
    print("ERROR 2: no encontre el ancla para insertar el componente SVG.")
else:
    content = content.replace(anchor, anchor + "\n" + linkedin_svg_component, 1)
    print("OK 2: componente LinkedinIcon agregado.")

# 3) Reemplazar el uso de <Linkedin size={14} /> por <LinkedinIcon size={14} />
old_usage = '<Linkedin size={14} />'
new_usage = '<LinkedinIcon size={14} />'

if old_usage not in content:
    print("ERROR 3: no encontre el uso de <Linkedin size={14} />.")
else:
    content = content.replace(old_usage, new_usage, 1)
    print("OK 3: uso del icono actualizado a LinkedinIcon.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
