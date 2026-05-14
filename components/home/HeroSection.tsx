"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, cubicBezier } from "framer-motion";

const ease = cubicBezier(0.22, 1, 0.36, 1);
import { experts } from "@/lib/mockExperts";

// ── helpers ──────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

// ── PhoneMockup ───────────────────────────────────────────────────────────────

function PhoneMockup() {
  const expert = experts[0];

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.4 }}
    >
      {/* Glow spots */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-lime/25 blur-3xl -top-10 -right-10 pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-52 h-52 rounded-full bg-purple-500/12 blur-3xl bottom-10 left-0 pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating phone */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Frame */}
        <div className="relative w-[260px] h-[520px] rounded-[2.8rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/15 bg-white/5 backdrop-blur-sm">
          {/* Background photo */}
          <Image
            src={`/mentors/${expert.slug}/profile.webp`}
            alt={expert.nome}
            fill
            className="object-cover object-top"
            sizes="260px"
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />

          {/* Status bar pills */}
          <div className="absolute top-3 left-0 right-0 flex justify-center">
            <div className="w-24 h-5 bg-black rounded-full" />
          </div>

          {/* Header */}
          <div className="absolute top-10 left-0 right-0 flex flex-col items-center">
            <span
              className="font-black text-white text-lg tracking-tight"
              style={{ fontFamily: "var(--font-permanent-marker)" }}
            >
              face<span className="text-lime">.</span>Talk
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs">{expert.nome}</span>
            </div>
          </div>

          {/* Live badge */}
          <div className="absolute top-10 right-5">
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
              AO VIVO
            </span>
          </div>

          {/* Wave visual */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            <motion.svg
              width="180"
              height="60"
              viewBox="0 0 180 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <motion.rect
                  key={i}
                  x={i * 26 + 2}
                  y={30}
                  width={12}
                  height={4}
                  rx={6}
                  fill="white"
                  fillOpacity={0.6}
                  animate={{ height: [4, 14 + i * 5, 4], y: [30, 23 - i * 2, 30] }}
                  transition={{
                    duration: 0.9 + i * 0.12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.svg>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-5">
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 hover:bg-red-600 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c1.12.45 2.3.77 3.53.94a2 2 0 011.84 1.99V21a2 2 0 01-2.18 2C9.31 22.15 2 14.84 2 6a2 2 0 012-2h3.5a2 2 0 012 1.72c.16 1.22.47 2.4.91 3.52a2 2 0 01-.44 2.11l-1.27 1.27-.02-.11z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating stat card */}
      <motion.div
        className="absolute -left-10 top-1/3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease }}
      >
        <p className="text-white/60 text-[10px] font-medium">Sessões hoje</p>
        <p className="text-white text-xl font-bold leading-tight">2.4k</p>
      </motion.div>

      {/* Floating rating card */}
      <motion.div
        className="absolute -right-8 bottom-1/3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.6, ease }}
      >
        <p className="text-white/60 text-[10px] font-medium">Avaliação</p>
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

        {/* Right — Phone Mockup */}
        <div className="hidden md:flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
