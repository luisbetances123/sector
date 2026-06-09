import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Obtener plan del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  // Si es free, verificar límite de 3 propiedades
  if (profile?.plan === "free") {
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count >= 3) {
      return NextResponse.json(
        { error: "LIMIT_REACHED", message: "Plan Free limitado a 3 propiedades. Actualiza a Pro." },
        { status: 403 }
      );
    }
  }

  // Proceder con la creación
  const body = await request.json();
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
