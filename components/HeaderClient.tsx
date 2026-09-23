"use client";

import { Logo } from "@/components/Logo";
import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/LogoutButton";
import { tokens } from "@/components/ui/tokens";
import { useWaitlistModal } from "@/components/WaitlistModalProvider";
import type { LaunchPhase } from "@/lib/launch";

const PILL: React.CSSProperties = {
  background: tokens.lime,
  borderRadius: 99,
  alignItems: "center",
  color: tokens.dark,
};

export function HeaderClient({ isLoggedIn, phase }: { isLoggedIn: boolean; phase: LaunchPhase }) {
  const { open: openWaitlistModal } = useWaitlistModal();
  const isPre = phase === "pre";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "16px 16px 0",
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
        <Link href="/" aria-label="Ir para a Home" style={{ display: "inline-flex" }}>
          <Logo size="header" />
        </Link>

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
          ) : isPre ? (
            <Button variant="neutral-secondary" onClick={openWaitlistModal}>
              Entrar na lista
            </Button>
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
        <Link href="/" aria-label="Ir para a Home" style={{ display: "inline-flex" }}>
          <Logo size="header" />
        </Link>
        {isPre ? (
          <button
            onClick={openWaitlistModal}
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: tokens.dark,
              fontFamily: "inherit",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            Entrar na lista
          </button>
        ) : (
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
        )}
      </nav>
    </header>
  );
}
