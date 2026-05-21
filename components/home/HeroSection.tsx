"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion, cubicBezier } from "framer-motion";

const ease = cubicBezier(0.22, 1, 0.36, 1);

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
      <div
        className="overflow-hidden w-full"
        style={{ borderRadius: 24, aspectRatio: "16/10" }}
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
      </div>
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

        </div>

        {/* Right — Hero Video */}
        <div className="hidden md:flex items-center">
          <HeroVideo />
        </div>
      </div>
    </section>
  );
}
