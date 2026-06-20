path = "worker-entry.js"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Actualizar APP_URL al dominio real
old_url = '''// URL publica donde vive la app (usar el dominio real cuando el DNS de
// sector.do ya apunte a Cloudflare; mientras tanto, usar la URL de workers.dev)
const APP_URL = "https://sector.mwn6frmgwm.workers.dev";'''
new_url = '''// URL publica donde vive la app (DNS de sector.do ya apunta a Cloudflare)
const APP_URL = "https://sector.do";'''

if old_url not in content:
    print("ERROR 1: no encontre el bloque de APP_URL.")
else:
    content = content.replace(old_url, new_url, 1)
    print("OK 1: APP_URL actualizado a https://sector.do")

# 2) Agregar fantasmas y reminders al scheduled handler
old_block = '''    try {
      const res = await fetch(
        `${APP_URL}/api/cron/liberar-reservas?key=${env.CRON_SECRET}`,
        { method: "GET" }
      );
      const body = await res.text();
      console.log(`[cron] liberar-reservas -> status ${res.status}: ${body}`);
    } catch (err) {
      console.error("[cron] Error ejecutando liberar-reservas:", err);
    }
  },
};'''

new_block = '''    try {
      const res = await fetch(
        `${APP_URL}/api/cron/liberar-reservas?key=${env.CRON_SECRET}`,
        { method: "GET" }
      );
      const body = await res.text();
      console.log(`[cron] liberar-reservas -> status ${res.status}: ${body}`);
    } catch (err) {
      console.error("[cron] Error ejecutando liberar-reservas:", err);
    }

    try {
      const res = await fetch(
        `${APP_URL}/api/cron/fantasmas?key=${env.CRON_SECRET}`,
        { method: "GET" }
      );
      const body = await res.text();
      console.log(`[cron] fantasmas -> status ${res.status}: ${body}`);
    } catch (err) {
      console.error("[cron] Error ejecutando fantasmas:", err);
    }

    try {
      const res = await fetch(
        `${APP_URL}/api/reminders?key=${env.CRON_SECRET}`,
        { method: "GET" }
      );
      const body = await res.text();
      console.log(`[cron] reminders -> status ${res.status}: ${body}`);
    } catch (err) {
      console.error("[cron] Error ejecutando reminders:", err);
    }
  },
};'''

if old_block not in content:
    print("ERROR 2: no encontre el bloque del scheduled handler.")
else:
    content = content.replace(old_block, new_block, 1)
    print("OK 2: fantasmas y reminders agregados al cron.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
