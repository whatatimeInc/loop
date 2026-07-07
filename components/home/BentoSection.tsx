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
  { label: "Saúde e Bem estar",   Icon: IconCategoriaSaude },
  { label: "Casa e Arquitetura",  Icon: IconCategoriaCasa },
  { label: "Moda e Beleza",       Icon: IconCategoriaModa },
  { label: "Arte e Design",       Icon: IconCategoriaArte },
  { label: "Gastronomia",         Icon: IconCategoriaGastronomia },
];

const DURACOES = [
  { label: "30 minutos", active: false },
  { label: "45 minutos", active: false },
  { label: "60 minutos", active: true },
];

const HORARIOS = [
  { dia: "Seg", hora: "14h", active: false },
  { dia: "Seg", hora: "15h", active: false },
  { dia: "Seg", hora: "16h", active: true },
];

const MENTOR_PHOTOS = [
  { slug: "estevan-sartoreli", w: 150 },
  { slug: "manuela-cit",       w: 110 },
  { slug: "mauricio-arruda",   w: 150 },
  { slug: "renata-vanzetto",   w: 110 },
  { slug: "estevan-sartoreli", w: 150 },
  { slug: "manuela-cit",       w: 110 },
];

// ── Card de agendamento (decorativo) ─────────────────────────────────────────

function BookingUI() {
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        bottom: 40,
        width: 160,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Durações */}
      <div style={{ display: "flex", flexDirection: "column", borderRadius: 8, overflow: "hidden" }}>
        {DURACOES.map(({ label, active }) => (
          <div
            key={label}
            style={{
              padding: "8px 14px",
              background: active ? "#A39E79" : "#F4F2EB",
              color: active ? "#fff" : "#514F41",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Horários */}
      <div style={{ display: "flex", flexDirection: "column", borderRadius: 8, overflow: "hidden" }}>
        {HORARIOS.map(({ dia, hora, active }) => (
          <div
            key={hora}
            style={{
              padding: "8px 14px",
              background: active ? "#A39E79" : "#F6F1E9",
              display: "flex",
              justifyContent: "space-between",
              color: active ? "#fff" : "#514F41",
              fontSize: 14,
              outline: "1px solid rgba(255,255,255,0.25)",
              outlineOffset: -1,
            }}
          >
            <span>{dia}</span>
            <span style={{ fontWeight: 600 }}>{hora}</span>
          </div>
        ))}
      </div>

      {/* Botão */}
      <div
        style={{
          padding: "8px 14px",
          background: "#EAEA68",
          borderRadius: 8,
          textAlign: "center",
          fontWeight: 600,
          fontSize: 14,
          color: "#272518",
        }}
      >
        Agendar
      </div>
    </div>
  );
}

// ── Bento ─────────────────────────────────────────────────────────────────────

export function BentoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <section className="py-20 px-6" style={{ background: "#F4F2EB" }}>
      <div
        ref={ref}
        className="max-w-[1194px] mx-auto flex gap-8"
        style={{ height: 560 }}
      >

        {/* ── Card Esquerdo: Disponibilidade ── */}
        <motion.div
          className="flex-1 relative overflow-hidden rounded-xl flex flex-col justify-start"
          style={{ background: "#E0DDC1", padding: "40px 40px 0" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0 }}
        >
          <p style={{ color: "#181D27", fontSize: 24, fontWeight: 400, lineHeight: "1.33", marginBottom: 16 }}>
            Seu tempo,<br />sua disponibilidade
          </p>
          <p style={{ color: "#414651", fontSize: 14, lineHeight: "1.3" }}>
            De um papo rápido a uma sessão de mentoria. Escolha o seu tempo.
          </p>
          <BookingUI />
        </motion.div>

        {/* ── Card Central: Categorias ── */}
        <motion.div
          className="flex-1 relative rounded-xl overflow-hidden"
          style={{ background: "#fff" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.08 }}
        >
          <div
            className="absolute inset-0 flex items-center overflow-hidden"
            style={{ top: 180 }}
          >
            <div
              className="flex gap-4 flex-shrink-0"
              style={{ transform: "translateX(-48px)" }}
            >
              {CATEGORIES.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-[20px]"
                  style={{
                    width: 160,
                    height: 160,
                    background: "#E0DDC1",
                    padding: "32px 24px",
                  }}
                >
                  <Icon className="w-12 h-12" />
                  <span
                    style={{
                      color: "#626053",
                      fontSize: 12,
                      textAlign: "center",
                      lineHeight: "1.3",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Card Direito: Curadoria ── */}
        <motion.div
          className="flex-1 relative overflow-hidden rounded-xl flex flex-col justify-start"
          style={{ background: "#E0DDC1", padding: "40px 40px 0" }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease, delay: 0.16 }}
        >
          <p style={{ color: "#181D27", fontSize: 24, fontWeight: 400, lineHeight: "1.33", marginBottom: 16 }}>
            Curadoria com<br />os melhores
          </p>
          <p style={{ color: "#414651", fontSize: 14, lineHeight: "1.3" }}>
            Creators verificados em todas as áreas, prontos para conversar com você.
          </p>

          {/* Grade de fotos */}
          <div
            className="absolute overflow-hidden"
            style={{ left: -40, bottom: 0, right: -40, height: 220 }}
          >
            <div
              className="flex gap-3 items-end"
              style={{ paddingLeft: 40, paddingBottom: 24 }}
            >
              {MENTOR_PHOTOS.map(({ slug, w }, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 relative overflow-hidden"
                  style={{ width: w, height: 190, borderRadius: 12 }}
                >
                  <Image
                    src={`/mentors/${slug}/profile.webp`}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="160px"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section className="px-6 pb-20" style={{ background: "#F4F2EB" }}>
      <div className="max-w-[1194px] mx-auto" ref={ref}>
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-10 rounded-xl px-12 py-12"
          style={{ background: "#EAEA68" }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          <div className="flex-1">
            <h2
              className="font-normal leading-tight mb-3"
              style={{
                fontSize: 48,
                color: "#272518",
                fontFamily: "var(--font-host-grotesk), 'Host Grotesk', sans-serif",
                fontWeight: 300,
                lineHeight: 1.1,
              }}
            >
              Seja um mentor<br />e inspire pessoas.
            </h2>
            <p style={{ color: "#272518", fontSize: 16, maxWidth: 320 }}>
              Conecte-se virtualmente, aconselhe e ganhe até R$ 100.000 em um mês.
            </p>
          </div>
          <Link
            href="/criar"
            className="flex-shrink-0 inline-flex items-center justify-center font-semibold text-base transition-opacity hover:opacity-80"
            style={{
              background: "#272518",
              color: "#FCFBF8",
              padding: "10px 18px",
              borderRadius: 8,
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
            }}
          >
            Quero ser Creator
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
