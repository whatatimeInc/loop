import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Configurações — Loop.Talk" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, last_name, email")
    .eq("id", user!.id)
    .single();

  const sections = [
    {
      label: "Informações básicas",
      desc: "Nome e dados de perfil.",
      href: "#basico",
    },
    {
      label: "Segurança",
      desc: "E-mail, senha e autenticação.",
      href: "/conta/configuracoes/seguranca",
    },
  ];

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
        Configurações
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
        {sections.map(({ label, desc, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              background: "var(--color-bg-white)",
              borderRadius: 12,
              border: "1px solid #E4E2D9",
              textDecoration: "none",
            }}
          >
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-gray-900)", margin: 0 }}>{label}</p>
              <p style={{ fontSize: 13, color: "var(--color-gray-600)", margin: "4px 0 0" }}>{desc}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5l5 5-5 5" stroke="var(--color-gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
