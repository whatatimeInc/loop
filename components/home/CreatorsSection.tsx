"use client";

import { useEffect, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ExpertGlassCard } from "@/components/ExpertGlassCard";
import type { Categoria } from "@/lib/mockExperts";

// Placeholder roster — swap for real featured creators when they are picked.
// TODO: no per-mentor videos exist yet (public/mentors/* only has photos), so
// every card points at the same sample clip. Drop per-creator mp4s in and set
// `video` accordingly; leave it undefined to render a still photo only.
const CREATORS: {
  slug: string; name: string; description: string; categoria: Categoria; video?: string;
}[] = [
  {
    slug:        "andre-do-amaral",
    name:        "André Do Amaral",
    description: "Designer e diretor criativo. Identidade visual e branding.",
    categoria:   "Criatividade",
    video:       "/homepage-hero-423-2.mp4",
  },
  {
    slug:        "mauricio-arruda",
    name:        "Mauricio Arruda",
    description: "Arquitetura e Design. Sócio e diretor criativo da MAU.",
    categoria:   "Criatividade",
    video:       "/homepage-hero-423-2.mp4",
  },
];

// Portrait proportion from the 1440px reference: 343 wide by 500 tall.
const CARD_W     = 343;
const CARD_RATIO = "343 / 500";

export function CreatorsSection() {
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

        <div style={{ display: "flex", flexShrink: 0, alignSelf: isMobile ? "stretch" : "auto" }}>
          <LinkButton
            href="/cadastro"
            variant="brand-secondary"
            layout="icon-text"
            icon={<ArrowIcon />}
            className={isMobile ? "w-full" : undefined}
          >
            Join Loop.Talk
          </LinkButton>
        </div>
      </div>

      {/* ── Cards: side by side on desktop, stacked on mobile. Columns cap at
             343px and shrink below it, and the track is centred — so 2, 3 or 4
             creators all stay balanced inside the 120px margins with no code
             change. ── */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : `repeat(${CREATORS.length}, minmax(0, ${CARD_W}px))`,
          justifyContent: "center",
          gap: isMobile ? 16 : 24,
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
            // No hover on touch — mobile gets the still photo only.
            videoSrc={isMobile ? undefined : c.video}
            aspectRatio={CARD_RATIO}
            sizes={isMobile ? "100vw" : `${CARD_W}px`}
          />
        ))}
      </div>
    </section>
  );
}
