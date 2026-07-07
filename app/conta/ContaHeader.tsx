"use client";

import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/conta/sessoes":                       "Minhas sessões",
  "/conta/avaliacoes":                    "Avaliações",
  "/conta/configuracoes":                 "Configurações",
  "/conta/configuracoes/seguranca":       "Segurança",
};

export function ContaHeader({
  name,
  lastName,
  photoUrl,
  userId,
}: {
  name: string | null;
  lastName: string | null;
  photoUrl: string | null;
  userId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? "Minha conta";
  const initials = [name?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid #E4E2D9",
        background: "#FCFBF8",
      }}
    >
      <h1
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "#272618",
          margin: 0,
          fontFamily: "var(--font-host-grotesk)",
        }}
      >
        {title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: photoUrl ? "transparent" : "#EAEA68",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#272618",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials
          )}
        </div>

        <span style={{ fontSize: 14, color: "#272618", fontWeight: 500 }}>
          {[name, lastName].filter(Boolean).join(" ") || "Usuário"}
        </span>

        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid #E4E2D9",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 13,
            color: "#626053",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
