import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportError } from "@/lib/report";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.name || !body?.interest) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const { email, name, interest, ref } = body as {
    email: string;
    name: string;
    interest: string;
    ref?: string;
  };

  const supabase = await createClient();

  // Resolve referral code → referrer id (if provided)
  let referredBy: string | null = null;
  if (ref) {
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", ref)
      .single();
    referredBy = referrer?.id ?? null;
  }

  // Sign the user up via Supabase Auth (magic link / OTP — passwordless)
  // This creates an auth.users row, which triggers handle_new_auth_user()
  // and populates public.profiles with waitlist fields.
  const { error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Magic link lands on /waitlist/access which validates and redirects to /waitlist/confirm
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/waitlist/access`,
      data: {
        name,
        interest,
        referred_by: referredBy,
      },
    },
  });

  if (authError) {
    reportError("waitlist/signup", authError);
    return NextResponse.json({ error: "Não foi possível processar o cadastro." }, { status: 500 });
  }

  // If we already have a profile row (returning user), update the interest field
  await supabase
    .from("profiles")
    .update({ waitlist_interest: interest, referred_by: referredBy })
    .eq("email", email)
    .is("waitlist_interest", null); // only set if not already set

  // Estimate position: count existing waitlist entries + 1
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({ ok: true, position: (count ?? 0) + 1 }, { status: 200 });
}
