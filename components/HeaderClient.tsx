"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/LogoutButton";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {open ? (
        <>
          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M4 6h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function HeaderClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(!isHome);
  // TODO: definir itens do menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  const glassStyle = {
    background: "rgba(255,255,255,0.70)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.40)",
    boxShadow: "0 4px 24px rgba(39,38,24,0.06)",
  } as React.CSSProperties;

  return (
    <header className="fixed top-0 md:top-8 left-0 right-0 z-50 flex justify-center md:px-4">

      {/* Desktop nav pill — always glass */}
      <nav
        className="hidden md:flex items-center justify-between gap-4 px-4 md:py-2 md:rounded-xl w-full md:max-w-3xl"
        style={{
          ...glassStyle,
          color: "#272618",
        }}
      >
        <a href="/" aria-label="Ir para a Home">
          <Logo size="header" />
        </a>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link href="/conta" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">Minha conta</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">Entrar</Link>
              <span className="hidden md:inline-flex">
                <LinkButton href="/cadastro" variant="brand-primary">Criar perfil</LinkButton>
              </span>
            </>
          )}
        </div>
      </nav>

      {/* Mobile nav bar */}
      <nav
        className="flex md:hidden items-center justify-between px-8 h-20 w-full"
        style={{
          ...(transparent ? {} : {
            background: "rgba(255,255,255,0.70)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.30)",
          }),
          transition: "background 0.3s ease, backdrop-filter 0.3s ease",
          color: transparent ? "#FCFBF8" : "#272618",
        }}
      >
        <a href="/" aria-label="Ir para a Home">
          <Logo size="header" white={transparent} />
        </a>

        {/* TODO: definir itens do menu mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            padding: 0,
          }}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </nav>

    </header>
  );
}
