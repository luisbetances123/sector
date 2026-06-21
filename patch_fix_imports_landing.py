path = "app/page.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "import { supabase } from '../lib/supabase'"
new = "import { supabase } from './lib/supabase'"

if old not in content:
    print("ERROR: no encontre el import de supabase con la ruta vieja.")
else:
    content = content.replace(old, new, 1)
    print("OK: import de supabase corregido.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
