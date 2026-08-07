"use client";

import { useState, useEffect } from "react";

// Desktop height matches Figma spec; mobile adapts to viewport proportion
const VIDEO_H_DESKTOP = 640;
const VIDEO_H_MOBILE  = 460;

// Border-radius and lateral padding match the hero section language
const BORDER_RADIUS = 22;
const SECTION_PAD_X = 12;

export function VideoSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      style={{
        padding: `0 ${SECTION_PAD_X}px 16px`,
      }}
    >
      <div
        style={{
          height:       isMobile ? VIDEO_H_MOBILE : VIDEO_H_DESKTOP,
          borderRadius: BORDER_RADIUS,
          overflow:     "hidden",
          position:     "relative",
          // ── TODO: replace this brand-color placeholder with the video ──────
          // When the mp4 file is uploaded, swap this background out and add:
          //
          //   <video
          //     autoPlay muted loop playsInline
          //     style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          //   >
          //     <source src="/video/[filename].mp4" type="video/mp4" />
          //   </video>
          //
          // The overflow:hidden on this div clips the video to the rounded corners.
          // ────────────────────────────────────────────────────────────────────
          background: "#F8F586",
        }}
      />
    </section>
  );
}
