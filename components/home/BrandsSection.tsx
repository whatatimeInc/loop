"use client";

import { useEffect, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { tokens } from "@/components/ui/tokens";

const HOST_GROTESK = "Host Grotesk, var(--font-host-grotesk), sans-serif";
const INTER        = "Inter, var(--font-inter), sans-serif";

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

export function BrandsSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const padX = isMobile ? 24 : 120;

  return (
    <section
      style={{
        background:    "#232311",
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
          {/* "(04)" hangs in its own column; the title, the description AND the
              CTA all sit in the column beside it, sharing one left edge. */}
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span
              style={{
                color:      tokens.lime,
                fontSize:   24,
                fontWeight: 500,
                fontFamily: HOST_GROTESK,
                flexShrink: 0,
              }}
            >
              (04)
            </span>

            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "flex-start",
                gap:           isMobile ? 20 : 28,
                minWidth:      0,
                flex:          1,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span
                  style={{
                    color:      tokens.lime,
                    fontFamily: HOST_GROTESK,
                    fontSize:   20,
                    fontWeight: 500,
                    lineHeight: 1.25,
                  }}
                >
                  Criações dos nossos experts
                </span>
                <p
                  style={{
                    color:      tokens.lime,
                    fontFamily: INTER,
                    fontSize:   14,
                    fontWeight: 400,
                    lineHeight: 1.45,
                    margin:     0,
                  }}
                >
                  Founders, especialistas e criadores que abriram a agenda.
                </p>
              </div>

              {/* Stretches to the text column on mobile — never to the "(04)" edge. */}
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
            </div>
          </div>
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
