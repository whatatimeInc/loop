import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Minhas sessões — Loop.Talk" };

export default async function SessoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // TODO: fetch real bookings when booking table exists
  const sessoes: unknown[] = [];

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "var(--color-gray-900)",
          marginBottom: 32,
          fontFamily: "var(--font-host-grotesk)",
        }}
      >
        Minhas sessões
      </h1>

      {sessoes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--color-gray-400)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 auto 16px", display: "block" }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Nenhuma sessão ainda</p>
          <p style={{ fontSize: 14, color: "#C4C2B9" }}>
            Quando você agendar uma conversa, ela aparecerá aqui.
          </p>
        </div>
      ) : null}
    </div>
  );
}
