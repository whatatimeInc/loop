import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic link entry point.
// Supabase appends ?code=... to this URL after email confirmation.
// We exchange the code for a session then redirect to /waitlist/confirm.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[waitlist/access]", error.message);
    // Invalid or expired token — redirect to landing with error hint
    return NextResponse.redirect(`${origin}/?error=link_invalid`);
  }

  return NextResponse.redirect(`${origin}/waitlist/confirm`);
}
