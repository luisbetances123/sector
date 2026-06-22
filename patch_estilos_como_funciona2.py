path = "app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''        .sec-desc { margin: 10px 0 0; max-width: 480px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); }'''

new = '''        .sec-desc { margin: 10px 0 0; max-width: 480px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); }
        .hiw-grid { display: grid; grid-template-columns: 1fr; gap: 1px; background: #1a1a1a; border: 1px solid #1a1a1a; margin-top: 32px; }
        @media (min-width: 1024px) { .hiw-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
        .hiw-step { background: #0a0a0a; padding: 24px 20px; }
        .hiw-num { font-family: var(--mono); font-size: 22px; font-weight: 600; color: #CCFF00; }
        .hiw-step-title { margin-top: 10px; font-size: 15px; font-weight: 600; color: #fff; }
        .hiw-step-desc { margin-top: 8px; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.6); }'''

if old not in content:
    print("ERROR: no encontre el bloque de .sec-desc")
else:
    content = content.replace(old, new, 1)
    print("OK: estilos de hiw insertados")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
