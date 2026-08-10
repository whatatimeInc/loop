import { createClient } from "@/lib/supabase/server";
import { SegurancaClient } from "./SegurancaClient";

export const metadata = { title: "Segurança — Loop.Talk" };

export default async function SegurancaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <a
          href="/conta/configuracoes"
          style={{ color: "var(--color-gray-400)", fontSize: 14, textDecoration: "none" }}
        >
          Configurações
        </a>
        <span style={{ color: "var(--color-gray-400)" }}>›</span>
        <span style={{ fontSize: 14, color: "var(--color-gray-900)" }}>Segurança</span>
      </div>

      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "var(--color-gray-900)",
          marginBottom: 32,
          fontFamily: "var(--font-host-grotesk)",
        }}
      >
        Segurança
      </h1>

      <SegurancaClient
        email={user!.email ?? ""}
        hasPassword={profile?.has_password ?? false}
      />
    </div>
  );
}
