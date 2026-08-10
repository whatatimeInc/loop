import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell, type DashboardProfile } from "./DashboardShell";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  let { data: p } = await supabase
    .from("profiles")
    .select("id, name, last_name, username, photo_url, is_mentor, hourly_price, whatsapp, headline, pix_key, onboarding_completed")
    .eq("id", user.id)
    .single();

  // Profile doesn't exist yet — create it from auth user data
  if (!p) {
    const email = user.email ?? "";
    await supabase.from("profiles").upsert({
      id: user.id,
      email,
      name: user.user_metadata?.name ?? email.split("@")[0],
      last_name: user.user_metadata?.last_name ?? null,
    });
    const { data: created } = await supabase
      .from("profiles")
      .select("id, name, last_name, username, photo_url, is_mentor, hourly_price, whatsapp, headline, pix_key, onboarding_completed")
      .eq("id", user.id)
      .single();
    p = created;
  }

  if (!p) redirect("/login");

  const profile: DashboardProfile = {
    id: p.id,
    name: p.name ?? null,
    last_name: p.last_name ?? null,
    username: p.username ?? null,
    photo_url: p.photo_url ?? null,
    is_mentor: p.is_mentor ?? false,
    hourly_price: p.hourly_price ?? null,
    whatsapp: p.whatsapp ?? null,
    headline: p.headline ?? null,
    pix_key: p.pix_key ?? null,
    onboarding_completed: p.onboarding_completed ?? false,
  };

  return (
    <DashboardShell profile={profile}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-cream)" }}>
        <DashboardSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <DashboardHeader />
          <main style={{ flex: 1, padding: "32px 40px", maxWidth: 860 }}>
            {children}
          </main>
        </div>
      </div>
    </DashboardShell>
  );
}
