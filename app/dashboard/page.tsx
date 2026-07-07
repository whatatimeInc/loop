import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, username, headline")
    .eq("id", user!.id)
    .single();

  const { data: sessionTypes } = await supabase
    .from("session_types")
    .select("id, label, duration_minutes, price_brl, active")
    .eq("host_id", user!.id)
    .order("created_at");

  const activeTypes = (sessionTypes ?? []).filter((s) => s.active);

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#272618", margin: 0 }}>
          Olá, {profile?.name?.split(" ")[0] ?? "Host"} 👋
        </h1>
        {profile?.headline && (
          <p style={{ fontSize: 14, color: "#626053", marginTop: 4 }}>{profile.headline}</p>
        )}
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Sessões agendadas", value: "0" },
          { label: "Receita total", value: "R$ 0,00" },
          { label: "Avaliação média", value: "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              padding: "20px 24px",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #E4E2D9",
            }}
          >
            <p style={{ fontSize: 12, color: "#626053", margin: "0 0 6px" }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#272618", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Session types */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#272618", margin: 0 }}>
            Tipos de sessão
          </h2>
          <Link
            href="/dashboard/perfil"
            style={{ fontSize: 13, color: "#626053", textDecoration: "none", fontWeight: 500 }}
          >
            Editar →
          </Link>
        </div>

        {activeTypes.length === 0 ? (
          <div
            style={{
              padding: "32px 24px",
              background: "#F4F2EB",
              borderRadius: 12,
              border: "1px dashed #E4E2D9",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 14, color: "#626053", margin: "0 0 12px" }}>
              Nenhum tipo de sessão ativo ainda.
            </p>
            <Link
              href="/dashboard/perfil"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#272618",
                textDecoration: "none",
              }}
            >
              Configurar sessões →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeTypes.map((st) => (
              <div
                key={st.id}
                style={{
                  padding: "14px 20px",
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #E4E2D9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#272618", margin: 0 }}>
                    {st.label || `${st.duration_minutes} min`}
                  </p>
                  <p style={{ fontSize: 12, color: "#626053", margin: "2px 0 0" }}>
                    {st.duration_minutes} minutos
                  </p>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#272618", margin: 0 }}>
                  R$ {(st.price_brl / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link
          href="/dashboard/perfil"
          style={{
            padding: "20px 24px",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E4E2D9",
            textDecoration: "none",
            display: "block",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "#272618", margin: "0 0 4px" }}>
            Editar perfil público
          </p>
          <p style={{ fontSize: 12, color: "#626053", margin: 0 }}>
            Headline, bio e foto
          </p>
        </Link>
        <Link
          href="/dashboard/disponibilidade"
          style={{
            padding: "20px 24px",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E4E2D9",
            textDecoration: "none",
            display: "block",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "#272618", margin: "0 0 4px" }}>
            Configurar disponibilidade
          </p>
          <p style={{ fontSize: 12, color: "#626053", margin: 0 }}>
            Horários disponíveis por dia
          </p>
        </Link>
      </div>
    </div>
  );
}
