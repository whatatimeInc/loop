"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { HERO_CATEGORIES } from "@/lib/categories";
import { useRevealOnView, revealStyle } from "@/components/home/useReveal";

// Placeholder images per category — swap for real mentor photos when available
const CATEGORY_IMAGES: Record<string, string> = {
  "Arte e Design": "/hero/hero-1.jpg",
  "Business":      "/hero/hero-2.jpg",
  "Moda":          "/hero/hero-3.jpg",
  "Tecnologia":    "/hero/hero-4.jpg",
  "Lifestyle":     "/hero/hero-1.jpg",
  "Gastronomia":   "/hero/hero-2.jpg",
};

export function CategoriesSection() {
  const [isMobile, setIsMobile]     = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Cursor-following image state
  const sectionRef   = useRef<HTMLElement>(null);
  const imgRef       = useRef<HTMLDivElement>(null);
  const posRef       = useRef({ x: 0, y: 0 });      // interpolated position
  const targetRef    = useRef({ x: 0, y: 0 });      // mouse target
  const rafRef       = useRef<number>(0);
  const animatingRef = useRef(false);
  const revealPhase  = useRevealOnView(sectionRef);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // RAF loop — lerp toward target (factor 0.12 = validated lag feel)
  const startRaf = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const tick = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.12;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.12;
      if (imgRef.current) {
        imgRef.current.style.transform =
          `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => {
    animatingRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Centre 160×200 image on cursor
    targetRef.current.x = e.clientX - rect.left - 80;
    targetRef.current.y = e.clientY - rect.top  - 100;
  }, []);

  const handleEnter = useCallback((i: number) => {
    setHoveredIdx(i);
    startRaf();
  }, [startRaf]);

  const handleLeave = useCallback(() => {
    setHoveredIdx(null);
    stopRaf();
  }, [stopRaf]);

  const isHovering = hoveredIdx !== null;

  return (
    <section
      ref={sectionRef}
      style={{
        ...revealStyle(revealPhase),
        background:    "var(--color-surface-canvas)",
        paddingTop:    isMobile ? 56 : 88,
        paddingBottom: isMobile ? 72 : 112,
        position:      "relative",
        overflow:      "hidden",
      }}
      onMouseMove={isMobile ? undefined : handleMouseMove}
    >
      {/* ── Header row ─────────────────────────────────────────────── */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "flex-start",
          marginBottom:   isMobile ? 40 : 56,
          paddingLeft:    isMobile ? 24 : 120,
          paddingRight:   isMobile ? 24 : 120,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <span
            style={{
              color:      "var(--color-cream)",
              fontSize:   isMobile ? 14 : 24,
              fontWeight: 400,
              fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
              flexShrink: 0,
            }}
          >
            (01)
          </span>
          <span
            style={{
              color:      "var(--color-cream)",
              fontSize:   isMobile ? 14 : 20,
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            Connect with top experts of every field.
          </span>
        </div>
        {!isMobile && (
          <span
            style={{
              color:      "var(--color-cream)",
              fontSize:   16,
              fontWeight: 400,
              fontFamily: "Inter, var(--font-inter), sans-serif",
              flexShrink: 0,
              paddingTop: 4,
            }}
          >
            Conversas com especialistas.
          </span>
        )}
      </div>

      {/* ── Category list ───────────────────────────────────────────── */}
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {HERO_CATEGORIES.map((cat, i) => {
          const hovered = hoveredIdx === i;
          // Odd index (0,2,4 = 1st,3rd,5th): centered; Even (1,3,5): right-aligned
          const isCentered = i % 2 === 0;

          return (
            <li
              key={cat}
              onMouseEnter={isMobile ? undefined : () => handleEnter(i)}
              onMouseLeave={isMobile ? undefined : handleLeave}
              style={{
                background: hovered ? "var(--color-lime)" : "transparent",
                transition: "background 0.18s ease",
                cursor:     isMobile ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  display:        "flex",
                  justifyContent: isMobile ? "flex-start" : isCentered ? "center" : "flex-end",
                  alignItems:     "center",
                  height:         isMobile ? "auto" : 120,
                  paddingTop:     isMobile ? 10 : 0,
                  paddingBottom:  isMobile ? 10 : 0,
                  paddingLeft:    isMobile ? 24 : 120,
                  // Even rows on desktop: 400px from right edge; centered rows: match left margin
                  paddingRight:   (!isMobile && !isCentered)
                    ? "clamp(120px, 27.8vw, 400px)"
                    : (isMobile ? 24 : 120),
                }}
              >
                <span
                  style={{
                    fontFamily: "Host Grotesk, var(--font-host-grotesk), sans-serif",
                    fontSize:   isMobile
                      ? "clamp(32px, 9vw, 48px)"
                      : 80,
                    fontWeight: 500,
                    lineHeight: isMobile ? 1.15 : 1.08,
                    color:      hovered ? "var(--color-surface-canvas)" : "var(--color-cream)",
                    transition: "color 0.18s ease",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {cat}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ── Cursor-following image — desktop only ───────────────────── */}
      {!isMobile && (
        <div
          ref={imgRef}
          aria-hidden="true"
          style={{
            position:      "absolute",
            top:           0,
            left:          0,
            width:         160,
            height:        200,
            borderRadius:  12,
            overflow:      "hidden",
            pointerEvents: "none",
            zIndex:        20,
            opacity:       isHovering ? 1 : 0,
            scale:         isHovering ? "1" : "0.88",
            transition:    "opacity 0.22s ease, scale 0.22s ease",
            willChange:    "transform",
          }}
        >
          <img
            src={
              hoveredIdx !== null
                ? CATEGORY_IMAGES[HERO_CATEGORIES[hoveredIdx]]
                : CATEGORY_IMAGES["Arte e Design"]
            }
            alt=""
            draggable={false}
            style={{
              width:     "100%",
              height:    "100%",
              objectFit: "cover",
              display:   "block",
            }}
          />
        </div>
      )}
    </section>
  );
}
