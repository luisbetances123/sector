path = "app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''        .hiw-step-desc { margin-top: 8px; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.6); }'''

new = '''        .hiw-step-desc { margin-top: 8px; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.6); }
        .mod-intro { margin-bottom: 24px; }
        .mod-sub { font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.65); max-width: 620px; }
        .mod-points { display: grid; grid-template-columns: 1fr; gap: 1px; background: #1a1a1a; border: 1px solid #1a1a1a; margin-top: 20px; }
        @media (min-width: 1024px) { .mod-points { grid-template-columns: 1fr 1fr 1fr; } }
        .mod-point { background: #0a0a0a; padding: 18px 18px; }
        .mod-point-title { display: block; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #CCFF00; }
        .mod-point p { margin-top: 8px; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.6); }'''

if old not in content:
    print("ERROR: no encontre el bloque de .hiw-step-desc")
else:
    content = content.replace(old, new, 1)
    print("OK: estilos de mod-intro/mod-points insertados.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
