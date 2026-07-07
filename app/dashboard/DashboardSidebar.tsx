"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/dashboard",                label: "Início",          exact: true },
  { href: "/dashboard/perfil",         label: "Perfil público",  exact: false },
  { href: "/dashboard/disponibilidade",label: "Disponibilidade", exact: false },
];

export function DashboardSidebar({
  username,
}: {
  username: string | null;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
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
        {NAV_LINKS.map(({ href, label, exact }) => {
          const active = isActive(href, exact);
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

      <div style={{ marginTop: "auto", padding: "0 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {username && (
          <Link
            href={`/${username}`}
            style={{
              display: "block",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#626053",
              textDecoration: "none",
              border: "1px solid #E4E2D9",
              textAlign: "center",
            }}
          >
            Ver perfil público ↗
          </Link>
        )}
        <Link
          href="/conta"
          style={{
            display: "block",
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "#626053",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          ← Minha Conta
        </Link>
      </div>
    </aside>
  );
}
