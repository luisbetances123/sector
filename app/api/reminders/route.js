import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const today = new Date();
  const results = { clientReminders: 0, calendarReminders: 0, errors: [] };

  // 1. Recordatorios de clientes sin contacto en 7 dias
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: staleClients } = await supabase
    .from("clients")
    .select("*, profiles(email)")
    .lt("updated_at", sevenDaysAgo.toISOString())
    .eq("status", "active");

  for (const client of staleClients || []) {
    if (!client.profiles?.email) continue;
    try {
      await resend.emails.send({
        from: "SECTOR <onboarding@resend.dev>",
        to: client.profiles.email,
        subject: `Recordatorio: ${client.name} lleva 7 dias sin contacto`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Recordatorio de seguimiento</h2>
            <p>Tu cliente <strong>${client.name}</strong> lleva mas de 7 dias sin ser contactado.</p>
            <p>Es un buen momento para hacer seguimiento.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients" 
               style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              Ver cliente
            </a>
          </div>
        `,
      });
      results.clientReminders++;
    } catch (e) {
      results.errors.push(e.message);
    }
  }

  // 2. Recordatorios de citas del calendario para manana
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: appointments } = await supabase
    .from("calendar_events")
    .select("*, profiles(email)")
    .gte("date", tomorrowStr + "T00:00:00")
    .lte("date", tomorrowStr + "T23:59:59");

  for (const appt of appointments || []) {
    if (!appt.profiles?.email) continue;
    try {
      await resend.emails.send({
        from: "SECTOR <onboarding@resend.dev>",
        to: appt.profiles.email,
        subject: `Recordatorio: ${appt.title} manana`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Tienes una cita manana</h2>
            <p><strong>${appt.title}</strong></p>
            <p>Fecha: ${new Date(appt.date).toLocaleString("es-DO")}</p>
            ${appt.description ? `<p>${appt.description}</p>` : ""}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar"
               style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
              Ver calendario
            </a>
          </div>
        `,
      });
      results.calendarReminders++;
    } catch (e) {
      results.errors.push(e.message);
    }
  }

  return NextResponse.json({ success: true, ...results });
}
