"use client";

import { useEffect, useRef, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { SectionHeader } from "@/components/home/SectionHeader";
import { SwipeCarousel } from "@/components/home/SwipeCarousel";
import { ExpertGlassCard } from "@/components/ExpertGlassCard";
import type { Categoria } from "@/lib/mockExperts";
import { useRevealOnView, revealStyle } from "@/components/home/useReveal";
import type { LaunchPhase } from "@/lib/launch";

// Featured creators on the home page. Empty until the team's own profiles
// exist (Broome BOOK-8): the previous placeholders were real public figures
// who never authorised the use of their name or photo. While empty, the
// section renders nothing.
// TODO: no per-mentor videos exist yet, so set `video` per creator when added;
// leave it undefined to render a still photo only.
const CREATORS: {
  slug: string; name: string; description: string; categoria: Categoria; video?: string;
}[] = [];

// Portrait proportion from the 1440px reference: 343 wide by 500 tall.
const CARD_W     = 343;
const CARD_RATIO = "343 / 500";

function CreatorsSectionContent({ phase }: { phase: LaunchPhase }) {
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
      {/* ── Header row: section header left, CTA right ── */}
      <div
        style={{
          display:        "flex",
          flexDirection:  isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems:     isMobile ? "stretch" : "flex-start",
          gap:            isMobile ? 24 : 32,
          marginBottom:   isMobile ? 40 : 56,
        }}
      >
        <SectionHeader
          number="(05)"
          title="Nossos criadores"
          subtitle="Founders, especialistas e criadores que abriram a agenda."
          isMobile={isMobile}
        />

        {/* Fase pré: fatia fica sem CTA -- header sozinho no
            justify-content:space-between não deixa vão de espaçamento. */}
        {!isPre && (
          <div style={{ display: "flex", flexShrink: 0, alignSelf: isMobile ? "stretch" : "auto" }}>
            <LinkButton
              href="/cadastro"
              variant="brand-secondary"
              layout="icon-text"
              icon={<ArrowIcon />}
              className={isMobile ? "w-full" : undefined}
            >
              Entrar no Loop.Talk
            </LinkButton>
          </div>
        )}
      </div>

      {/* ── Cards ──
             Mobile: swipe carousel, same component as the expert section.
             Desktop: centred grid whose columns cap at 343px and shrink below
             it, so 2, 3 or 4 creators all stay balanced inside the margins. */}
      {isMobile ? (
        // The rail bleeds to the screen edge; the 24px margin is the track's
        // padding (and scroll-padding), so the first card starts on the margin
        // and `start` snaps land there too. Never a margin on the card itself.
        <SwipeCarousel
          name="creators"
          align="start"
          slideBasis="78vw"
          padStart="24px"
          padEnd="24px"
          gap={12}
          // Cancels the section's own side padding so the track can bleed.
          style={{ marginLeft: -padX, marginRight: -padX }}
        >
          {CREATORS.map((c) => (
            <ExpertGlassCard
              key={c.slug}
              photoSrc={`/mentors/${c.slug}/profile.webp`}
              name={c.name}
              description={c.description}
              categoria={c.categoria}
              variant="dark"
              // No video on touch — the carousel must not reintroduce it.
              aspectRatio={CARD_RATIO}
              sizes="78vw"
            />
          ))}
        </SwipeCarousel>
      ) : (
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: `repeat(${CREATORS.length}, minmax(0, ${CARD_W}px))`,
            justifyContent:      "center",
            gap:                 24,
          }}
        >
          {CREATORS.map((c) => (
            <ExpertGlassCard
              key={c.slug}
              photoSrc={`/mentors/${c.slug}/profile.webp`}
              name={c.name}
              description={c.description}
              categoria={c.categoria}
              // Dark glass: this section sits on the dark home background.
              variant="dark"
              videoSrc={c.video}
              aspectRatio={CARD_RATIO}
              sizes={`${CARD_W}px`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Renders nothing while there are no featured creators to show. */
export function CreatorsSection(props: { phase: LaunchPhase }) {
  if (CREATORS.length === 0) return null;
  return <CreatorsSectionContent {...props} />;
}
