path = "app/landing-new/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_block = '''<div className="h-logo" style={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Image src="/sector-logo.png" alt="SECTOR" width={1520} height={311} priority style={{ height: '36px', width: 'auto', maxWidth: 'none', maxHeight: 'none', display: 'block' }} />
              <MapPin
                size={18}
                color="#20d70d"
                fill="#20d70d"
                strokeWidth={1.5}
                style={{
                  position: 'absolute',
                  left: '17.43%',
                  top: '40.8%',
                  transform: 'translate(-50%, -100%)',
                  filter: 'drop-shadow(0 0 4px #20d70d)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>'''

new_block = '''<div className="h-logo">
            <Image src="/sector-logo.png" alt="SECTOR" width={1520} height={311} priority style={{ height: '36px', width: 'auto', maxWidth: 'none', maxHeight: 'none', display: 'block' }} />
          </div>'''

if old_block not in content:
    print("ERROR 1: no encontre el bloque del logo con MapPin overlay.")
else:
    content = content.replace(old_block, new_block, 1)
    print("OK 1: vuelto al logo original simple (sin overlay de pin).")

old_btn = '''<Link href="/dashboard" className="h-cta-btn" style={{ color: '#000' }}>Acceder</Link>'''
new_btn = '''<Link href="/dashboard" className="h-cta-btn" style={{ color: '#000', position: 'relative', top: '3px' }}>Acceder</Link>'''

if old_btn not in content:
    print("ERROR 2: no encontre el boton Acceder con ese estilo exacto (puede que ya tenga el ajuste).")
else:
    content = content.replace(old_btn, new_btn, 1)
    print("OK 2: boton Acceder bajado 3px.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
