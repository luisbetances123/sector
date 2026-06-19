import re

path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if "from 'next/image'" not in content:
    content = content.replace(
        "import Link from 'next/link'",
        "import Link from 'next/link'\nimport Image from 'next/image'",
        1
    )

old_block = '''<div className="h-logo">
            <div className="h-logo-mark"><Building2 size={11} color="#000" strokeWidth={2.5} /></div>
            <span className="h-logo-text">SECTOR</span>
          </div>'''

new_block = '''<div className="h-logo">
            <Image src="/sector-logo.png" alt="SECTOR" width={120} height={28} priority style={{ height: '24px', width: 'auto' }} />
          </div>'''

if old_block not in content:
    print("ERROR: no encontre el bloque exacto del logo. Revisa indentacion/espacios.")
else:
    content = content.replace(old_block, new_block, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: logo insertado y import agregado.")
