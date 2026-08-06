import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { ReferralSection } from "./ReferralSection";
import { tokens } from "@/components/ui/tokens";

export const metadata: Metadata = {
  title: "Sua posição na lista — Loop.Talk",
};

export default async function WaitlistConfirmPage() {
  const supabase = await createClient();

  // Require auth — user must have followed the magic link
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, waitlist_position, referral_code, referral_count")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const referralUrl = `${siteUrl}/?ref=${profile.referral_code}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F4F2EB" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <Logo size="header" />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg flex flex-col gap-8">

          {/* Position card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E0DDC1",
              borderRadius: 14,
              padding: "32px 28px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "#807F71", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Você está na posição
            </p>
            <div
              style={{
                fontSize: 72,
                fontWeight: 300,
                color: "#272518",
                lineHeight: 1,
                fontFamily: "var(--font-host-grotesk), 'Host Grotesk', sans-serif",
              }}
            >
              #{profile.waitlist_position}
            </div>
            <p style={{ fontSize: 15, color: "#626053" }}>
              Olá, {profile.name?.split(" ")[0] ?? ""}! Você está reservado(a).{" "}
              Avisaremos por e-mail quando for a sua vez.
            </p>
          </div>

          {/* Referral section */}
          <div
            style={{
              background: tokens.lime,
              borderRadius: 14,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#272518", marginBottom: 4 }}>
                Suba na lista indicando amigos
              </p>
              <p style={{ fontSize: 13, color: "#514F41" }}>
                Cada indicação que entrar na lista move você <strong>5 posições para cima</strong> (até a posição 10).
                Você já tem <strong>{profile.referral_count}</strong>{" "}
                {profile.referral_count === 1 ? "indicação" : "indicações"}.
              </p>
            </div>

            {/* Client component handles copy-to-clipboard */}
            <ReferralSection
              referralUrl={referralUrl}
              referralCode={profile.referral_code}
              referralCount={profile.referral_count}
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-4 text-center text-xs"
        style={{ color: "#807F71", borderTop: "1px solid #E0DDC1" }}
      >
        © {new Date().getFullYear()} Loop.Talk — Todos os direitos reservados
      </footer>
    </div>
  );
}
