// worker-entry.js
// Este archivo envuelve el worker generado por OpenNext (.open-next/worker.js)
// para agregarle soporte de Cron Triggers de Cloudflare, ya que OpenNext no
// genera un handler "scheduled" por si solo.
//
// IMPORTANTE: este archivo vive en la raiz del proyecto (no dentro de
// .open-next/) para que sobreviva cada vez que se regenera el build con
// `npm run cf:build`. wrangler.jsonc debe apuntar su campo "main" a este
// archivo en vez de apuntar directo a .open-next/worker.js

import openNextWorker, {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "./.open-next/worker.js";

// URL publica donde vive la app (DNS de sector.do ya apunta a Cloudflare)
const APP_URL = "https://sector.do";

export default {
  // Reutiliza el fetch handler normal de la app (sin tocarlo)
  fetch: openNextWorker.fetch,

  // Handler que se dispara con cada Cron Trigger configurado en wrangler.jsonc
  async scheduled(event, env, ctx) {
    console.log(`[cron] Disparado: ${event.cron} a las ${new Date(event.scheduledTime).toISOString()}`);

    try {
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
};

// Re-exportar los handlers de Durable Objects que OpenNext genera, por si
// wrangler.jsonc los necesita referenciar (cache/queue internos de Next).
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge };
