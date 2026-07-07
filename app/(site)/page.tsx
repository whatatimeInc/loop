"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryMarquee } from "@/components/home/CategoryMarquee";

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

function FeatureCardPerfil() {
  return (
    <div style={{ width: 177, height: 261, position: "relative", margin: "0 auto" }}>
      <div style={{ position: "absolute", left: 18, top: 46, width: 137, height: 169, background: "#EAEA68", borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 25, top: 46, width: 137, height: 169, background: "#E0DDC1", borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 18, top: 46, width: 137, height: 169, background: "linear-gradient(160deg, #CBCB50 0%, #8E8857 100%)", borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 0, top: 92, width: 177, height: 169, background: "#272618", borderRadius: "0 0 4px 4px" }} />
      <div style={{ position: "absolute", left: 14, top: 108, width: 16, height: 16, background: "#F4F2EB", borderRadius: 2 }} />
      <div style={{ position: "absolute", left: 12, top: 140, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ color: "#FCFBF8", fontSize: 12, fontWeight: 600, lineHeight: "16px" }}>Loop.Talk</span>
        <span style={{ color: "#FCFBF8", fontSize: 28, fontWeight: 700, lineHeight: "28px", fontFamily: "var(--font-host-grotesk)" }}>Thadeu Diz</span>
      </div>
    </div>
  );
}

function FeatureCardAgenda() {
  const days = ["Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Sex"];
  return (
    <div style={{ width: "100%", overflowX: "hidden", paddingBottom: 8 }}>
      <div style={{ display: "flex", gap: 8, width: "max-content", transform: "translateX(-40px)" }}>
        {days.map((d) => {
          const active = d === "Qua";
          return (
            <div
              key={d}
              style={{
                width: active ? 104 : 96,
                height: active ? 104 : 96,
                padding: 10,
                background: active ? "#F8F68D" : "#E0DDC1",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 600, color: "#272618", textAlign: "center" }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureCardReceita() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 14, color: "#272618" }}>R$</span>
        <span style={{ fontSize: 48, fontWeight: 500, color: "#272618", fontFamily: "var(--font-host-grotesk)", lineHeight: 1 }}>120</span>
        <span style={{ fontSize: 14, color: "#272618" }}>/hora</span>
      </div>
      <div style={{ width: 220, position: "relative" }}>
        <div style={{ height: 15, background: "#DAD9D5", borderRadius: 99 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 48, height: 15, background: "#EAEA68", borderRadius: 99 }} />
        <div style={{
          position: "absolute",
          top: "50%",
          left: 40,
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 48,
          background: "rgba(224,221,193,0.4)",
          borderRadius: 99,
          border: "1px solid white",
          backdropFilter: "blur(4px)",
        }} />
      </div>
    </div>
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

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      {isMobile ? (
        /* Mobile: horizontal snap carousel */
        <>
          <style>{`
            .cards-carousel {
              display: flex;
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              -webkit-overflow-scrolling: touch;
              padding: 0 16px;
              gap: 12px;
              scrollbar-width: none;
            }
            .cards-carousel::-webkit-scrollbar { display: none; }
            .carousel-card {
              flex: 0 0 82%;
              scroll-snap-align: start;
            }
          `}</style>
          <div className="cards-carousel">
            {[
              {
                title: "Crie seu perfil",
                subtitle: "Em minutos, um link exclusivo para você compartilhar com sua audiência.",
                illustration: <FeatureCardPerfil />,
              },
              {
                title: "Defina sua agenda",
                subtitle: "Escolha seus horários e conecte ao Google Calendar.",
                illustration: <FeatureCardAgenda />,
              },
              {
                title: "Receba seu valor",
                subtitle: "Defina seu preço e receba na sua conta de preferência. Sem mensalidade.",
                illustration: <FeatureCardReceita />,
              },
            ].map(({ title, subtitle, illustration }) => (
              <div
                key={title}
                className="carousel-card"
                style={{
                  background: "#FCFBF8",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 24,
                }}
              >
                <div style={{ padding: "0 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 300, color: "#272618", lineHeight: "28px", margin: 0, fontFamily: "var(--font-host-grotesk)" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 15, color: "#272618", lineHeight: "22px", margin: 0 }}>{subtitle}</p>
                </div>
                <div style={{ width: "100%", overflow: "hidden", height: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  {illustration}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Desktop: 3-column grid */
        <section
          style={{
            padding: "0 clamp(24px, 8.5vw, 123px)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            {
              title: "Crie seu perfil",
              subtitle: "Em minutos, um link exclusivo para você compartilhar com sua audiência.",
              illustration: <FeatureCardPerfil />,
            },
            {
              title: "Defina sua agenda",
              subtitle: "Escolha seus horários e conecte ao Google Calendar.",
              illustration: <FeatureCardAgenda />,
            },
            {
              title: "Receba seu valor",
              subtitle: "Defina seu preço e receba na sua conta de preferência. Sem mensalidade.",
              illustration: <FeatureCardReceita />,
            },
          ].map(({ title, subtitle, illustration }) => (
            <div
              key={title}
              style={{
                background: "#FCFBF8",
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 32,
                minHeight: 468,
              }}
            >
              <div style={{ padding: "0 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontSize: 30, fontWeight: 300, color: "#272618", lineHeight: "32px", margin: 0, fontFamily: "var(--font-host-grotesk)" }}>
                  {title}
                </h3>
                <p style={{ fontSize: 15, color: "#272618", lineHeight: "22px", margin: 0 }}>{subtitle}</p>
              </div>
              <div style={{ width: "100%", overflow: "hidden", height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                {illustration}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Acesso real + marquee ─────────────────────────────────────────── */}
      <section style={{ padding: isMobile ? "64px 0 0" : "96px 0 0", textAlign: "center", overflow: "hidden" }}>
        <div style={{ padding: isMobile ? "0 24px" : "0 32px", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
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
      <section style={{ padding: isMobile ? "40px 16px" : "64px clamp(24px, 8.5vw, 123px)" }}>
        <div
          style={{
            background: "#EAEA68",
            borderRadius: 12,
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
