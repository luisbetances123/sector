import json

path = "wrangler.jsonc"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''"crons": ["0 13 * * *"]'''
new = '''"crons": ["0 */6 * * *"]'''

if old not in content:
    print("ERROR: no encontre la linea exacta del cron.")
else:
    content = content.replace(old, new, 1)
    print("OK: cron cambiado de una vez al dia a cada 6 horas.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
