import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportError } from "@/lib/report";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.password || typeof body.password !== "string") {
    return NextResponse.json({ error: "Senha inválida." }, { status: 400 });
  }

  const { password } = body as { password: string };

  if (password.length < 8) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Update password via Supabase Auth
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    reportError("conta/set-password", error);
    return NextResponse.json({ error: "Não foi possível atualizar a senha." }, { status: 500 });
  }

  // Mark has_password = true on profiles
  await supabase
    .from("profiles")
    .update({ has_password: true })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
