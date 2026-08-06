"use client";

import { useState } from "react";
import Link from "next/link";
import { Expert } from "@/lib/mockExperts";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";

interface Props {
  expert: Expert;
}

const DURACOES = [30, 45, 60];

function formatPrice(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function SocialPill({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label} style={{
      width: 32, height: 32, background: "#E0DDC1", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      textDecoration: "none", color: "#272618", flexShrink: 0,
    }}>
      {children}
    </a>
  );
}

function IGIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>;
}
function LIIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
}
function YTIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><polygon points="10,9 15,12 10,15" fill="currentColor" stroke="none"/></svg>;
}
function TTIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/></svg>;
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
      {/* Logo + nome + social */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Logo size="header" />
          <p style={{ fontSize: 30, fontWeight: 400, color: "#181D27", lineHeight: "38px", textAlign: "center", margin: 0 }}>
            {expert.nome}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <SocialPill href={expert.social.instagram ?? "#"} label="Instagram"><IGIcon /></SocialPill>
          <SocialPill href={expert.social.linkedin ?? "#"} label="LinkedIn"><LIIcon /></SocialPill>
          <SocialPill href="#" label="YouTube"><YTIcon /></SocialPill>
          <SocialPill href="#" label="TikTok"><TTIcon /></SocialPill>
        </div>
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
                  background: ativo ? tokens.lime : "#fff",
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

      </div>
    </div>
  );
}
