"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CategoryMarquee } from "@/components/home/CategoryMarquee";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { NossaPropostaSection } from "@/components/home/NossaPropostaSection";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { VideoSection } from "@/components/home/VideoSection";
import { ExpertSection } from "@/components/home/ExpertSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { tokens } from "@/components/ui/tokens";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    } as React.CSSProperties,
  };
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.17 10h11.66M10 4.17L15.83 10 10 15.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MobileBottomCTA() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: 16,
        background: "rgba(255,255,255,0.50)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Link
        href="/cadastro"
        className="btn-lime"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "12px 20px",
          background: tokens.lime,
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          color: "#272618",
          textDecoration: "none",
          boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
        }}
      >
        Criar Loop.Talk
        <ArrowIcon />
      </Link>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const howItWorksFade = useFadeIn(60);
  const acessoFade = useFadeIn();
  const ctaFade = useFadeIn();

  return (
    <main style={{ background: "#232311", paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Fatia 2: Categorias ──────────────────────────────────────────── */}
      <CategoriesSection />

      {/* ── Fatia 3: Vídeo ───────────────────────────────────────────────── */}
      <VideoSection />

      {/* ── Fatia 4: Seja um expert (scroll-pin, 3 cards) ────────────────── */}
      <ExpertSection />

      {/* ── Fatia 5: Criações dos nossos experts (marcas) ────────────────── */}
      <BrandsSection />

      {/* ── Como funciona / Nossa Proposta ───────────────────────────────── */}
      {isMobile ? (
        <section
          ref={howItWorksFade.ref}
          style={{ padding: "0", ...howItWorksFade.style }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <HowItWorksSection isMobile={true} />
          </div>
        </section>
      ) : (
        <NossaPropostaSection />
      )}

      {/* ── Acesso real + marquee ─────────────────────────────────────────── */}
      <section
        ref={acessoFade.ref}
        style={{
          padding: isMobile ? "64px 0 0" : "96px 0 0",
          textAlign: "center",
          overflow: "hidden",
          ...acessoFade.style,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "0 24px" : "0 32px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? 28 : 48,
              fontWeight: 500,
              color: "#272618",
              lineHeight: 1.1,
              margin: 0,
              fontFamily: "var(--font-host-grotesk)",
            }}
          >
            Acesso real, presença real
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: "#272618", lineHeight: "24px", margin: 0 }}>
            Compartilhe conhecimento via 1:1 com sua audiência.
          </p>
        </div>
        <CategoryMarquee />
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section
        ref={ctaFade.ref}
        style={{
          padding: isMobile ? "40px 16px" : "64px 24px",
          ...ctaFade.style,
        }}
      >
        <div
          style={{
            background: tokens.lime,
            borderRadius: 12,
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? 24 : 48,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-end",
            justifyContent: "space-between",
            gap: isMobile ? 24 : 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <h2
              style={{
                fontSize: isMobile ? 22 : 48,
                fontWeight: 500,
                color: "#272518",
                lineHeight: isMobile ? "28px" : "52.8px",
                margin: 0,
                fontFamily: "var(--font-host-grotesk)",
              }}
            >
              Faça parte do Loop.Talk<br />e inspire pessoas.
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: "#272518", lineHeight: "22px", margin: 0 }}>
              Conecte-se virtualmente, aconselhe e ganhe pelo seu tempo.
            </p>
          </div>
          <Link
            href="/cadastro"
            className="btn-dark"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              background: "#272618",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "#FCFBF8",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              alignSelf: isMobile ? "flex-start" : "auto",
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
            }}
          >
            Criar Loop.Talk
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {isMobile && <MobileBottomCTA />}

    </main>
  );
}
