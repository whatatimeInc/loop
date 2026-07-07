"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion, cubicBezier } from "framer-motion";

const ease = cubicBezier(0.22, 1, 0.36, 1);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

function IntroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {});
  }, []);

  return (
    <motion.div
      className="w-full overflow-hidden"
      style={{ height: 640, borderRadius: 16, border: "1px solid #DAD9D5" }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease, delay: 0.45 }}
    >
      <video
        ref={ref}
        src="/intro.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section style={{ background: "#F4F2EB" }} className="pt-24 pb-16">
      {/* ── Texto + CTAs centrados ── */}
      <div className="text-center px-6 pt-16 pb-10 max-w-3xl mx-auto">
        <motion.h1
          style={{
            color: "#272518",
            fontSize: "clamp(32px, 3.5vw, 48px)",
            fontWeight: 300,
            lineHeight: 1.1,
            fontFamily: "var(--font-host-grotesk), 'Host Grotesk', sans-serif",
          }}
          className="mb-6"
          {...fadeUp(0.1)}
        >
          Monetize seu acesso.<br />
          Transforme seguidores em clientes.
        </motion.h1>

        <motion.p
          style={{ color: "#626053", fontSize: 20, lineHeight: 1.5 }}
          className="mb-10"
          {...fadeUp(0.2)}
        >
          Sem barreiras, converse online com seus seguidores e compartilhe conhecimento.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          {...fadeUp(0.3)}
        >
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center font-semibold text-base transition-opacity hover:opacity-85"
            style={{
              background: "#EAEA68",
              color: "#272518",
              borderRadius: 8,
              padding: "10px 18px",
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
            }}
          >
            Criar perfil
          </Link>
          <Link
            href="/explorar"
            className="inline-flex items-center justify-center font-semibold text-base transition-opacity hover:opacity-85"
            style={{
              color: "#272518",
              borderRadius: 8,
              padding: "10px 18px",
              outline: "1px solid #8E8857",
              outlineOffset: -1,
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
            }}
          >
            Explorar
          </Link>
        </motion.div>
      </div>

      {/* ── Vídeo introdutório ── */}
      <div
        className="px-6 md:px-[123px]"
        style={{ maxWidth: 1440, margin: "0 auto" }}
      >
        <IntroVideo />
      </div>
    </section>
  );
}
