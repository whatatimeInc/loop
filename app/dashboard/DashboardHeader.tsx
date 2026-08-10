"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "./DashboardShell";
import { tokens } from "@/components/ui/tokens";

const DARK   = "var(--color-gray-900)";
const MUTED  = "var(--color-gray-600)";
const BORDER = "#E4E2D9";
const BEIGE  = "var(--color-gray-100)";

const TITLES: Record<string, string> = {
  "/dashboard":                 "Home",
  "/dashboard/agenda":          "Agenda",
  "/dashboard/perfil":          "Editar perfil",
  "/dashboard/pagamentos":      "Pagamentos",
  "/dashboard/configuracoes":   "Configurações",
  "/dashboard/sessoes":         "Minhas sessões",
};

function IcoCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function IcoOpen() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

export function DashboardHeader() {
  const { mode, profile } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const title = TITLES[pathname] ?? "Dashboard";
  const firstName = profile.name?.split(" ")[0] ?? "você";
  const isHome = pathname === "/dashboard";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleCopy() {
    if (!profile.username) return;
    navigator.clipboard.writeText(`loop.talk/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header style={{
      height: 64, flexShrink: 0,
      borderBottom: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", background: "var(--color-cream)",
    }}>
      {/* Title / greeting */}
      <div>
        {isHome ? (
          <span style={{ fontSize: 18, fontWeight: 600, color: DARK }}>
            Olá, {firstName}
          </span>
        ) : (
          <span style={{ fontSize: 16, fontWeight: 600, color: DARK }}>{title}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Public link pill — mentor mode only */}
        {mode === "mentor" && profile.username && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 10px 6px 14px", borderRadius: 999,
            background: BEIGE, border: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
              loop.talk/{profile.username}
            </span>
            <button
              onClick={handleCopy}
              title={copied ? "Copiado!" : "Copiar link"}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: 6,
                border: "none", background: copied ? tokens.lime : "white",
                color: DARK, cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <IcoCopy />
            </button>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              title="Abrir perfil"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 26, height: 26, borderRadius: 6,
                background: "white", color: DARK, textDecoration: "none",
              }}
            >
              <IcoOpen />
            </a>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleSignOut}
          style={{
            background: "none", border: "none",
            fontSize: 13, color: MUTED, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
