"use client";

import { useEffect, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";

const HOST_GROTESK = "Host Grotesk, var(--font-host-grotesk), sans-serif";
const INTER        = "Inter, var(--font-inter), sans-serif";

/**
 * "neutral" is the home look: olive card with brand-yellow content.
 * "brand" flips it for pages that need the banner to read as a highlight.
 * Both consume Button and Logo as-is — neither is modified here.
 */
export type JoinBannerVariant = "neutral" | "brand";

const VARIANT: Record<JoinBannerVariant, {
  card: string; ink: string; button: "brand-secondary" | "neutral-secondary";
}> = {
  neutral: { card: tokens.neutral600, ink: tokens.lime, button: "brand-secondary" },
  brand:   { card: tokens.lime,       ink: tokens.dark, button: "neutral-secondary" },
};

const DEFAULT_CHIPS = ["Networking", "Criatividade", "Inspiração"];

export function JoinBanner({
  variant     = "neutral",
  chips       = DEFAULT_CHIPS,
  title       = <>Faça parte do Loop.Talk<br />e inspire pessoas.</>,
  description = "Conecte-se virtualmente, aconselhe e ganhe pelo seu tempo.",
  ctaLabel    = "Criar Loop.Talk",
  ctaHref     = "/cadastro",
}: {
  variant?:     JoinBannerVariant;
  chips?:       string[];
  title?:       React.ReactNode;
  description?: string;
  ctaLabel?:    string;
  ctaHref?:     string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const look = VARIANT[variant];
  const padX = isMobile ? 24 : 120;

  return (
    <section
      style={{
        background:   "var(--color-surface-canvas)",
        paddingLeft:  padX,
        paddingRight: padX,
        paddingTop:   isMobile ? 24 : 40,
        paddingBottom: isMobile ? 56 : 88,
      }}
    >
      <div
        style={{
          background:   look.card,
          borderRadius: 32,
          padding:      isMobile ? "48px 24px" : "80px 120px",
          display:        "flex",
          flexDirection:  isMobile ? "column" : "row",
          alignItems:     "flex-start",
          // 240px is the Figma gap, but with 120px of section margin AND 120px
          // of card padding there is only 960px of content at 1440 — a gap that
          // wide squeezes the title onto three lines. This scales it down so the
          // headline keeps its two intended lines at the reference width.
          gap:            isMobile ? 40 : "clamp(48px, 10vw, 240px)",
        }}
      >
        {/* ── Left: chips + wordmark ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-start",
            gap:           32,
            flexShrink:    0,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {chips.map((c) => (
              <span
                key={c}
                style={{
                  padding:      "8px 12px",
                  borderRadius: 99,
                  outline:      `1px solid ${look.ink}`,
                  outlineOffset: -1,
                  color:        look.ink,
                  fontFamily:   INTER,
                  fontSize:     14,
                  fontWeight:   400,
                  lineHeight:   "20px",
                  textTransform: "uppercase",
                  whiteSpace:   "nowrap",
                }}
              >
                {c}
              </span>
            ))}
          </div>

          {/* A cor vem do contexto (look.ink); a altura, do className. A 80px
              o wordmark tem 336px de largura e estoura o card mobile, por isso
              ele desce lá. */}
          <Logo
            size="hero"
            style={{ color: look.ink }}
            className={isMobile ? "!h-14 w-auto" : "!h-20 w-auto"}
          />
        </div>

        {/* ── Right: copy + CTA ── */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2
              style={{
                fontFamily: HOST_GROTESK,
                fontSize:   isMobile ? 28 : 40,
                fontWeight: 500,
                lineHeight: isMobile ? "32px" : "44px",
                color:      look.ink,
                margin:     0,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontFamily: INTER,
                fontSize:   16,
                fontWeight: 400,
                lineHeight: "24px",
                color:      look.ink,
                maxWidth:   320,
                margin:     0,
              }}
            >
              {description}
            </p>
          </div>

          <div style={{ display: "flex", alignSelf: isMobile ? "stretch" : "auto", minWidth: 0 }}>
            <LinkButton
              href={ctaHref}
              variant={look.button}
              layout="icon-text"
              icon={<ArrowIcon />}
              className={isMobile ? "w-full" : undefined}
            >
              {ctaLabel}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
