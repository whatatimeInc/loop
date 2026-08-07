"use client";

import { useEffect, useState } from "react";
import { LinkButton, ArrowIcon } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";
import { HERO_CATEGORIES } from "@/lib/categories";

// ── Brand dark background ─────────────────────────────────────────────────────
const BRAND_DARK = "#232311";

// ── Carousel cards ────────────────────────────────────────────────────────────
// 4 unique cards — rendered as [...CARDS, ...CARDS] = 8 items for seamless loop.
// translateX(-50%) = half the track = 4 × (cardW + CARD_GAP) = start of pass 2 → seamless.
const CARDS: { img: string; name: string; role: string }[] = [
  { img: "/hero/hero-1.jpg", name: "Thadeu Diz",   role: "FUNDADOR ZEE.DOG"     },
  { img: "/hero/hero-2.jpg", name: "Pedro Costa",  role: "CO-FOUNDER CADENCE"   },
  { img: "/hero/hero-3.jpg", name: "Gabriel Lima", role: "CEO THE CHOICE"        },
  { img: "/hero/hero-4.jpg", name: "Ana Ferreira", role: "CREATIVE DIR. FARM"   },
];

// Hero block dimensions (Figma frame)
const HERO_H_DESKTOP = 720; // px
const HERO_H_MOBILE  = 520; // px

const CARD_W_DESKTOP = 480;  // portrait card width — desktop (~3:4 ratio with 660px height)
const CARD_W_MOBILE  = 340;  // portrait card width — mobile (~3:4 ratio with 462px height)
const CARD_GAP = 4;          // gap between cards — reveals yellow bg as 4px gutter
const CARD_R   = 16;         // border-radius (px)

// ── Rotating word ─────────────────────────────────────────────────────────────

function RotatingWord() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // CSS already stops the carousel for prefers-reduced-motion;
    // stop the word rotation here too.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % HERO_CATEGORIES.length);
        setVisible(true);
      }, 400);
    }, 2200);

    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        display:        "inline-block",
        opacity:        visible ? 1 : 0,
        transform:      visible ? "translateY(0)" : "translateY(-6px)",
        transition:     "opacity 0.4s ease, transform 0.4s ease",
        color:          tokens.lime,
        textDecoration: "underline",
        textDecorationColor: tokens.lime,
        fontWeight:     700,
      }}
    >
      {HERO_CATEGORIES[index]}
    </span>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────

export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const heroH    = isMobile ? HERO_H_MOBILE : HERO_H_DESKTOP;
  const cardW    = isMobile ? CARD_W_MOBILE : CARD_W_DESKTOP;
  const textPadX = isMobile ? 24 : 80;
  // Explicit track width: 8 items × (card + gap), avoids browser max-content recalc
  const trackW   = 8 * (cardW + CARD_GAP);
  // Solid panel width: 50/50 split (Figma)
  const panelW   = "50%";

  return (
    <section style={{ padding: "0 12px 16px" }}>
      <div
        style={{
          position:     "relative",
          width:        "100%",
          height:       heroH,
          borderRadius: 22,
          overflow:     "hidden",
          background:   BRAND_DARK,
        }}
      >
        {/* ── Brand bg + Carousel — right half; overflow:hidden clips cards to yellow frame ── */}
        <div
          style={{
            position:     "absolute",
            top:          0,
            right:        0,
            bottom:       0,
            left:         "50%",
            background:   tokens.lime,
            borderRadius: 18,
            overflow:     "hidden",
          }}
        >
          {/* 4px inset = breathing room on all sides (top, right, bottom, left) */}
          <div style={{ position: "absolute", inset: 4, overflow: "hidden" }}>
            <div
              className="hero-marquee-track"
              style={{
                display:    "flex",
                alignItems: "center",
                width:      trackW,
                height:     "100%",
                transform:  "translateZ(0)",
              }}
            >
              {[...CARDS, ...CARDS].map((card, i) => (
                <div
                  key={i}
                  style={{
                    flexShrink:   0,
                    width:        cardW,
                    height:       "100%",
                    borderRadius: CARD_R,
                    overflow:     "hidden",
                    position:     "relative",
                    marginRight:  CARD_GAP,
                  }}
                >
                <img
                  src={card.img}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={{
                    width:      "100%",
                    height:     "100%",
                    objectFit:  "cover",
                    display:    "block",
                    userSelect: "none",
                  }}
                />
                {/* Top gradient — caption legibility over any photo */}
                <div
                  style={{
                    position:     "absolute",
                    top:          0,
                    left:         0,
                    right:        0,
                    height:       "45%",
                    background:   "linear-gradient(180deg, rgba(81,79,65,0.60) 0%, rgba(81,79,65,0) 100%)",
                    pointerEvents:"none",
                  }}
                />
                {/* Caption — top-left, 40px from corner (Figma) */}
                <div
                  style={{
                    position:      "absolute",
                    top:           40,
                    left:          40,
                    right:         12,
                    zIndex:        1,
                    display:       "flex",
                    flexDirection: "column",
                    gap:           0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, var(--font-inter), sans-serif",
                      fontSize:   16,
                      fontWeight: 600,
                      color:      "#F8F68D",
                      lineHeight: 1.4,
                    }}
                  >
                    Book an 1:1 with
                  </span>
                  <span
                    style={{
                      fontFamily: "Nerfos, cursive",
                      fontSize:   isMobile ? 40 : 56,
                      fontWeight: 400,
                      lineHeight: isMobile ? "44px" : "61.6px",
                      color:      "#F8F68D",
                    }}
                  >
                    {card.name}
                  </span>
                  <span
                    style={{
                      fontFamily:    "Inter, var(--font-inter), sans-serif",
                      fontSize:      12,
                      fontWeight:    600,
                      color:         "#F8F68D",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      lineHeight:    1.4,
                      marginTop:     4,
                    }}
                  >
                    {card.role}
                  </span>
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Layer 1: Solid dark panel — clean cut (no gradient) ─────── */}
        <div
          style={{
            position:   "absolute",
            left:       0,
            top:        0,
            bottom:     0,
            width:      panelW,
            background: BRAND_DARK,
            zIndex:     1,
          }}
        />

        {/* ── Layer 2: Text + CTAs ─────────────────────────────────────── */}
        <div
          style={{
            position:     "absolute",
            inset:        0,
            zIndex:       2,
            display:      "flex",
            alignItems:   isMobile ? "flex-start" : "center",
            paddingTop:   isMobile ? 40 : 0,
            paddingLeft:  textPadX,
            paddingRight: isMobile ? textPadX : 0,
          }}
        >
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-start",
              gap:           isMobile ? 20 : 28,
              maxWidth:      isMobile ? "100%" : 560,
            }}
          >
            {/* Wordmark — logo oficial */}
            <Logo size={isMobile ? "header" : "md"} lime />

            {/* Headline + subtitle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h1
                style={{
                  fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
                  fontSize:   isMobile ? "clamp(28px, 7vw, 40px)" : "clamp(34px, 3.5vw, 52px)",
                  fontWeight: 500,
                  color:      "#FCFBF8",
                  lineHeight: 1.08,
                  margin:     0,
                }}
              >
                Network without<br />the Networking.
              </h1>
              <p
                style={{
                  fontSize:   isMobile ? 14 : "clamp(14px, 1.2vw, 17px)",
                  color:      "rgba(252,251,248,0.72)",
                  lineHeight: 1.55,
                  margin:     0,
                }}
              >
                Get easy 1:1 access to the top experts in{" "}
                <RotatingWord />
              </p>
            </div>

            {/* CTAs */}
            <div
              style={{
                display:       "flex",
                flexDirection: isMobile ? "column" : "row",
                gap:           isMobile ? 12 : 16,
                alignItems:    "flex-start",
                flexWrap:      "nowrap",
                // On mobile, stretch buttons to fill text block width
                ...(isMobile ? { alignSelf: "stretch" } : {}),
              }}
            >
              <LinkButton
                href="/cadastro"
                variant="brand-secondary"
                layout="icon-text"
                icon={<ArrowIcon />}
                className={isMobile ? "w-full" : undefined}
              >
                {isMobile ? "Create a free profile" : "Create a profile and start monetizing"}
              </LinkButton>
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
        </div>
      </div>
    </section>
  );
}
