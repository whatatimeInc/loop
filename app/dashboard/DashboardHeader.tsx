"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TITLES: Record<string, string> = {
  "/dashboard":                "Painel",
  "/dashboard/perfil":         "Perfil público",
  "/dashboard/disponibilidade":"Disponibilidade",
};

export function DashboardHeader({
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

  const title = TITLES[pathname] ?? "Painel";

  const initials = [name, lastName]
    .filter(Boolean)
    .map((s) => s![0].toUpperCase())
    .join("")
    .slice(0, 2) || "?";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header
      style={{
        height: 64,
        borderBottom: "1px solid #E4E2D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "#FCFBF8",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 600, color: "#272618" }}>{title}</span>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={handleSignOut}
          style={{
            background: "none",
            border: "none",
            fontSize: 13,
            color: "#626053",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sair
        </button>

        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name ?? ""}
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#EAEA68",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#272618",
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
