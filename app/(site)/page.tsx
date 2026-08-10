"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { VideoSection } from "@/components/home/VideoSection";
import { ExpertSection } from "@/components/home/ExpertSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { CreatorsSection } from "@/components/home/CreatorsSection";
import { JoinBanner } from "@/components/home/JoinBanner";
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
        background: "color-mix(in srgb, var(--color-bg-white) 50%, transparent)",
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
          color: "var(--color-gray-900)",
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

  // Sem background próprio: o canvas da rota (SiteCanvas) já pinta, e é ele
  // que o footer também enxerga.
  return (
    <main style={{ paddingBottom: isMobile ? 80 : 0 }}>

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

      {/* ── Fatia 6: Nossos criadores (cards com hover foto→vídeo) ───────── */}
      <CreatorsSection />

      {/* ── Fatia 7: banner "Faça parte" ─────────────────────────────────── */}
      <JoinBanner />

      {isMobile && <MobileBottomCTA />}

    </main>
  );
}
