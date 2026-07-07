import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || typeof body.email !== "string") {
    return NextResponse.json({ hasPassword: false });
  }

  // Service role client to bypass RLS — server-side only, never exposed
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("email", body.email.toLowerCase().trim())
    .single();

  // Always return the same shape — never reveal if account exists or not
  return NextResponse.json({ hasPassword: data?.has_password === true });
}
