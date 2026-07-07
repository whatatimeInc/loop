"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { HostActivationSheet } from "./HostActivationSheet";

const NAV_LINKS = [
  { href: "/conta/sessoes",       label: "Sessões" },
  { href: "/conta/avaliacoes",    label: "Avaliações" },
  { href: "/conta/configuracoes", label: "Configurações" },
];

export function ContaSidebar({
  hostActivated,
  userId,
  initialName,
  initialLastName,
  initialOnboardingStep,
}: {
  hostActivated: boolean;
  userId: string;
  initialName: string;
  initialLastName: string;
  initialOnboardingStep: string | null;
}) {
  const pathname = usePathname();
  const [showActivation, setShowActivation] = useState(false);

  return (
    <>
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid #E4E2D9",
          display: "flex",
          flexDirection: "column",
          padding: "32px 0",
          background: "#FCFBF8",
          minHeight: "100vh",
        }}
      >
        <div style={{ padding: "0 24px", marginBottom: 40 }}>
          <Logo size="header" />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#272618" : "#626053",
                  background: active ? "rgba(234,234,104,0.15)" : "transparent",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", padding: "0 12px" }}>
          {hostActivated ? (
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#272618",
                background: "#EAEA68",
                textDecoration: "none",
              }}
            >
              Ir para o Painel →
            </Link>
          ) : (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "#F4F2EB",
                border: "1px solid #E4E2D9",
              }}
            >
              <p style={{ fontSize: 12, color: "#626053", margin: "0 0 8px" }}>
                Quer monetizar seu tempo?
              </p>
              <button
                onClick={() => setShowActivation(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#272618",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Ativar modo Host →
              </button>
            </div>
          )}
        </div>
      </aside>

      {showActivation && (
        <HostActivationSheet
          userId={userId}
          initialStep={initialOnboardingStep}
          initialName={initialName}
          initialLastName={initialLastName}
          onClose={() => setShowActivation(false)}
        />
      )}
    </>
  );
}
