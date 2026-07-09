"use client";

import { useEffect, useState } from "react";
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

  return (
    <main style={{ background: "#F4F2EB", paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "80px 16px 16px" : "96px 24px 24px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            height: isMobile ? 500 : 720,
            borderRadius: isMobile ? 12 : 16,
            overflow: "hidden",
            background: "#1C1B14",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: isMobile ? "16px 16px 24px" : "32px 32px 40px",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
            src="/hero.mp4"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: "rgba(0,0,0,0.40)",
            }}
          />
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24, maxWidth: 404 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
              <h1
                style={{
                  fontSize: isMobile ? 24 : 30,
                  fontWeight: 500,
                  color: "#FCFBF8",
                  lineHeight: isMobile ? "30px" : "32px",
                  margin: 0,
                  fontFamily: "var(--font-host-grotesk)",
                }}
              >
                Algumas conversas não têm preço. As suas têm.
              </h1>
              <p style={{ fontSize: isMobile ? 14 : 16, color: "#FCFBF8", lineHeight: isMobile ? "20px" : "24px", margin: 0 }}>
                A plataforma para te conectar com sua audiência valorizando seu tempo.
              </p>
            </div>
            {!isMobile && (
              <Link
                href="/cadastro"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: "#EAEA68",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#272618",
                  textDecoration: "none",
                  maxWidth: 320,
                  boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
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
      <section style={{ padding: isMobile ? "48px 24px" : "64px 32px", textAlign: "center" }}>
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
      <section style={{ padding: isMobile ? "0" : "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <HowItWorksSection isMobile={isMobile} />
        </div>
      </section>

      {/* ── Acesso real + marquee ─────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "64px 0 0" : "96px 0 0", textAlign: "center", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 24px" : "0 32px", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
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
        {/* Marquee: full-bleed, outside the maxWidth constraint */}
        <CategoryMarquee />
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "40px 16px" : "64px 24px" }}>
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
                fontSize: isMobile ? 22 : 30,
                fontWeight: 300,
                color: "#272518",
                lineHeight: isMobile ? "28px" : "32px",
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
