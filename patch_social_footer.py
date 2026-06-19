path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_import = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown } from 'lucide-react'"
new_import = "import { Building2, MapPin, ArrowUpRight, ChevronRight, TrendingUp, ChevronDown, Instagram, Linkedin } from 'lucide-react'"

if old_import not in content:
    print("ERROR 1: no encontre la linea de import de lucide-react.")
else:
    content = content.replace(old_import, new_import, 1)
    print("OK 1: iconos Instagram y Linkedin importados.")

old_footer = '''<footer className="foot">
          © 2026 SECTOR · CRM para constructoras · República Dominicana
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          <a href="mailto:ventas@sector.do" className="foot-email">ventas@sector.do</a>
        </footer>'''

new_footer = '''<footer className="foot">
          <div>
            © 2026 SECTOR · CRM para constructoras · República Dominicana
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="mailto:ventas@sector.do" className="foot-email">ventas@sector.do</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
            <a href="https://www.instagram.com/sector.do" target="_blank" rel="noopener noreferrer" className="foot-social" aria-label="Instagram">
              <Instagram size={14} />
            </a>
            <a href="https://www.linkedin.com/in/luis-betances-054905181/" target="_blank" rel="noopener noreferrer" className="foot-social" aria-label="LinkedIn">
              <Linkedin size={14} />
            </a>
            <span style={{ opacity: 0.25 }}>|</span>
            <span style={{ opacity: 0.5 }}>Developed by LB Software · New York, USA</span>
          </div>
        </footer>'''

if old_footer not in content:
    print("ERROR 2: no encontre el bloque exacto del footer.")
else:
    content = content.replace(old_footer, new_footer, 1)
    print("OK 2: footer actualizado con redes sociales y credito de desarrollo.")

old_style = '''.foot-email:hover { color: #CCFF00; }'''
new_style = '''.foot-email:hover { color: #CCFF00; }
        .foot-social { color: rgba(255,255,255,0.45); display: inline-flex; transition: color .15s; }
        .foot-social:hover { color: #CCFF00; }'''

if old_style not in content:
    print("ERROR 3: no encontre el ancla de estilo foot-email:hover.")
else:
    content = content.replace(old_style, new_style, 1)
    print("OK 3: estilos hover de iconos sociales agregados.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
