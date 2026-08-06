"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CategoryMarquee } from "@/components/home/CategoryMarquee";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { NossaPropostaSection } from "@/components/home/NossaPropostaSection";
import { tokens } from "@/components/ui/tokens";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    } as React.CSSProperties,
  };
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.17 10h11.66M10 4.17L15.83 10 10 15.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MobileBottomCTA() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: 16,
        background: "rgba(255,255,255,0.50)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Link
        href="/cadastro"
        className="btn-lime"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "12px 20px",
          background: tokens.lime,
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          color: "#272618",
          textDecoration: "none",
          boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
        }}
      >
        Criar Loop.Talk
        <ArrowIcon />
      </Link>
    </div>
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  const howItWorksFade = useFadeIn(60);
  const acessoFade = useFadeIn();
  const ctaFade = useFadeIn();

  return (
    <main style={{ background: "#F4F2EB", paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── Hero — viewport-height com moldura arredondada ──────────────── */}
      <section style={{ padding: isMobile ? 8 : 12 }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? "calc(100svh - 16px)" : "calc(100svh - 24px)",
            borderRadius: isMobile ? 16 : 22,
            overflow: "hidden",
            // Mobile: column (text over video); Desktop: 2 equal columns
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            background: isMobile ? "#1C1B14" : "#F6F4F2",
            justifyContent: isMobile ? "flex-end" : undefined,
          }}
        >
          {isMobile ? (
            /* ── Mobile: full-bleed vídeo + texto sobreposto ─────────────── */
            <>
              <video
                autoPlay muted loop playsInline
                poster="/bento-hero.jpg"
                src="/hero-categories.mp4"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.58) 100%)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  maxWidth: 400,
                  padding: "24px 24px 40px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h1
                    style={{
                      fontSize: "clamp(28px, 3vw + 8px, 60px)",
                      fontWeight: 500,
                      color: "#FCFBF8",
                      lineHeight: 1.1,
                      margin: 0,
                      fontFamily: "var(--font-host-grotesk)",
                    }}
                  >
                    Algumas conversas não têm preço. As suas têm.
                  </h1>
                  <p style={{ fontSize: 14, color: "rgba(252,251,248,0.85)", lineHeight: 1.55, margin: 0 }}>
                    A plataforma para te conectar com sua audiência valorizando seu tempo.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* ── Desktop: 2 colunas 50/50 ──────────────────────────────── */
            <>
              {/* Coluna esquerda — texto + CTA — exatamente 50% */}
              <div
                style={{
                  flex: "0 0 50%",
                  background: "#F6F4F2",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "64px 48px",
                  minWidth: 0,
                }}
              >
                {/* Bloco contido: headline + subtítulo + CTA */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                    width: "100%",
                    maxWidth: 460,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <h1
                      style={{
                        fontSize: 40,
                        fontWeight: 500,
                        color: "#151918",
                        lineHeight: "44px",
                        margin: 0,
                        fontFamily: "var(--font-host-grotesk)",
                      }}
                    >
                      Algumas conversas não têm preço. As suas têm.
                    </h1>
                    <p
                      style={{
                        fontSize: 16,
                        color: "rgba(21,25,24,0.55)",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      A plataforma para te conectar com sua audiência valorizando seu tempo.
                    </p>
                  </div>
                  <Link
                    href="/cadastro"
                    className="btn-lime"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 24px",
                      background: tokens.lime,
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#151918",
                      textDecoration: "none",
                      boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
                    }}
                  >
                    Criar Loop.Talk
                    <ArrowIcon />
                  </Link>
                </div>
              </div>

              {/* Coluna direita — vídeo — exatamente 50% */}
              <div style={{ flex: "0 0 50%", position: "relative", minWidth: 0 }}>
                <video
                  autoPlay muted loop playsInline
                  src="/homepage-hero-423-2.mp4"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Como funciona / Nossa Proposta ───────────────────────────────── */}
      {isMobile ? (
        <section
          ref={howItWorksFade.ref}
          style={{ padding: "0", ...howItWorksFade.style }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <HowItWorksSection isMobile={true} />
          </div>
        </section>
      ) : (
        <NossaPropostaSection />
      )}

      {/* ── Acesso real + marquee ─────────────────────────────────────────── */}
      <section
        ref={acessoFade.ref}
        style={{
          padding: isMobile ? "64px 0 0" : "96px 0 0",
          textAlign: "center",
          overflow: "hidden",
          ...acessoFade.style,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "0 24px" : "0 32px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? 28 : 48,
              fontWeight: 500,
              color: "#272618",
              lineHeight: 1.1,
              margin: 0,
              fontFamily: "var(--font-host-grotesk)",
            }}
          >
            Acesso real, presença real
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: "#272618", lineHeight: "24px", margin: 0 }}>
            Compartilhe conhecimento via 1:1 com sua audiência.
          </p>
        </div>
        <CategoryMarquee />
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section
        ref={ctaFade.ref}
        style={{
          padding: isMobile ? "40px 16px" : "64px 24px",
          ...ctaFade.style,
        }}
      >
        <div
          style={{
            background: tokens.lime,
            borderRadius: 12,
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? 24 : 48,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-end",
            justifyContent: "space-between",
            gap: isMobile ? 24 : 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <h2
              style={{
                fontSize: isMobile ? 22 : 48,
                fontWeight: 500,
                color: "#272518",
                lineHeight: isMobile ? "28px" : "52.8px",
                margin: 0,
                fontFamily: "var(--font-host-grotesk)",
              }}
            >
              Faça parte do Loop.Talk<br />e inspire pessoas.
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: "#272518", lineHeight: "22px", margin: 0 }}>
              Conecte-se virtualmente, aconselhe e ganhe pelo seu tempo.
            </p>
          </div>
          <Link
            href="/cadastro"
            className="btn-dark"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              background: "#272618",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "#FCFBF8",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              alignSelf: isMobile ? "flex-start" : "auto",
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
            }}
          >
            Criar Loop.Talk
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {isMobile && <MobileBottomCTA />}

    </main>
  );
}
