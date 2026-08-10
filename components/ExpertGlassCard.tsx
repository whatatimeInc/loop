"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Categoria } from "@/lib/mockExperts";

/**
 * Photo card with the frosted-glass base panel — extracted verbatim from the
 * mentor PDP hero (app/(site)/[slug]/page.tsx) so both can share one source.
 *
 * Optional `videoSrc` adds a hover crossfade: the still photo swaps for a muted
 * looping video while the pointer is over the card. The glass panel, chip, name
 * and description sit ABOVE both media layers and never change on hover.
 */
/**
 * "light" is the PDP look: pale glass and near-black text, made for a light page.
 * "dark" tints the glass with var(--color-gray-700) and flips the text to off-white, for the
 * dark home background. Default stays "light" so existing usage is untouched.
 */
export type GlassVariant = "light" | "dark";

// The blur must fade out via mask-image. backdrop-filter cannot be applied
// through a gradient background — swapping this mask for a linear-gradient
// background makes the blur cut off hard at the edge again.
// Os #000 aqui não são cor: numa máscara só o alpha é lido, e #000 significa
// "opaco". Não tokenizar — trocar por var() não muda nada e só confunde.
const GLASS_MASK = "linear-gradient(to top, #000 0%, #000 40%, transparent 100%)";

const VARIANT = {
  light: {
    chipBg: "color-mix(in srgb, var(--color-bg-white) 40%, transparent)",
    text:   "#181D27",
  },
  dark: {
    // Flat colour, not a gradient — the fade is the mask's job.
    tint:   "color-mix(in srgb, var(--color-gray-700) 45%, transparent)",
    chipBg: "color-mix(in srgb, var(--color-gray-700) 55%, transparent)",
    text:   "var(--color-cream)",
  },
} as const;

// Chip and meta are identical in both variants apart from their colours, so
// they live here rather than being duplicated in each branch below.
function Chip({ categoria, bg, color }: { categoria: Categoria; bg: string; color: string }) {
  return (
    <span
      style={{
        background: bg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        // CategoryIcon paints with currentColor, so it follows this too.
        borderRadius: 4, padding: "8px 12px", fontSize: 12, fontWeight: 600, color,
        boxShadow: "0px 1px 2px rgba(10,13,18,0.05)", display: "inline-flex", alignItems: "center", gap: 4,
      }}
    >
      <CategoryIcon categoria={categoria} />
      {categoria}
    </span>
  );
}

function Meta({ name, description, color }: { name: string; description: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingLeft: 24, paddingRight: 24 }}>
      <p style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 30, fontWeight: 300, color, lineHeight: "32px", textAlign: "center", margin: 0 }}>
        {name}
      </p>
      <p style={{ fontSize: 14, fontWeight: 400, color, lineHeight: "20px", textAlign: "center", margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

export interface ExpertGlassCardProps {
  photoSrc:    string;
  name:        string;
  description: string;
  categoria:   Categoria;
  /** Omit (or pass undefined) to render a still photo only — e.g. on touch. */
  videoSrc?:   string;
  variant?:    GlassVariant;
  /** CSS aspect-ratio (e.g. "343 / 500"). Takes precedence over `height`. */
  aspectRatio?: string;
  height?:     number;
  sizes?:      string;
  priority?:   boolean;
  /** Slot for a share button or similar, pinned top-right above every layer. */
  topRight?:   React.ReactNode;
}

export function ExpertGlassCard({
  photoSrc,
  name,
  description,
  categoria,
  videoSrc,
  variant = "light",
  aspectRatio,
  height = 557,
  sizes = "456px",
  priority = false,
  topRight,
}: ExpertGlassCardProps) {
  const isDark = variant === "dark";
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  // Playback is strictly on demand — nothing streams until the pointer arrives.
  const handleEnter = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    // Autoplay policies reject this in some contexts; the photo just stays put.
    v.play().catch(() => {});
    v.style.opacity = "1";
    if (photoRef.current) photoRef.current.style.opacity = "0";
  }, []);

  const handleLeave = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    v.style.opacity = "0";
    if (photoRef.current) photoRef.current.style.opacity = "1";
  }, []);

  return (
    <div
      onMouseEnter={videoSrc ? handleEnter : undefined}
      onMouseLeave={videoSrc ? handleLeave : undefined}
      style={{
        position:     "relative",
        borderRadius: 12,
        overflow:     "hidden",
        // aspectRatio drives the height when given, so the card keeps its
        // portrait proportion at whatever width the grid hands it.
        ...(aspectRatio ? { aspectRatio, height: "auto" } : { height }),
        background:   "var(--color-olive-100)",
      }}
    >
      {/* ── Media layer (z 1): photo and video stacked, crossfaded by opacity ── */}
      <div ref={photoRef} style={{ position: "absolute", inset: 0, zIndex: 1, transition: "opacity 0.35s ease" }}>
        <Image
          src={photoSrc}
          alt={name}
          fill
          priority={priority}
          className="object-cover object-top"
          sizes={sizes}
        />
      </div>

      {videoSrc && (
        <video
          ref={videoRef}
          // preload="metadata" keeps this to a few KB until the hover fires.
          preload="metadata"
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            position:   "absolute",
            inset:      0,
            zIndex:     1,
            width:      "100%",
            height:     "100%",
            objectFit:  "cover",
            objectPosition: "top",
            opacity:    0,
            transition: "opacity 0.35s ease",
            pointerEvents: "none",
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {isDark ? (
        <>
          {/* ── Glass (z 2): ONE translucent layer at the base. The mask is what
                 fades the blur out toward the top — a gradient background here
                 would make backdrop-filter cut off hard at the edge. ── */}
          <div
            style={{
              position:        "absolute",
              inset:           "auto 0 0 0",
              height:          "45%",
              zIndex:          2,
              background:      VARIANT.dark.tint,
              backdropFilter:  "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              maskImage:       GLASS_MASK,
              WebkitMaskImage: GLASS_MASK,
              pointerEvents:   "none",
            }}
          />

          {/* ── Text (z 3): above the glass, so it is never blurred or masked ── */}
          <div
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              zIndex: 3,
              // Must not swallow the pointer, or the hover would flicker at the base.
              pointerEvents: "none",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 8, paddingBottom: 28,
            }}
          >
            <Chip categoria={categoria} bg={VARIANT.dark.chipBg} color={VARIANT.dark.text} />
            <Meta name={name} description={description} color={VARIANT.dark.text} />
          </div>
        </>
      ) : (
        <>
          {/* ── Light variant (the PDP look) — unchanged ── */}
          <div
            style={{
              position:      "absolute",
              inset:         0,
              zIndex:        2,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, transparent 60%, color-mix(in srgb, var(--color-bg-white) 38%, transparent) 76%, color-mix(in srgb, var(--color-bg-white) 82%, transparent) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0, top: "60%",
              zIndex: 3,
              pointerEvents: "none",
              backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
              maskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-end", gap: 8, paddingBottom: 28,
            }}
          >
            <Chip categoria={categoria} bg={VARIANT.light.chipBg} color={VARIANT.light.text} />
            <Meta name={name} description={description} color={VARIANT.light.text} />
          </div>
        </>
      )}

      {/* Above everything, and interactive (the glass panel is not). */}
      {topRight && (
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          {topRight}
        </div>
      )}
    </div>
  );
}
