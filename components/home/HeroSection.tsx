"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion, cubicBezier } from "framer-motion";

const ease = cubicBezier(0.22, 1, 0.36, 1);
import { experts } from "@/lib/mockExperts";

// ── helpers ──────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

// ── HeroVideo ─────────────────────────────────────────────────────────────────

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {});
  }, []);

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease, delay: 0.3 }}
    >
      {/* Subtle glow behind the video */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(206,253,88,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Video container */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          borderRadius: 24,
          aspectRatio: "16/10",
          boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <video
          ref={videoRef}
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Subtle vignette on bottom edge */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(24,26,24,0.45) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Floating stat card — sessões */}
      <motion.div
        className="absolute -left-6 top-8 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 shadow-xl"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease }}
      >
        <p className="text-white/60 text-[10px] font-medium">Sessões hoje</p>
        <p className="text-white text-xl font-bold leading-tight">2.4k</p>
      </motion.div>

      {/* Floating rating card */}
      <motion.div
        className="absolute -right-6 bottom-12 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 shadow-xl"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease }}
      >
        <p className="text-white/60 text-[10px] font-medium">Avaliação média</p>
        <div className="flex items-center gap-1 mt-0.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-yellow-400" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <p className="text-white text-sm font-bold">4.9</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="bg-dark text-white min-h-screen flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16">

        {/* Left */}
        <div>
          <motion.span
            className="inline-flex items-center gap-2 bg-lime/12 text-lime text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-lime/25"
            {...fadeUp(0)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            Plataforma de acesso 1:1
          </motion.span>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight mb-6"
            {...fadeUp(0.12)}
          >
            Monetize seu acesso.<br />
            <span className="text-lime">Transforme</span> seguidores<br />
            em clientes.
          </motion.h1>

          <motion.p
            className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md"
            {...fadeUp(0.22)}
          >
            Sem barreiras, converse online com seus seguidores e compartilhe conhecimento.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            {...fadeUp(0.32)}
          >
            <Link
              href="/criar"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-lime text-dark font-semibold text-sm hover:bg-lime/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Quero ser Creator
            </Link>
            <Link
              href="/explorar"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-white/20 text-[#D5D7DA] font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Encontrar Creators →
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex items-center gap-4 mt-10"
            {...fadeUp(0.44)}
          >
            <div className="flex -space-x-2">
              {experts.slice(0, 4).map((e) => (
                <div key={e.slug} className="w-8 h-8 rounded-full overflow-hidden border-2 border-dark">
                  <Image
                    src={`/mentors/${e.slug}/profile.webp`}
                    alt={e.nome}
                    width={32}
                    height={32}
                    className="object-cover object-top w-full h-full"
                  />
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              <span className="text-white font-semibold">+48 creators</span> disponíveis agora
            </p>
          </motion.div>
        </div>

        {/* Right — Hero Video */}
        <div className="hidden md:flex items-center">
          <HeroVideo />
        </div>
      </div>
    </section>
  );
}
