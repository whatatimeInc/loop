"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Linkedin } from "iconoir-react";
import { Logo } from "@/components/Logo";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { tokens, withAlpha } from "@/components/ui/tokens";

const HOST_GROTESK = "Host Grotesk, var(--font-host-grotesk), sans-serif";
const INTER        = "Inter, var(--font-inter), sans-serif";

// "Create a profile and start monetizing" is 336px wide at the button's 20px
// type; with the icon and padding it needs 396px, but a 375px screen only
// leaves 293px. The shared Button is nowrap + fixed 56px height, so on mobile
// the label would simply be clipped. Here it wraps and the pill grows instead.
// !important is required because Button applies these as inline styles.
const CTA_CSS = `
  .footer-cta > a {
    padding-left: 24px !important;
    padding-right: 24px !important;
    white-space: normal !important;
    height: auto !important;
    min-height: 56px;
    padding-top: 12px !important;
    padding-bottom: 12px !important;
    text-align: center;
  }
`;

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

export function Footer() {
  const isMobile = useIsMobile();

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
      <style dangerouslySetInnerHTML={{ __html: CTA_CSS }} />
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
              className={isMobile ? "footer-cta" : undefined}
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
              {/* Dark fill. neutral-primary is the only variant that reads on brand. */}
              <LinkButton
                href="/cadastro"
                variant="neutral-primary"
                layout="icon-text"
                icon={<ArrowIcon />}
                className={isMobile ? "w-full" : undefined}
              >
                Create a profile and start monetizing
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
