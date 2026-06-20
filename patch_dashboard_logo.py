path = "app/dashboard/layout.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Importar next/image
old_import = "import Link from 'next/link'"
new_import = "import Link from 'next/link'\nimport Image from 'next/image'"

if old_import not in content:
    print("ERROR 1: no encontre el import de next/link.")
else:
    content = content.replace(old_import, new_import, 1)
    print("OK 1: next/image importado.")

# 2) Logo del header mobile
old_mobile = '''<div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
<span className="text-base font-black tracking-tighter uppercase">SECTOR<span className="text-[#CCFF00]">.</span></span>        </div>'''
new_mobile = '''<Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '28px', width: 'auto' }} />
        </div>'''

if old_mobile not in content:
    print("ERROR 2: no encontre el bloque del logo mobile.")
else:
    content = content.replace(old_mobile, new_mobile, 1)
    print("OK 2: logo mobile reemplazado.")

# 3) Logo del sidebar desktop
old_desktop = '''<div className="w-3 h-3 rounded-full bg-[#CCFF00] animate-pulse" />
<span className="text-lg font-black tracking-tighter uppercase">SECTOR<span className="text-[#CCFF00]">.</span></span>          </div>'''
new_desktop = '''<Image src="/sector-logo.png" alt="SECTOR" width={300} height={160} priority style={{ height: '32px', width: 'auto' }} />
          </div>'''

if old_desktop not in content:
    print("ERROR 3: no encontre el bloque del logo desktop.")
else:
    content = content.replace(old_desktop, new_desktop, 1)
    print("OK 3: logo desktop (sidebar) reemplazado.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
