"use client";

import { useState } from "react";
import Link from "next/link";
import { Expert } from "@/lib/mockExperts";

interface Props {
  expert: Expert;
}

function formatPrice(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const TOPICOS = [
  "Sessão 100% focada na sua dúvida ou desafio",
  "Feedback direto e acionável, sem rodeios",
  "Acesso à experiência real, não a teoria",
  "Gravação disponível após a sessão",
];

export function BookingSidebar({ expert }: Props) {
  const duracoes = expert.duracoes.slice(0, 3);
  const [duracaoSelecionada, setDuracaoSelecionada] = useState(
    duracoes[1] ?? duracoes[0]
  );

  const precoFinal = Math.round((expert.preco * duracaoSelecionada) / 60);
  const middleIndex = Math.floor(duracoes.length / 2);

  return (
    <div
      className="flex flex-col"
      style={{
        width: 440,
        background: "#F6F1E9",
        borderRadius: 20,
        outline: "1px solid #E7DAC8",
        padding: 40,
        gap: 32,
      }}
    >

      {/* 1. Category pill */}
      <div className="inline-flex items-center self-start">
        <span
          className="text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.40)",
            borderRadius: 8,
            padding: "10px 16px",
            backdropFilter: "blur(20px)",
            color: "#181D27",
          }}
        >
          {expert.categoria}
        </span>
      </div>

      {/* 2. Título de agendamento */}
      <div>
        <p style={{ fontSize: 16, color: "#181D27" }}>Agendar 1:1 com</p>
        <p
          className="font-normal leading-tight mt-1"
          style={{ fontSize: 30, color: "#181D27" }}
        >
          {expert.nome}
        </p>
      </div>

      {/* 3. O que esperar */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold" style={{ fontSize: 16, color: "#181D27" }}>
          O que esperar
        </p>
        <ul className="flex flex-col gap-2">
          {TOPICOS.map((t) => (
            <li key={t} className="flex items-start gap-2.5" style={{ fontSize: 14, color: "#414651" }}>
              <span
                className="flex-shrink-0 mt-0.5 flex items-center justify-center rounded-full"
                style={{ width: 18, height: 18, background: "#CEFD58", color: "#181D27" }}
              >
                <IconCheck />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Duration selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          {duracoes.map((min, i) => {
            const preco = Math.round((expert.preco * min) / 60);
            const ativo = min === duracaoSelecionada;
            const isMiddle = i === middleIndex;

            return (
              <div key={min} className="flex-1 flex flex-col">
                {/* Badge "Recomendado" acima da opção do meio */}
                {isMiddle && (
                  <div
                    className="text-center text-xs font-bold mb-0"
                    style={{
                      background: "#CEFD58",
                      borderRadius: "4px 4px 0 0",
                      padding: "4px 8px",
                      color: "#181D27",
                      fontSize: 12,
                    }}
                  >
                    Recomendado
                  </div>
                )}
                <button
                  onClick={() => setDuracaoSelecionada(min)}
                  className="flex flex-col items-center justify-center transition-all"
                  style={{
                    height: 72,
                    borderRadius: isMiddle ? "0 0 8px 8px" : 8,
                    outline: ativo ? "2px solid #181D27" : "1px solid #E7DAC8",
                    background: ativo ? "#181D27" : "transparent",
                    color: ativo ? "#FDFDFD" : "#181D27",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{min} min</span>
                  <span style={{ fontSize: 12, color: ativo ? "#D5D7DA" : "#717680" }}>
                    R$ {formatPrice(preco)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. CTA button */}
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
        Agendar papo
      </Link>

      {/* 6. Link público */}
      <div
        className="flex items-center justify-center gap-2"
        style={{ color: "#181D27", fontSize: 16 }}
      >
        <IconLink />
        <span>face.talk/{expert.slug}</span>
      </div>

    </div>
  );
}
