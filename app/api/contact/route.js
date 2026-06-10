import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { nombre, email, telefono, mensaje, propertyId, propertyName } = await request.json();

  if (!nombre || !email || !telefono) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Buscar el agente dueno de la propiedad
  const { data: property } = await supabase
    .from("properties")
    .select("user_id, profiles(email)")
    .eq("id", propertyId)
    .single();

  const agentEmail = property?.profiles?.email || process.env.NEXT_PUBLIC_DEFAULT_AGENT_EMAIL;

  if (!agentEmail) {
    return NextResponse.json({ error: "No se encontro el agente" }, { status: 404 });
  }

  try {
    await resend.emails.send({
      from: "SECTOR Portal <onboarding@resend.dev>",
      to: agentEmail,
      reply_to: email,
      subject: `Nueva consulta: ${propertyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e293b; padding: 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: #fff; margin: 0; font-size: 1.25rem;">Nueva consulta de propiedad</h2>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 0.875rem;">${propertyName}</p>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem; width: 120px;">Nombre</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Email</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Telefono</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${telefono}</td>
              </tr>
              ${mensaje ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem; vertical-align: top;">Mensaje</td>
                <td style="padding: 8px 0; color: #1e293b;">${mensaje}</td>
              </tr>` : ""}
            </table>
            <a href="mailto:${email}" style="display: inline-block; margin-top: 24px; background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Responder a ${nombre}
            </a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
