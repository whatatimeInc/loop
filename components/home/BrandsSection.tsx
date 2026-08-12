"use client";

import { useEffect, useRef, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { SectionHeader } from "@/components/home/SectionHeader";
import { tokens } from "@/components/ui/tokens";
import { useRevealOnView, revealStyle } from "@/components/home/useReveal";
import type { LaunchPhase } from "@/lib/launch";

const HOST_GROTESK = "Host Grotesk, var(--font-host-grotesk), sans-serif";

// Indenting the CTA to the text column costs 62px on a 375px screen, which leaves
// less room than the button's default 40px side padding needs. Tightening it here
// keeps the button inside the right margin without touching the shared Button.
// !important is required because Button applies its padding as an inline style.
const CTA_CSS = `
  .brands-cta > a {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
`;

// Static list — no hover, no cursor image (unlike the categories in Fatia 2).
const BRANDS = [
  "Zee.Dog",
  "Mamba",
  "Simple Gym",
  "Reserva",
  "Savee.it",
  "Work & Co",
];

export function BrandsSection({ phase }: { phase: LaunchPhase }) {
  const [isMobile, setIsMobile] = useState(false);
  const isPre = phase === "pre";
  const sectionRef = useRef<HTMLElement>(null);
  const revealPhase = useRevealOnView(sectionRef);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const padX = isMobile ? 24 : 120;

  return (
    <section
      ref={sectionRef}
      style={{
        ...revealStyle(revealPhase),
        background:    "var(--color-surface-canvas)",
        paddingTop:    isMobile ? 56 : 88,
        paddingBottom: isMobile ? 72 : 112,
        paddingLeft:   padX,
        paddingRight:  padX,
        position:      "relative",
        overflow:      "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CTA_CSS }} />
      <div
        style={{
          display:       "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems:    "flex-start",
          gap:           isMobile ? 40 : 64,
        }}
      >
        {/* ── Left column: header + CTA (same type scale as Fatia 2) ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-start",
            flexShrink:    0,
            maxWidth:      isMobile ? "100%" : 360,
          }}
        >
          {/* "(04)" hangs to the left; the title, the description AND the CTA
              sit in the column beside it, sharing one left edge. */}
          <SectionHeader
            number="(04)"
            title="Criações dos nossos experts"
            subtitle="Founders, especialistas e criadores que abriram a agenda."
            isMobile={isMobile}
          >
            {/* Fase pré: fatia fica sem CTA -- SectionHeader trata children
                como opcional, então isto não deixa vão de espaçamento. */}
            {!isPre && (
              <div
                className={isMobile ? "brands-cta" : undefined}
                style={{ display: "flex", alignSelf: isMobile ? "stretch" : "auto", minWidth: 0 }}
              >
                <LinkButton
                  href="/explorar"
                  variant="brand-secondary"
                  layout="icon-text"
                  icon={<ArrowIcon />}
                  className={isMobile ? "w-full" : undefined}
                >
                  Encontrar experts
                </LinkButton>
              </div>
            )}
          </SectionHeader>
        </div>

        {/* ── Right column: brand list, large static type ── */}
        <p
          style={{
            fontFamily: HOST_GROTESK,
            fontSize:   isMobile ? 48 : 80,
            fontWeight: 500,
            lineHeight: isMobile ? 1.1 : 1.05,
            color:      tokens.lime,
            margin:     0,
            flex:       1,
            minWidth:   0,
          }}
        >
          {BRANDS.join(" / ")}
        </p>
      </div>
    </section>
  );
}
