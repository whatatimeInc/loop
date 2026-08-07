"use client";

import { Logo } from "@/components/Logo";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/LogoutButton";
import { tokens } from "@/components/ui/tokens";

const PILL: React.CSSProperties = {
  background: tokens.lime,
  borderRadius: 99,
  alignItems: "center",
  color: tokens.dark,
};

export function HeaderClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        padding: "16px 16px 16px",
        background: "#232311",
      }}
    >
      {/* ── Desktop pill ── */}
      <nav
        className="hidden md:grid"
        style={{
          ...PILL,
          gridTemplateColumns: "1fr auto 1fr",
          padding: "10px 20px 10px 40px",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {/* Esquerda: Logo */}
        <a href="/" aria-label="Ir para a Home" style={{ display: "inline-flex" }}>
          <Logo size="header" />
        </a>

        {/* Centro: tagline */}
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            whiteSpace: "nowrap",
            color: tokens.dark,
          }}
        >
          Conversas com especialistas.
        </span>

        {/* Direita: CTA ou estado logado */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
          }}
        >
          {isLoggedIn ? (
            <>
              <Link
                href="/conta"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: tokens.dark,
                  opacity: 0.7,
                  textDecoration: "none",
                }}
              >
                Minha conta
              </Link>
              <LogoutButton />
            </>
          ) : (
            <LinkButton href="/cadastro" variant="neutral-secondary">
              Criar Loop.Talk
            </LinkButton>
          )}
        </div>
      </nav>

      {/* ── Mobile pill ── */}
      <nav
        className="flex md:hidden items-center justify-between"
        style={{
          ...PILL,
          padding: "14px 24px",
        }}
      >
        <a href="/" aria-label="Ir para a Home" style={{ display: "inline-flex" }}>
          <Logo size="header" />
        </a>
        <Link
          href="/login"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: tokens.dark,
            textDecoration: "none",
          }}
        >
          Entrar
        </Link>
      </nav>
    </header>
  );
}
