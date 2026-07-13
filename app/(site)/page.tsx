"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CategoryMarquee } from "@/components/home/CategoryMarquee";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";

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
          background: "#EAEA68",
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
  const taglineFade = useFadeIn();
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
            background: "#1C1B14",
            borderRadius: isMobile ? 16 : 22,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/bento-hero.jpg"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
            src="/hero-categories.mp4"
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
              gap: isMobile ? 16 : 24,
              maxWidth: isMobile ? 400 : 680,
              padding: isMobile ? "24px 24px 40px" : "48px 64px 72px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
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
              <p
                style={{
                  fontSize: "clamp(15px, 1.2vw + 4px, 18px)",
                  color: "rgba(252,251,248,0.85)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                A plataforma para te conectar com sua audiência valorizando seu tempo.
              </p>
            </div>
            {!isMobile && (
              <Link
                href="/cadastro"
                className="btn-lime"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 24px",
                  background: "#EAEA68",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#272618",
                  textDecoration: "none",
                  maxWidth: 320,
                  boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
                  alignSelf: "flex-start",
                }}
              >
                Criar Loop.Talk
                <ArrowIcon />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Tagline ──────────────────────────────────────────────────────── */}
      <section
        ref={taglineFade.ref}
        style={{
          padding: isMobile ? "56px 24px" : "80px 32px",
          textAlign: "center",
          ...taglineFade.style,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#272618",
            letterSpacing: "0.04em",
            margin: "0 auto 16px",
            fontFamily: "var(--font-sans)",
          }}
        >
          COMO FUNCIONA
        </p>
        <p
          style={{
            fontSize: isMobile ? 28 : 48,
            fontWeight: 500,
            color: "#272618",
            lineHeight: 1.1,
            margin: "0 auto",
            maxWidth: 800,
            fontFamily: "var(--font-host-grotesk)",
          }}
        >
          Seu tempo tem valor.{" "}
          <span style={{ display: "inline" }}>Agora tem um lugar para provar isso.</span>
        </p>
      </section>

      {/* ── Como funciona ────────────────────────────────────────────────── */}
      <section
        ref={howItWorksFade.ref}
        style={{
          padding: isMobile ? "0" : "0 24px",
          ...howItWorksFade.style,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <HowItWorksSection isMobile={isMobile} />
        </div>
      </section>

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
          <p style={{ fontSize: isMobile ? 16 : 20, color: "#272618", lineHeight: "24px", margin: 0 }}>
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
            background: "#EAEA68",
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
            <p style={{ fontSize: 15, color: "#272518", lineHeight: "22px", margin: 0 }}>
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
