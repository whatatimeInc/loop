"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, cubicBezier } from "framer-motion";
import { useRef } from "react";
import {
  IconCategoriaCarreira,
  IconCategoriaSaude,
  IconCategoriaCasa,
  IconCategoriaModa,
  IconCategoriaArte,
  IconCategoriaGastronomia,
} from "@/components/icons";

const ease = cubicBezier(0.22, 1, 0.36, 1);

const CATEGORIES = [
  { label: "Carreira e Negócios", Icon: IconCategoriaCarreira },
  { label: "Saúde e Bem estar", Icon: IconCategoriaSaude },
  { label: "Casa e Arquitetura", Icon: IconCategoriaCasa },
  { label: "Moda e Beleza", Icon: IconCategoriaModa },
  { label: "Arte e Design", Icon: IconCategoriaArte },
  { label: "Gastronomia", Icon: IconCategoriaGastronomia },
];

function BentoCard({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function BentoSection() {
  return (
    <section className="bg-dark py-20 px-6">
      <div
        className="max-w-[1194px] mx-auto grid gap-8"
        style={{
          gridTemplateColumns: "1fr 1fr 1.35fr",
          gridTemplateRows: "320px 320px",
        }}
      >

        {/* Card A — Seu tempo, sua disponibilidade — col-span-2, row 1 */}
        <BentoCard
          className="col-span-2 bg-white rounded-3xl overflow-hidden"
          delay={0}
        >
          <div className="h-full flex items-center justify-between px-10">
            {/* Text block */}
            <div className="max-w-[240px]">
              <p className="text-[#181D27] text-2xl font-normal leading-snug mb-3">
                Seu tempo,<br />sua disponibilidade
              </p>
              <p className="text-[#535862] text-sm leading-relaxed">
                De um papo rápido a uma sessão de mentoria. Escolha o seu tempo.
              </p>
            </div>

            {/* Duration pills */}
            <div className="flex flex-col gap-3">
              {[30, 45, 60].map((m) => (
                <span
                  key={m}
                  className="px-4 py-2 rounded-lg text-sm font-normal text-[#535862]"
                  style={{ background: "#F6F1E9" }}
                >
                  {m} minutos
                </span>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Card D — Photo tall — col 3, row-span-2 */}
        <BentoCard
          className="row-span-2 relative rounded-3xl overflow-hidden group"
          style={{ gridColumn: "3", gridRow: "1 / 3" }}
          delay={0.08}
        >
          <Image
            src="/bento-hero.jpg"
            alt="Creator"
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            sizes="33vw"
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(27,26,24,0.80) 6%, rgba(27,26,24,0) 47%)",
            }}
          />
          {/* Text at bottom */}
          <div className="absolute bottom-10 left-10 right-10 z-10">
            <p className="text-[#FDFDFD] text-2xl font-normal leading-snug">
              Desbloqueie o seu potencial com conselhos de quem sabe
            </p>
          </div>
          {/* Bottom dark fade */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(27,26,24,0.85) 0%, transparent 45%)",
            }}
          />
        </BentoCard>

        {/* Card B — Os melhores do mundo — col 1, row 2 */}
        <BentoCard
          className="rounded-3xl overflow-hidden flex flex-col justify-end p-10"
          style={{ background: "#CEFD58", gridColumn: "1", gridRow: "2" }}
          delay={0.16}
        >
          <p className="text-[#181D27] text-2xl font-normal leading-snug mb-2">
            Os melhores do mundo.<br />Onde você estiver.
          </p>
          <p className="text-[#414651] text-sm leading-relaxed">
            Design, Negócios, Bem-estar, Moda. Sessões 100% online, sob medida.
          </p>
        </BentoCard>

        {/* Card C — Categorias scroll — col 2, row 2 */}
        <BentoCard
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "#E7DAC8", gridColumn: "2", gridRow: "2" }}
          delay={0.24}
        >
          {/* Horizontal scrolling row of category cards, overflowing left */}
          <div
            className="absolute inset-0 flex items-center overflow-hidden"
          >
            <div
              className="flex gap-3 flex-shrink-0"
              style={{ transform: "translateX(-80px)" }}
            >
              {CATEGORIES.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-[20px]"
                  style={{
                    width: 160,
                    height: 160,
                    background: "#F6F1E9",
                    padding: "32px 24px",
                  }}
                >
                  <Icon className="w-12 h-12" />
                  <span className="text-[#535862] text-xs font-normal text-center leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

      </div>
    </section>
  );
}

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section className="bg-dark px-6 pb-20">
      <div className="max-w-[1194px] mx-auto" ref={ref}>
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-10 rounded-3xl px-12 py-12"
          style={{ background: "#E7DAC8" }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          <div className="flex-1">
            <h2
              className="font-normal leading-tight mb-2"
              style={{ fontSize: 36, color: "#181D27" }}
            >
              Seja um Creator e inspire pessoas
            </h2>
            <p className="text-sm" style={{ color: "#414651" }}>
              Conecte-se virtualmente, aconselhe e ganhe até R$ 100.000 em um mês.
            </p>
          </div>
          <Link
            href="/seja-mentor"
            className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-opacity hover:opacity-80"
            style={{
              background: "#CEFD58",
              color: "#181D27",
              outline: "1px solid #CEFD58",
              boxShadow: "0px 1px 2px rgba(10, 13, 18, 0.05)",
            }}
          >
            Seja um Creator
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
