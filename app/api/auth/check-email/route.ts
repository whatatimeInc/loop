import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || typeof body.email !== "string") {
    return NextResponse.json({ hasPassword: false });
  }

  // Service role client to bypass RLS — server-side only, never exposed
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("email", body.email.toLowerCase().trim())
    .single();

  // Always return the same shape — never reveal if account exists or not
  return NextResponse.json({ hasPassword: data?.has_password === true });
}
