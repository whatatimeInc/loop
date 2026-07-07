import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, last_name, photo_url, username, host_profile_activated")
    .eq("id", user.id)
    .single();

  if (!profile?.host_profile_activated) {
    redirect("/conta");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FCFBF8" }}>
      <DashboardSidebar username={profile?.username ?? null} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <DashboardHeader
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
