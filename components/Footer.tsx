"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Linkedin } from "iconoir-react";
import { Logo } from "@/components/Logo";
import { Button, LinkButton, ArrowIcon } from "@/components/ui/Button";
import { tokens, withAlpha } from "@/components/ui/tokens";
import { useWaitlistModal } from "@/components/WaitlistModalProvider";
import type { LaunchPhase } from "@/lib/launch";

const HOST_GROTESK = "Host Grotesk, var(--font-host-grotesk), sans-serif";
const INTER        = "Inter, var(--font-inter), sans-serif";

// TODO: /termos and /privacidade do not exist yet — placeholder links.
const LEGAL = [
  { label: "Termos e Condições",     href: "#" },
  { label: "Política de Privacidade", href: "#" },
];

const SOCIAL = [
  { label: "Instagram", href: "#", Icon: Instagram },
  { label: "LinkedIn",  href: "#", Icon: Linkedin  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/** 48×48 circular social button — the design-system icon-only button is 56×56. */
function SocialButton({ label, href, Icon }: (typeof SOCIAL)[number]) {
  return (
    <a
      href={href}
      aria-label={label}
      style={{
        width:          48,
        height:         48,
        borderRadius:   99,
        background:     tokens.dark,
        color:          tokens.bg,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        textDecoration: "none",
      }}
    >
      <Icon width={24} height={24} color="currentColor" />
    </a>
  );
}

export function Footer({ phase }: { phase: LaunchPhase }) {
  const isMobile = useIsMobile();
  const { open: openWaitlistModal } = useWaitlistModal();
  const isPre = phase === "pre";

  const legalStyle: React.CSSProperties = {
    fontFamily:     INTER,
    fontSize:       12,
    fontWeight:     400,
    lineHeight:     "18px",
    color:          tokens.dark,
    textDecoration: "none",
  };

  return (
    <footer style={{ padding: isMobile ? "0 16px 16px" : "0 24px 24px" }}>
      <div
        style={{
          background:   tokens.lime,
          borderRadius: 32,
          // No bottom padding — the bottom bar's own padding is the breathing room.
          padding:      isMobile ? "40px 24px 0" : "48px 48px 0",
          display:        "flex",
          flexDirection:  "column",
          gap:            24,
        }}
      >
        {/* ── Top block ── */}
        <div
          style={{
            display:        "flex",
            flexDirection:  isMobile ? "column" : "row",
            alignItems:     "flex-start",
            justifyContent: "space-between",
            gap:            isMobile ? 40 : 40,
            paddingBottom:  32,
          }}
        >
          {/* Left: headline + CTAs */}
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-start",
              gap:           isMobile ? 32 : 48,
              flex:          1,
              minWidth:      0,
              alignSelf:     isMobile ? "stretch" : "auto",
            }}
          >
            <h2
              style={{
                fontFamily: HOST_GROTESK,
                // Deliberately larger than the hero's version of this line.
                fontSize:   isMobile ? "clamp(32px, 9vw, 44px)" : "clamp(48px, 5.6vw, 80px)",
                fontWeight: 500,
                lineHeight: 1.1,
                color:      tokens.dark,
                margin:     0,
              }}
            >
              Network without<br />the Networking.
            </h2>

            <div
              style={{
                display:       "flex",
                flexDirection: isMobile ? "column" : "row",
                gap:           isMobile ? 12 : 24,
                alignItems:    isMobile ? "stretch" : "center",
                alignSelf:     isMobile ? "stretch" : "auto",
                flexWrap:      "wrap",
                minWidth:      0,
              }}
            >
              {isPre ? (
                // Fase pré: uma ação só, mesmo texto nos dois breakpoints —
                // "Entrar na lista" cabe em 375px, então não há motivo para
                // duas labels da mesma ação.
                <Button
                  variant="neutral-primary"
                  layout="icon-text"
                  icon={<ArrowIcon />}
                  onClick={openWaitlistModal}
                  className={isMobile ? "w-full" : undefined}
                >
                  Entrar na lista
                </Button>
              ) : (
                <>
                  {/* Dark fill. neutral-primary is the only variant that reads on brand.
                      The full label needs 396px at the button's 20px type, so mobile
                      uses a short one rather than wrapping or clipping the pill. */}
                  <LinkButton
                    href="/cadastro"
                    variant="neutral-primary"
                    layout="icon-text"
                    icon={<ArrowIcon />}
                    className={isMobile ? "w-full" : undefined}
                  >
                    {isMobile ? "Criar meu link" : "Create a profile and start monetizing"}
                  </LinkButton>
                  {/* brand-primary's lime fill matches the card, so it reads as the
                      outlined, transparent button the design calls for. */}
                  <LinkButton
                    href="/explorar"
                    variant="brand-primary"
                    layout="icon-text"
                    icon={<ArrowIcon />}
                    className={isMobile ? "w-full" : undefined}
                  >
                    Find an expert
                  </LinkButton>
                </>
              )}
            </div>
          </div>

          {/* Right: wordmark */}
          <div
            style={{
              padding:    isMobile ? 0 : "24px 48px",
              flexShrink: 0,
            }}
          >
            <Logo size="footer" className="!h-10 w-auto" />
          </div>
        </div>

        {/* ── Bottom bar — border-top is inset by the card's own side padding ── */}
        <div
          style={{
            borderTop:      `1px solid ${withAlpha(tokens.dark, 0.15)}`,
            paddingTop:     isMobile ? 24 : 40,
            paddingBottom:  isMobile ? 24 : 40,
            display:        "flex",
            flexDirection:  isMobile ? "column" : "row",
            alignItems:     isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap:            isMobile ? 24 : 32,
          }}
        >
          <span style={{ ...legalStyle, flexShrink: 0 }}>© 2026 Loop.Talk</span>

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {LEGAL.map(({ label, href }) => (
              <Link key={label} href={href} style={legalStyle}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
            {SOCIAL.map((s) => (
              <SocialButton key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
