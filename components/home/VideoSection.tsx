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
          // Fallback enquanto o vídeo carrega e, no mobile, a cor das tarjas
          // do letterbox — o próprio vídeo já é fundo brand, então a costura
          // some.
          background: "var(--color-lime)",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/como-funciona-poster.jpg"
          style={{
            width:      "100%",
            height:     "100%",
            // Mobile: contain — mostra a largura toda (chips inteiros),
            // sem esticar a altura fixa do container.
            // Desktop: cover — preenche o container, sem tarja.
            objectFit:  isMobile ? "contain" : "cover",
            display:    "block",
          }}
        >
          <source src="/videos/como-funciona.webm" type="video/webm" />
          <source src="/videos/como-funciona.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
