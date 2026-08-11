"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { VideoSection } from "@/components/home/VideoSection";
import { ExpertSection } from "@/components/home/ExpertSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { CreatorsSection } from "@/components/home/CreatorsSection";
import { JoinBanner } from "@/components/home/JoinBanner";

export default function Home() {
  // Sem background próprio: o canvas da rota (SiteCanvas) já pinta, e é ele
  // que o footer também enxerga.
  return (
    <main>

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

    </main>
  );
}
