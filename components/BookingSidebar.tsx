"use client";

import { useState } from "react";
import Link from "next/link";
import { Expert } from "@/lib/mockExperts";
import { Logo } from "@/components/Logo";

interface Props {
  expert: Expert;
}

function formatPrice(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function IconLink() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function BookingSidebar({ expert }: Props) {
  const duracoes = expert.duracoes.slice(0, 3);
  const [duracaoSelecionada, setDuracaoSelecionada] = useState(
    duracoes[Math.floor(duracoes.length / 2)] ?? duracoes[0]
  );

  const precoFinal = Math.round((expert.preco * duracaoSelecionada) / 60);

  return (
    <div
      className="flex flex-col justify-between"
      style={{
        width: 335,
        minHeight: 557,
        background: "#181D27",
        borderRadius: 16,
        outline: "1px solid #535862",
        outlineOffset: -1,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 40,
        paddingBottom: 40,
      }}
    >
      {/* ── Topo: logo + nome + badge ── */}
      <div className="flex flex-col items-center gap-2">
        <Logo size="header" lime />

        <p
          className="font-normal text-center leading-tight mt-2"
          style={{ fontSize: 30, color: "#E9EAEB", lineHeight: "38px" }}
        >
          {expert.nome}
        </p>

        {/* Badge Popular */}
        <div
          className="flex items-center gap-1"
          style={{
            background: "#414651",
            borderRadius: 8,
            padding: "8px 12px",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 16, color: "#E9EAEB", fontWeight: 400 }}>Popular</span>
        </div>
      </div>

      {/* ── Base: selector + CTA + link ── */}
      <div className="flex flex-col gap-6 mt-8">

        {/* Duration selector */}
        <div className="flex items-center gap-2">
          {duracoes.map((min) => {
            const preco = Math.round((expert.preco * min) / 60);
            const ativo = min === duracaoSelecionada;

            return (
              <button
                key={min}
                onClick={() => setDuracaoSelecionada(min)}
                className="flex-1 flex flex-col items-center justify-center transition-all"
                style={{
                  height: 72,
                  borderRadius: 8,
                  outline: ativo ? "2px solid #E9EAEB" : "1px solid #535862",
                  outlineOffset: -1,
                  background: "transparent",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 400, color: "#E9EAEB" }}>
                  {min} min
                </span>
                <span style={{ fontSize: 12, color: "#A4A7AE" }}>
                  R$ {formatPrice(preco)}
                </span>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href={`/agendar/${expert.slug}`}
          className="flex items-center justify-center font-semibold transition-opacity hover:opacity-85"
          style={{
            height: 56,
            background: "#CEFD58",
            borderRadius: 8,
            fontSize: 16,
            color: "#181D27",
          }}
        >
          Agendar Face.Talk
        </Link>

        {/* Link público */}
        <div
          className="flex items-center justify-center gap-3"
          style={{ color: "#E9EAEB", fontSize: 16 }}
        >
          <IconLink />
          <span>face.talk/{expert.slug}</span>
        </div>

      </div>
    </div>
  );
}
