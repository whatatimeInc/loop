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

  // ── Mobile layout — vertical stack (text above, carousel below) ─────────────
  if (isMobile) {
    const trackWMobile = 8 * (CARD_W_MOBILE + CARD_GAP);

    return (
      <section style={{ padding: "112px 12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Text block */}
        <div
          style={{
            background:    BRAND_DARK,
            borderRadius:  22,
            padding:       "28px 24px 32px",
          }}
        >
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-start",
              gap:           20,
            }}
          >
            <Logo size="header" style={{ color: "var(--color-lime)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h1
                style={{
                  fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
                  fontSize:   "clamp(28px, 7vw, 40px)",
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
                  fontSize:   14,
                  color:      "rgba(252,251,248,0.72)",
                  lineHeight: 1.55,
                  margin:     0,
                }}
              >
                Get easy 1:1 access to the top experts in
                <br />
                <RotatingWord />
              </p>
            </div>

            {/* CTAs — stacked, full-width */}
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                gap:           12,
                alignSelf:     "stretch",
              }}
            >
              <LinkButton
                href="/cadastro"
                variant="brand-secondary"
                layout="icon-text"
                icon={<ArrowIcon />}
                className="w-full"
              >
                Create a free profile
              </LinkButton>
              <LinkButton
                href="/explorar"
                variant="brand-primary"
                layout="icon-text"
                icon={<ArrowIcon />}
                className="w-full"
              >
                Find an expert
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Carousel block */}
        <div
          style={{
            background:    tokens.lime,
            borderRadius:  22,
            overflow:      "hidden",
            height:        420,
            position:      "relative",
          }}
        >
          <div style={{ position: "absolute", inset: 4, overflow: "hidden" }}>
            <div
              className="hero-marquee-track"
              style={{
                display:    "flex",
                alignItems: "center",
                width:      trackWMobile,
                height:     "100%",
                transform:  "translateZ(0)",
              }}
            >
              {[...CARDS, ...CARDS].map((card, i) => (
                <div
                  key={i}
                  style={{
                    flexShrink:   0,
                    width:        CARD_W_MOBILE,
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
                  <div
                    style={{
                      position:      "absolute",
                      top:           0,
                      left:          0,
                      right:         0,
                      height:        "45%",
                      background:    "linear-gradient(180deg, rgba(81,79,65,0.60) 0%, rgba(81,79,65,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position:      "absolute",
                      top:           24,
                      left:          24,
                      right:         12,
                      zIndex:        1,
                      display:       "flex",
                      flexDirection: "column",
                      gap:           0,
                    }}
                  >
                    <span style={{ fontFamily: "Inter, var(--font-inter), sans-serif", fontSize: 13, fontWeight: 600, color: tokens.lime, lineHeight: 1.4 }}>
                      Book an 1:1 with
                    </span>
                    <span style={{ fontFamily: "Nerfos, cursive", fontSize: 40, fontWeight: 400, lineHeight: "44px", color: tokens.lime }}>
                      {card.name}
                    </span>
                    <span style={{ fontFamily: "Inter, var(--font-inter), sans-serif", fontSize: 11, fontWeight: 600, color: tokens.lime, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.4, marginTop: 4 }}>
                      {card.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Desktop layout — 50/50 split (unchanged) ────────────────────────────────
  const trackW = 8 * (CARD_W_DESKTOP + CARD_GAP);

  return (
    <section style={{ padding: "112px 12px 16px" }}>
      <div
        style={{
          position:     "relative",
          width:        "100%",
          height:       HERO_H_DESKTOP,
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
                    width:        CARD_W_DESKTOP,
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
                  <div
                    style={{
                      position:      "absolute",
                      top:           0,
                      left:          0,
                      right:         0,
                      height:        "45%",
                      background:    "linear-gradient(180deg, rgba(81,79,65,0.60) 0%, rgba(81,79,65,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
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
                    <span style={{ fontFamily: "Inter, var(--font-inter), sans-serif", fontSize: 16, fontWeight: 600, color: tokens.lime, lineHeight: 1.4 }}>
                      Book an 1:1 with
                    </span>
                    <span style={{ fontFamily: "Nerfos, cursive", fontSize: 56, fontWeight: 400, lineHeight: "61.6px", color: tokens.lime }}>
                      {card.name}
                    </span>
                    <span style={{ fontFamily: "Inter, var(--font-inter), sans-serif", fontSize: 12, fontWeight: 600, color: tokens.lime, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.4, marginTop: 4 }}>
                      {card.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Layer 1: Solid dark panel — clean cut ───────────────────── */}
        <div
          style={{
            position:   "absolute",
            left:       0,
            top:        0,
            bottom:     0,
            width:      "50%",
            background: BRAND_DARK,
            zIndex:     1,
          }}
        />

        {/* ── Layer 2: Text + CTAs ─────────────────────────────────────── */}
        <div
          style={{
            position:    "absolute",
            inset:       0,
            zIndex:      2,
            display:     "flex",
            alignItems:  "center",
            paddingLeft: 80,
          }}
        >
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-start",
              gap:           28,
              maxWidth:      560,
            }}
          >
            <Logo size="md" style={{ color: "var(--color-lime)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h1
                style={{
                  fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
                  fontSize:   "clamp(34px, 3.5vw, 52px)",
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
                  fontSize:   "clamp(14px, 1.2vw, 17px)",
                  color:      "rgba(252,251,248,0.72)",
                  lineHeight: 1.55,
                  margin:     0,
                }}
              >
                Get easy 1:1 access to the top experts in{" "}
                <RotatingWord />
              </p>
            </div>

            <div
              style={{
                display:    "flex",
                flexDirection: "row",
                gap:        16,
                alignItems: "flex-start",
                flexWrap:   "nowrap",
              }}
            >
              <LinkButton href="/cadastro" variant="brand-secondary" layout="icon-text" icon={<ArrowIcon />}>
                Create a profile and start monetizing
              </LinkButton>
              <LinkButton href="/explorar" variant="brand-primary" layout="icon-text" icon={<ArrowIcon />}>
                Find an expert
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
