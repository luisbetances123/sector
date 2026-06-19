path = "wrangler.jsonc"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_main = '"main": ".open-next/worker.js",'
new_main = '"main": "worker-entry.js",'

if old_main not in content:
    print("ERROR 1: no encontre la linea 'main' exacta.")
else:
    content = content.replace(old_main, new_main, 1)
    print("OK 1: 'main' actualizado a worker-entry.js")

old_obs = '"observability": {\n    "enabled": true\n  }'
new_obs = '''"observability": {
    "enabled": true
  },
  "triggers": {
    "crons": ["0 13 * * *"]
  }'''

if old_obs not in content:
    print("ERROR 2: no encontre el bloque de 'observability' exacto.")
else:
    content = content.replace(old_obs, new_obs, 1)
    print("OK 2: cron trigger agregado (0 13 * * * UTC = 9am hora RD)")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
