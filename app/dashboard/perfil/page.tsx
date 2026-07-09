import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./PerfilForm";

export default async function DashboardPerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, name, last_name, headline, bio, photo_url")
    .eq("id", user!.id)
    .single();

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#272618", margin: "0 0 8px" }}>
          Perfil público
        </h1>
        <p style={{ fontSize: 14, color: "#626053", margin: 0 }}>
          Estas informações aparecem na sua página pública para visitantes.
        </p>
      </div>

      <PerfilForm
        userId={user!.id}
        username={profile?.username ?? null}
        firstName={profile?.name ?? null}
        lastName={profile?.last_name ?? null}
        initialData={{
          headline: profile?.headline ?? "",
          bio: profile?.bio ?? "",
          photo_url: profile?.photo_url ?? "",
        }}
      />
    </div>
  );
}
