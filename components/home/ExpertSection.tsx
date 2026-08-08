"use client";

import { useEffect, useRef, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { tokens } from "@/components/ui/tokens";
// Cards reused from the first-generation home — NOT recreated.
// Their internal animations (folder lift/fan, sliding days, price slider) and their
// clipping containers live in HowItWorksSection.tsx; we only drive `playing`.
import {
  ANIMATION_CSS,
  FolderIllustration,
  AgendaCarousel,
  PriceSlider,
} from "@/components/home/HowItWorksSection";

const BG_PHOTO = "/hero/expert-table.jpg";

const CARD_H       = 440;
const CARD_W       = CARD_H; // square cards in the pinned stack
const STEP_COUNT   = 3;
const TRANSITION   = "0.5s cubic-bezier(.4,0,.2,1)";

const STEPS = [
  {
    title:    "Crie seu perfil",
    subtitle: "Em minutos, um link exclusivo para compartilhar com sua audiência.",
    bg:       "#F8F586",
    fg:       "#272618",
    muted:    "#5D5B3F",
    // Local variant: solid folder face instead of glass, scaled down to fit the card.
    // The glass version stays untouched everywhere else it is used.
    render:   (playing: boolean) => (
      <FolderIllustration playing={playing} variant="solid" scale={0.8} />
    ),
  },
  {
    title:    "Defina sua agenda",
    subtitle: "Escolha seus horários e conecte ao Google Calendar.",
    bg:       "#FCFBF8",
    fg:       "#272618",
    muted:    "#6E6C60",
    render:   (playing: boolean) => <AgendaCarousel playing={playing} />,
  },
  {
    title:    "Receba seu valor",
    subtitle: "Defina seu preço e receba na conta de preferência. Sem mensalidade.",
    bg:       "#A39E79",
    fg:       tokens.lime,
    muted:    tokens.lime,
    render:   (playing: boolean) => <PriceSlider playing={playing} />,
  },
];

// ── Card shell ────────────────────────────────────────────────────────────────
// `overflow: hidden` here is the outer guard: combined with each illustration's own
// clip container, the sliding days of step 2 can never leak past the card bounds.
function StepCard({
  title,
  subtitle,
  bg,
  fg,
  muted,
  children,
  stacked,
  offset,
}: {
  title:    string;
  subtitle: string;
  bg:       string;
  fg:       string;
  muted:    string;
  children: React.ReactNode;
  /** true = pinned stack (absolute, transformed); false = plain vertical flow */
  stacked:  boolean;
  offset:   number;
}) {
  // offset < 0 → already consumed: card rises and fades out, revealing the one below
  // offset = 0 → active card, front and centre
  // offset > 0 → peeking behind with a slight drop + reduced scale
  const gone = offset < 0;
  const stackStyle: React.CSSProperties = stacked
    ? {
        position:   "absolute",
        top:        0,
        left:       0,
        right:      0,
        // Outgoing cards stay on top while they rise away, so they uncover the
        // next card instead of sliding up behind it.
        zIndex:     gone ? STEP_COUNT + 1 : STEP_COUNT - offset,
        transform:  gone
          ? "translateY(-120px) scale(0.95)"
          : `translateY(${offset * 22}px) scale(${1 - offset * 0.06})`,
        opacity:    gone ? 0 : 1,
        pointerEvents: offset === 0 ? "auto" : "none",
        transition: `transform ${TRANSITION}, opacity ${TRANSITION}`,
        willChange: "transform, opacity",
      }
    : {};

  return (
    <div
      style={{
        ...stackStyle,
        width:         stacked ? "100%" : "100%",
        maxWidth:      CARD_W,
        height:        stacked ? CARD_H : undefined,
        minHeight:     stacked ? undefined : 400,
        margin:        stacked ? undefined : "0 auto",
        background:    bg,
        border:        "0.5px solid rgba(39,38,24,0.10)",
        borderRadius:  24,
        padding:       "32px 24px 28px",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        overflow:      "hidden",
        minWidth:      0,
        boxShadow:     "0 18px 50px rgba(15,15,8,0.28)",
      }}
    >
      <p
        style={{
          fontSize:   24,
          fontWeight: 300,
          color:      fg,
          margin:     "0 0 8px",
          textAlign:  "center",
          fontFamily: "var(--font-host-grotesk)",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize:   15,
          lineHeight: 1.55,
          color:      muted,
          margin:     0,
          textAlign:  "center",
          maxWidth:   280,
        }}
      >
        {subtitle}
      </p>
      {/* Illustration slot — flex:1 + overflow hidden keeps every internal
          animation contained inside the card. */}
      <div
        style={{
          flex:           1,
          width:          "100%",
          minWidth:       0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          overflow:       "hidden",
          paddingTop:     16,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ExpertSection() {
  const [isMobile, setIsMobile]       = useState(false);
  const [reduceMotion, setReduce]     = useState(false);
  const [activeStep, setActiveStep]   = useState(0);
  const [mounted, setMounted]         = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Pinned stack is desktop-only and motion-sensitive: on touch the pin fights the
  // native scroll, so mobile falls back to a plain vertical stack (see render below).
  const usePin = mounted && !isMobile && !reduceMotion;

  useEffect(() => {
    if (!usePin) return;
    const el = sectionRef.current;
    if (!el) return;

    let trigger: { kill: (r?: boolean) => void } | null = null;
    let cancelled = false;

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // One extra viewport of scroll per state transition (3 states → 2 transitions).
      const distance = () => window.innerHeight * (STEP_COUNT - 1);

      trigger = ScrollTrigger.create({
        trigger:     el,
        start:       "top top",
        end:         () => `+=${distance()}`,
        pin:         true,
        pinSpacing:  true,
        scrub:       true,
        // Discrete states: snap the scroll to the 3 step positions rather than
        // letting the cards sit half-way between two states.
        snap: {
          snapTo:   [0, 0.5, 1],
          duration: { min: 0.15, max: 0.4 },
          delay:    0.04,
          ease:     "power1.inOut",
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(
            STEP_COUNT - 1,
            Math.round(self.progress * (STEP_COUNT - 1))
          );
          setActiveStep((prev) => (prev === i ? prev : i));
        },
      });

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      trigger?.kill(true);
    };
  }, [usePin]);

  const padX = isMobile ? 24 : 120;

  return (
    <>
      {/* FolderIllustration's keyframes travel with the component. */}
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />

      <section
        ref={sectionRef}
        style={{
          position:   "relative",
          width:      "100%",
          minHeight:  usePin ? "100vh" : undefined,
          height:     usePin ? "100vh" : undefined,
          overflow:   "hidden",
          display:    "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding:    isMobile ? "56px 0 64px" : "72px 0 64px",
          background: "#232311",
        }}
      >
        {/* ── Background photo + legibility overlay ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BG_PHOTO}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset:    0,
            width:    "100%",
            height:   "100%",
            objectFit: "cover",
            userSelect: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position:   "absolute",
            inset:      0,
            // The table photo is bright (white walls, direct sun), so the top and
            // bottom bands are heavy enough to hold brand-yellow text over it.
            background:
              "linear-gradient(180deg, rgba(18,18,9,0.80) 0%, rgba(18,18,9,0.58) 38%, rgba(18,18,9,0.58) 62%, rgba(18,18,9,0.84) 100%)",
          }}
        />

        {/* ── Top text ── */}
        <div
          style={{
            position:       "relative",
            zIndex:         2,
            display:        "flex",
            flexDirection:  isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems:     isMobile ? "flex-start" : "flex-end",
            gap:            isMobile ? 16 : 32,
            paddingLeft:    padX,
            paddingRight:   padX,
          }}
        >
          <h2
            style={{
              fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
              fontSize:   20,
              fontWeight: 400,
              lineHeight: 1.4,
              color:      tokens.lime,
              margin:     0,
            }}
          >
            Seja um expert Loop.Talk.
          </h2>

          <div
            style={{
              display:    "flex",
              gap:        12,
              alignItems: "baseline",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize:   isMobile ? 15 : 20,
                fontWeight: 400,
                lineHeight: 1.4,
                color:      tokens.lime,
                textAlign:  "right",
                // Desktop keeps it on a single line; mobile may wrap.
                whiteSpace: isMobile ? "normal" : "nowrap",
              }}
            >
              Junte-se à comunidade de especialistas
            </span>
            <span
              style={{
                fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
                fontSize:   isMobile ? 15 : 24,
                fontWeight: 400,
                color:      tokens.lime,
                flexShrink: 0,
              }}
            >
              (03)
            </span>
          </div>
        </div>

        {/* ── Cards ── */}
        <div
          style={{
            position:       "relative",
            zIndex:         2,
            display:        "flex",
            justifyContent: "center",
            paddingLeft:    padX,
            paddingRight:   padX,
            // Pinned: fixed-height stage the absolute cards stack inside.
            // Fallback: plain vertical column, normal page scroll.
            ...(usePin
              ? { flex: 1, alignItems: "center", margin: "32px 0" }
              : { flexDirection: "column" as const, gap: 20, margin: "40px 0" }),
          }}
        >
          <div
            style={{
              position: usePin ? "relative" : "static",
              width:    "100%",
              maxWidth: CARD_W,
              height:   usePin ? CARD_H : undefined,
              display:  usePin ? "block" : "flex",
              flexDirection: usePin ? undefined : "column",
              gap:      usePin ? undefined : 20,
            }}
          >
            {STEPS.map((s, i) => (
              <StepCard
                key={s.title}
                title={s.title}
                subtitle={s.subtitle}
                bg={s.bg}
                fg={s.fg}
                muted={s.muted}
                stacked={usePin}
                offset={i - activeStep}
              >
                {/* Only the card in front animates while pinned; in the fallback
                    every card plays, since they are all read in sequence. */}
                {s.render(usePin ? i === activeStep : true)}
              </StepCard>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div
          style={{
            position:       "relative",
            zIndex:         2,
            display:        "flex",
            justifyContent: isMobile ? "stretch" : "center",
            paddingLeft:    padX,
            paddingRight:   padX,
          }}
        >
          <LinkButton
            href="/cadastro"
            variant="brand-primary"
            layout="icon-text"
            icon={<ArrowIcon />}
            className={isMobile ? "w-full" : undefined}
          >
            Join Loop.Talk
          </LinkButton>
        </div>
      </section>
    </>
  );
}
