"use client";

import Image from "next/image";
import Link from "next/link";
import { Expert } from "@/lib/mockExperts";
import { StarSolid } from "iconoir-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { tokens } from "@/components/ui/tokens";

const avaliacoesMock = [
  {
    nome: "Felipe M.",
    nota: 5,
    texto: "Really great person. Was very open and thoughtful with his feedback.",
    data: "Abril 2026",
  },
  {
    nome: "Marina M.",
    nota: 5,
    texto: "He gave me some great ideas about the design for my app as well as different directions I can go with. He also mentioned some things that I had never even thought about. Thank you.",
    data: "Fevereiro 2026",
  },
];

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <polygon points="10,9 15,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4.17 10h11.66M10 4.17L15.83 10 10 15.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function SocialCircle({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label} style={{
      width: 36, height: 36, background: "var(--color-olive-100)", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      textDecoration: "none", color: "var(--color-gray-900)", flexShrink: 0,
    }}>
      {children}
    </a>
  );
}

export function MobileCreatorLayout({ expert }: { expert: Expert }) {
  const recomendam = Math.round(expert.rating * 20);

  return (
    <div className="md:hidden" style={{ background: "var(--color-gray-100)", paddingBottom: 96 }}>

      {/* Main scroll content */}
      <div style={{ padding: "96px 16px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero photo card */}
        <div style={{ width: "100%", height: 500, borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <Image
            src={`/mentors/${expert.slug}/profile.webp`}
            alt={expert.nome}
            fill
            priority
            className="object-cover object-top"
            sizes="343px"
          />

          {/* Gradient overlay — no blur, keeps photo crisp; white fade starts at 55% */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgb(from var(--color-bg-white) r g b / 0) 55%, color-mix(in srgb, var(--color-bg-white) 38%, transparent) 75%, color-mix(in srgb, var(--color-bg-white) 80%, transparent) 100%)",
          }} />

          {/* Share button */}
          <div style={{
            position: "absolute", top: 12, right: 12, zIndex: 2,
            width: 36, height: 36,
            background: "color-mix(in srgb, var(--color-bg-white) 40%, transparent)",
            borderRadius: "50%",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--color-gray-900)",
          }}>
            <ShareIcon />
          </div>

          {/* Bottom frosted section — blur fades in via mask to avoid hard edge */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: 310,
            paddingTop: 58, paddingBottom: 32,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
            maskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <span style={{
              background: "color-mix(in srgb, var(--color-bg-white) 40%, transparent)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 4,
              padding: "8px 12px",
              fontSize: 12, fontWeight: 600, color: "var(--color-gray-900)",
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}>
              <CategoryIcon categoria={expert.categoria} />
              {expert.categoria}
            </span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingLeft: 16, paddingRight: 16 }}>
              <h1 style={{ fontFamily: "Host Grotesk, sans-serif", fontSize: 30, fontWeight: 300, color: "#181D27", lineHeight: "32px", textAlign: "center", margin: 0 }}>
                {expert.nome}
              </h1>
              <p style={{ fontSize: 12, color: "#181D27", lineHeight: "16px", textAlign: "center", margin: 0 }}>
                {expert.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StarSolid className="w-4 h-4" style={{ color: "var(--color-gray-900)" }} />
              <span style={{ fontSize: 20, color: "var(--color-gray-900)", lineHeight: "24px" }}>{expert.rating.toFixed(1)}</span>
            </div>
            <span style={{ fontSize: 14, color: "var(--color-gray-900)" }}>{avaliacoesMock.length * 10} avaliações</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, width: 78 }}>
            <span style={{ fontSize: 20, color: "var(--color-gray-900)" }}>{expert.sessoes}+</span>
            <span style={{ fontSize: 14, color: "var(--color-gray-900)" }}>sessões</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, width: 78 }}>
            <span style={{ fontSize: 20, color: "var(--color-gray-900)" }}>{recomendam}%</span>
            <span style={{ fontSize: 14, color: "var(--color-gray-900)" }}>recomendam</span>
          </div>
        </div>

        {/* Content: Sobre + Avaliações */}
        <div style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: 24, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Sobre header + social icons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: 24, fontWeight: 400, color: "var(--color-gray-900)", lineHeight: "32px", margin: 0 }}>Sobre</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SocialCircle href={expert.social.instagram ?? "#"} label="Instagram"><InstagramIcon /></SocialCircle>
                <SocialCircle href={expert.social.linkedin ?? "#"} label="LinkedIn"><LinkedInIcon /></SocialCircle>
                <SocialCircle href="#" label="YouTube"><YouTubeIcon /></SocialCircle>
                <SocialCircle href="#" label="TikTok"><TikTokIcon /></SocialCircle>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--color-gray-900)", lineHeight: "18px", margin: 0 }}>{expert.bio}</p>
          </div>

          {/* Avaliações */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "var(--color-gray-900)", lineHeight: "32px", margin: 0 }}>Avaliações</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {avaliacoesMock.map((av) => (
                <div key={av.nome} style={{ background: "var(--color-olive-100)", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-gray-900)" }}>{av.nome}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StarSolid className="w-5 h-5" style={{ color: "var(--color-gray-900)" }} />
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-gray-900)" }}>{av.nota}.0</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: "var(--color-gray-900)" }}>{av.data}</span>
                  </div>
                  <p style={{ fontSize: 16, color: "var(--color-gray-900)", lineHeight: "24px", margin: 0 }}>{av.texto}</p>
                </div>
              ))}
            </div>

            <button style={{
              alignSelf: "stretch",
              padding: "12px 20px",
              background: "var(--color-cream)",
              border: "none",
              outline: "1px solid var(--color-olive-600)",
              outlineOffset: -1,
              color: "var(--color-gray-900)",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              cursor: "pointer",
            }}>
              Ver todas
            </button>
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ background: tokens.lime, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontFamily: "Host Grotesk, sans-serif", fontSize: 24, fontWeight: 300, lineHeight: "32px", color: "#272518", margin: 0 }}>
              Faça parte do Loop.Talk<br />e inspire pessoas.
            </p>
            <p style={{ fontSize: 14, color: "#272518", lineHeight: "20px", margin: 0 }}>
              Conecte-se virtualmente, aconselhe e ganhe pelo seu tempo.
            </p>
          </div>
          <Link href="/cadastro" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            background: "var(--color-gray-900)",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            color: "var(--color-cream)",
            textDecoration: "none",
            alignSelf: "flex-start",
          }}>
            Solicitar acesso
            <ArrowIcon />
          </Link>
        </div>

      </div>

      {/* Fixed bottom booking CTA */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: "17px 16px 16px",
        background: "color-mix(in srgb, var(--color-bg-white) 50%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <Link href={`/agendar/${expert.slug}`} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 56,
          background: tokens.lime,
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          color: "var(--color-gray-900)",
          textDecoration: "none",
        }}>
          Agendar Loop.Talk
        </Link>
      </div>

    </div>
  );
}
