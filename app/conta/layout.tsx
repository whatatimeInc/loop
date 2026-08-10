import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContaSidebar } from "./ContaSidebar";
import { ContaHeader } from "./ContaHeader";

export default async function ContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/conta");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, last_name, photo_url, host_profile_activated, onboarding_step")
    .eq("id", user.id)
    .single();

  const hostActivated = profile?.host_profile_activated ?? false;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-cream)" }}>
      <ContaSidebar
        hostActivated={hostActivated}
        userId={user.id}
        initialName={profile?.name ?? ""}
        initialLastName={profile?.last_name ?? ""}
        initialOnboardingStep={profile?.onboarding_step ?? null}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <ContaHeader
          name={profile?.name ?? null}
          lastName={profile?.last_name ?? null}
          photoUrl={profile?.photo_url ?? null}
          userId={user.id}
        />
        <main style={{ flex: 1, padding: "32px 48px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
