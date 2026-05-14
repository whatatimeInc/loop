"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, cubicBezier } from "framer-motion";
import { useRef } from "react";
import { experts } from "@/lib/mockExperts";
import { IconCheck } from "@/components/icons";

const ease = cubicBezier(0.22, 1, 0.36, 1);

// Spec: Estevan | Manuela | Mauricio | Renata
const FEATURED_SLUGS = ["estevan-sartoreli", "manuela-cit", "mauricio-arruda", "renata-vanzetto"];

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CreatorCard({ expert, index }: { expert: typeof experts[0]; index: number }) {
  return (
    <motion.div
      className="flex-1 min-w-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: index * 0.08 }}
    >
      <Link
        href={`/${expert.slug}`}
        className="block relative rounded-3xl overflow-hidden group"
        style={{ height: "400px" }}
      >
        {/* Foto ocupa o card inteiro */}
        <Image
          src={`/mentors/${expert.slug}/profile.webp`}
          alt={expert.nome}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 280px"
        />

        {/* Overlay blur + gradiente — spec: transparent 53% → white/43% 67% → white/90% 100% */}
        <div
          className="absolute inset-0 backdrop-blur-[20px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0) 53%, rgba(255,255,255,0.43) 67%, rgba(255,255,255,0.90) 100%)",
            maskImage: "linear-gradient(180deg, transparent 45%, black 72%)",
          }}
        />

        {/* Badge Popular */}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>

        {/* Bookmark */}
        <button
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/40 transition-colors text-white"
          onClick={(e) => e.preventDefault()}
        >
          <BookmarkIcon />
        </button>

        {/* Conteúdo — spec: padding 24px 16px */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-2">
          {/* Nome + badge verificado */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-gray-900 font-medium text-base truncate leading-tight">
              {expert.nome}
            </p>
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lime flex items-center justify-center">
              <IconCheck className="w-3.5 h-3.5 text-dark" />
            </span>
          </div>

          {/* Preço */}
          <p className="text-gray-900 text-sm mb-1">
            R$ {expert.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            <span className="text-gray-500"> / sessão</span>
          </p>

          {/* Descrição */}
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-1.5">
            {expert.bio}
          </p>

          {/* Categoria */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
            <span className="text-gray-600 text-xs truncate">{expert.categoria}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CarouselSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const featuredCreators = FEATURED_SLUGS
    .map(slug => experts.find(e => e.slug === slug))
    .filter(Boolean) as typeof experts;

  return (
    <section ref={ref} className="bg-dark py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header — spec: justify-content space-between */}
        <div className="flex items-center justify-between mb-12">
          <motion.h2
            className="text-2xl md:text-3xl font-normal"
            style={{ color: "#D5D7DA" }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease }}
          >
            Converse com os Creators<br className="hidden sm:block" /> mais populares
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link
              href="/explorar"
              className="text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-70"
              style={{ color: "#D5D7DA" }}
            >
              Ver todos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* 4 cards lado a lado no desktop — spec: justify-content space-between */}
        {inView && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCreators.map((e, i) => (
              <CreatorCard key={e.slug} expert={e} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
