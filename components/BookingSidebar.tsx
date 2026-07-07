"use client";

import { useState } from "react";
import Link from "next/link";
import { Expert } from "@/lib/mockExperts";
import { Logo } from "@/components/Logo";

interface Props {
  expert: Expert;
}

const DURACOES = [30, 45, 60];

function formatPrice(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function BookingSidebar({ expert }: Props) {
  const [duracaoSelecionada, setDuracaoSelecionada] = useState(60);
  const precoFinal = Math.round((expert.preco * duracaoSelecionada) / 60);

  return (
    <div
      style={{
        background: "#F4F2EB",
        borderRadius: 12,
        outline: "1px solid #DAD9D5",
        outlineOffset: -1,
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 24,
        height: 557,
        boxSizing: "border-box",
      }}
    >
      {/* Logo + nome */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Logo size="header" />
        <p style={{ fontSize: 30, fontWeight: 400, color: "#181D27", lineHeight: "38px", textAlign: "center", margin: 0 }}>
          {expert.nome}
        </p>
      </div>

      {/* Duration selector + CTA + link */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {DURACOES.map((min) => {
            const preco = Math.round((expert.preco * min) / 60);
            const ativo = min === duracaoSelecionada;
            return (
              <button
                key={min}
                onClick={() => setDuracaoSelecionada(min)}
                style={{
                  flex: 1,
                  height: 72,
                  borderRadius: 4,
                  border: "none",
                  background: ativo ? "#EAEA68" : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 400, color: "#272618" }}>
                  {min} min
                </span>
                <span style={{ fontSize: 12, color: "#807F71" }}>
                  R$ {formatPrice(preco)}
                </span>
              </button>
            );
          })}
        </div>

        <Link
          href={`/agendar/${expert.slug}?duracao=${duracaoSelecionada}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            background: "#272618",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            color: "#FCFBF8",
            textDecoration: "none",
          }}
        >
          Agendar Loop.Talk
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "#181D27", fontSize: 14 }}>
          <IconLink />
          <span>loop.talk/{expert.slug}</span>
        </div>
      </div>
    </div>
  );
}
