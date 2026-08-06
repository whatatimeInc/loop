"use client";

import React, { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { WaitlistModal } from "./WaitlistModal";
import { tokens } from "@/components/ui/tokens";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────

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

// ─── KEYFRAMES ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes daysScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes catScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes fillPulse {
    0%, 100% { width: 48px; }
    50%       { width: 170px; }
  }
  @keyframes thumbPulse {
    0%, 100% { left: 34px; }
    50%       { left: 156px; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .carousel::-webkit-scrollbar { display: none; }
`;

// ─── ARROW ICON ───────────────────────────────────────────────────────────────

function ArrowIcon({ color = "#272618" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10h12M11 5l5 5-5 5"
        stroke={color}
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── MOBILE FIXED NAV ────────────────────────────────────────────────────────

function MobileNav({ onCTA }: { onCTA: () => void }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 64,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.50)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Logo size="header" />
      <button
        onClick={onCTA}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "#272618",
          fontFamily: "inherit",
        }}
      >
        Entrar
      </button>
    </nav>
  );
}

// ─── SECTION 1 — HERO ─────────────────────────────────────────────────────────

function HeroSection({ onCTA, isMobile }: { onCTA: () => void; isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "0 16px" : "0 24px" }}>
      <div
        style={{
          position: "relative",
          borderRadius: isMobile ? 12 : 16,
          overflow: "hidden",
          height: isMobile ? 500 : 720,
          padding: isMobile ? 16 : 32,
          display: "flex",
          flexDirection: "column",
          justifyContent: isMobile ? "flex-end" : "space-between",
          background: "#1C1B14",
        }}
      >
        {/* Background video */}
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
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "rgba(0,0,0,0.40)",
          }}
        />

        {/* Desktop nav — inside hero */}
        {!isMobile && (
          <nav
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.50)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 12,
              padding: "16px 40px",
            }}
          >
            <Logo size="header" />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={onCTA}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#181D27",
                  fontFamily: "inherit",
                }}
              >
                Entrar
              </button>
              <button
                onClick={onCTA}
                style={{
                  padding: "10px 18px",
                  background: tokens.lime,
                  border: `1px solid ${tokens.lime}`,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#272618",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Solicitar acesso
              </button>
            </div>
          </nav>
        )}

        {/* Hero bottom content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: isMobile ? 12 : 24,
          }}
        >
          <div
            style={{
              width: isMobile ? "100%" : 404,
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 12 : 16,
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? 24 : 30,
                fontWeight: 500,
                color: "#FCFBF8",
                fontFamily: "var(--font-host-grotesk)",
                lineHeight: isMobile ? "30px" : "32px",
                margin: 0,
              }}
            >
              Algumas conversas não têm preço. As suas têm.
            </h1>
            <p style={{ fontSize: isMobile ? 14 : 16, color: "#FCFBF8", lineHeight: isMobile ? "20px" : 1.5, margin: 0 }}>
              A plataforma para te conectar com sua audiência valorizando seu tempo.
            </p>
          </div>

          {/* CTA button — only on desktop */}
          {!isMobile && (
            <button
              onClick={onCTA}
              style={{
                width: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 20px",
                background: tokens.lime,
                border: `1px solid ${tokens.lime}`,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: "#272618",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Entrar na lista de espera
              <ArrowIcon color="#272618" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 2 — IMPACT HEADLINE ─────────────────────────────────────────────

function ImpactSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      style={{
        padding: isMobile ? "0 24px" : "32px 40px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: isMobile ? 32 : 48,
          fontWeight: 500,
          color: "#272618",
          fontFamily: "var(--font-host-grotesk)",
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        Seu tempo tem valor. Agora tem um lugar para provar isso.
      </h2>
    </section>
  );
}

// ─── SECTION 3 — HOW IT WORKS ─────────────────────────────────────────────────

function ProfileCardIllustration() {
  return (
    <div style={{ width: 382, height: 300, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          width: 177,
          height: 261,
          position: "absolute",
          left: 95,
          top: 9,
          animation: "fadeSlideUp 0.8s ease-out 0.3s both",
        }}
      >
        <div style={{ width: 137, height: 169, position: "absolute", left: 30, top: 47, background: "#AEADA4" }} />
        <div style={{ width: 137, height: 169, position: "absolute", left: 25, top: 46, background: tokens.lime }} />
        <div
          style={{
            width: 137,
            height: 169,
            position: "absolute",
            left: 18,
            top: 46,
            background: "#D4D2C9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="#AEADA4">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M20 21a8 8 0 1 0-16 0" />
          </svg>
        </div>
        <div
          style={{
            width: 171,
            height: 158,
            position: "absolute",
            left: 0,
            top: 93,
            background: "#272618",
            padding: "34px 14px 0",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#FCFBF8", letterSpacing: "0.04em" }}>Loop.Talk</span>
          <span style={{ fontSize: 26, fontWeight: 400, color: "#FCFBF8", fontFamily: "var(--font-host-grotesk)", lineHeight: 1 }}>
            Thadeu Diz
          </span>
        </div>
      </div>
    </div>
  );
}

const DAYS = ["Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

function DaysIllustration() {
  return (
    <div style={{ width: "100%", height: 300, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 16, animation: "daysScroll 10s linear infinite", width: "max-content" }}>
        {[...DAYS, ...DAYS].map((day, i) => {
          const hi = day === "Qua";
          return (
            <div
              key={i}
              style={{
                width: hi ? 104 : 96,
                height: hi ? 104 : 96,
                background: hi ? tokens.limeLight : "#E0DDC1",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 600,
                color: "#272618",
                flexShrink: 0,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriceIllustration() {
  return (
    <div
      style={{
        width: 382,
        height: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, color: "#272618" }}>R$</span>
        <span style={{ fontSize: 28, fontWeight: 500, color: "#272618", fontFamily: "var(--font-host-grotesk)" }}>120</span>
        <span style={{ fontSize: 14, color: "#272618" }}>/hora</span>
      </div>
      <div style={{ position: "relative", width: 250, height: 15 }}>
        <div style={{ position: "absolute", inset: 0, background: "#DAD9D5", borderRadius: 99 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: tokens.lime,
            borderRadius: 99,
            animation: "fillPulse 3.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 48,
            background: "rgba(224,221,193,0.4)",
            borderRadius: 99,
            border: "1px solid white",
            backdropFilter: "blur(4px)",
            animation: "thumbPulse 3.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

const HOW_IT_WORKS_CARDS = [
  {
    title: "Crie seu perfil",
    desc: "Em minutos, um link exclusivo para você compartilhar com sua audiência.",
    illustration: <ProfileCardIllustration />,
  },
  {
    title: "Defina sua agenda",
    desc: "Escolha seus horários e conecte ao Google Calendar.",
    illustration: <DaysIllustration />,
  },
  {
    title: "Receba seu valor",
    desc: "Defina seu preço e receba na sua conta de preferência. Sem mensalidade.",
    illustration: <PriceIllustration />,
  },
];

function HowItWorksSection({ isMobile }: { isMobile: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth - 40; // card width ≈ container - peek
    setActiveIndex(Math.round(scrollRef.current.scrollLeft / (cardWidth + 16)));
  };

  if (isMobile) {
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          ref={scrollRef}
          className="carousel"
          onScroll={handleScroll}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            gap: 12,
            padding: "0 16px",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch" as never,
          }}
        >
          {HOW_IT_WORKS_CARDS.map(({ title, desc, illustration }) => (
            <div
              key={title}
              style={{
                flexShrink: 0,
                width: "calc(100vw - 56px)",
                scrollSnapAlign: "start",
                background: "#FCFBF8",
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 28,
              }}
            >
              <div
                style={{
                  padding: "0 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 300,
                    color: "#272618",
                    fontFamily: "var(--font-host-grotesk)",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: 15, color: "#272618", lineHeight: 1.5, margin: 0 }}>{desc}</p>
              </div>
              <div style={{ transform: "scale(0.85)", transformOrigin: "bottom center", width: "100%" }}>
                {illustration}
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {HOW_IT_WORKS_CARDS.map((_, i) => (
            <div
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;
                const cardWidth = scrollRef.current.clientWidth - 40;
                scrollRef.current.scrollTo({ left: i * (cardWidth + 12), behavior: "smooth" });
              }}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background: i === activeIndex ? "#272618" : "#DAD9D5",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "0 123px" }}>
      <div style={{ display: "flex", gap: 24 }}>
        {HOW_IT_WORKS_CARDS.map(({ title, desc, illustration }) => (
          <div
            key={title}
            style={{
              flex: 1,
              height: 468,
              paddingTop: 32,
              background: "#FCFBF8",
              borderRadius: 12,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ padding: "0 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
              <h3
                style={{
                  fontSize: 30,
                  fontWeight: 300,
                  color: "#272618",
                  fontFamily: "var(--font-host-grotesk)",
                  lineHeight: 1.07,
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: 16, color: "#272618", lineHeight: 1.5, margin: 0 }}>{desc}</p>
            </div>
            {illustration}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── SECTION 5 — CATEGORIES MARQUEE ──────────────────────────────────────────

const CATEGORIES: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Carreira e Negócios",
    icon: (
      <svg width="24" height="24" viewBox="0 0 50.1 50" fill="none">
        <defs>
          <clipPath id="mq-car-cp0"><polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1"/></clipPath>
          <clipPath id="mq-car-cp1"><polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1"/></clipPath>
          <clipPath id="mq-car-cp2"><polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1"/></clipPath>
        </defs>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-car-cp0)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M29.5,16.9L1.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/></g>
          <polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-car-cp1)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M11.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M39.5,16.9L11.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/></g>
          <polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-car-cp2)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M21.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M49.5,16.9L21.2.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/></g>
          <polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
      </svg>
    ),
  },
  {
    label: "Saúde e Bem-Estar",
    icon: (
      <svg width="24" height="24" viewBox="0 0 42.8 43.5" fill="none">
        <g stroke="#272618" strokeWidth="2" strokeMiterlimit="10">
          <line x1="21.3" y1="0" x2="21.3" y2="12"/>
          <line x1="8.6" y1="4.2" x2="15.6" y2="13.9"/>
          <line x1=".7" y1="15.1" x2="12.1" y2="18.8"/>
          <line x1=".7" y1="28.5" x2="12.1" y2="24.8"/>
          <line x1="8.7" y1="39.4" x2="15.7" y2="29.7"/>
          <line x1="21.5" y1="43.5" x2="21.5" y2="31.5"/>
          <line x1="34.2" y1="39.3" x2="27.2" y2="29.6"/>
          <line x1="42.1" y1="28.4" x2="30.7" y2="24.7"/>
          <line x1="42" y1="15" x2="30.6" y2="18.7"/>
          <line x1="34.1" y1="4.2" x2="27.1" y2="13.9"/>
        </g>
      </svg>
    ),
  },
  {
    label: "Tecnologia",
    icon: (
      <svg width="24" height="24" viewBox="0 0 58.5 51.8" fill="none">
        <defs>
          <clipPath id="mq-tec-cp0"><polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5"/></clipPath>
          <clipPath id="mq-tec-cp1"><polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9"/></clipPath>
          <clipPath id="mq-tec-cp2"><polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3"/></clipPath>
        </defs>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-tec-cp0)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,34.5l27.5-16,27.7,16-27.5,16L1.9,34.5M58.5,34.5l-29.1-16.8L.5,34.5l29.1,16.8,28.9-16.8"/></g>
          <polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-tec-cp1)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,25.9l27.5-16,27.7,16-27.5,16L1.9,25.9M58.5,25.9L29.4,9.1.5,25.9l29.1,16.8,28.9-16.8"/></g>
          <polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-tec-cp2)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,17.3L29.4,1.3l27.7,16-27.5,16L1.9,17.3M58.5,17.3L29.4.5.5,17.3l29.1,16.8,28.9-16.8"/></g>
          <polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
      </svg>
    ),
  },
  {
    label: "Moda e Lifestyle",
    icon: (
      <svg width="24" height="24" viewBox="0 0 48.9 48.5" fill="#272618">
        <path d="M24.7,2.8l21.4,21.4-21.4,21.4L3.3,24.2,24.7,2.8M24.7,0L.5,24.2l24.2,24.2,24.2-24.2L24.7,0h0Z"/>
        <path d="M34.8,14.1v20.2H14.6V14.1h20.2M36.8,12.1H12.6v24.2h24.2V12.1h0Z"/>
        <path d="M24.7,14.9l9.3,9.3-9.3,9.3-9.3-9.3,9.3-9.3M24.7,12.1l-12.1,12.1,12.1,12.1,12.1-12.1-12.1-12.1h0Z"/>
      </svg>
    ),
  },
  {
    label: "Criatividade",
    icon: (
      <svg width="24" height="24" viewBox="0 0 40.5 40" fill="#272618">
        <path d="M20.5,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2.5,29.9,2.5,20,10.5,2,20.5,2M20.5,0C9.4,0,.5,8.9.5,20s9,20,20,20,20-9,20-20S31.5,0,20.5,0h0Z"/>
        <path d="M20.5,18c5.5,0,10,4.5,10,10s-4.5,10-10,10-10-4.5-10-10,4.5-10,10-10M20.5,16c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12-5.4-12-12-12h0Z"/>
        <path d="M20.5,26c3.3,0,6,2.7,6,6s-2.7,6-6,6-6-2.7-6-6,2.7-6,6-6M20.5,24c-4.4,0-8,3.6-8,8s3.6,8,8,8,8-3.6,8-8-3.6-8-8-8h0Z"/>
      </svg>
    ),
  },
  {
    label: "Gastronomia",
    icon: (
      <svg width="24" height="24" viewBox="0 0 60 40" fill="#272618">
        <path d="M20,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2,29.9,2,20,10.1,2,20,2M20,0C9,0,0,9,0,20s9,20,20,20,20-9,20-20S31,0,20,0h0Z"/>
        <path d="M40,2c9.9,0,18,8.1,18,18s-8.1,18-18,18-18-8.1-18-18S30.1,2,40,2M40,0c-11,0-20,9-20,20s9,20,20,20,20-9,20-20S51,0,40,0h0Z"/>
      </svg>
    ),
  },
  {
    label: "Casa e Arquitetura",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="#272618" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="10" y="14" width="4" height="7" rx="0.5" stroke="#272618" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Arte e Design",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#272618" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#272618"/>
      </svg>
    ),
  },
];

function CategoriesSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "0 0" : "48px 0", display: "flex", flexDirection: "column", gap: isMobile ? 24 : 48 }}>
      <div style={{ padding: isMobile ? "0 24px" : "0 40px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 500,
            color: "#272618",
            fontFamily: "var(--font-host-grotesk)",
            lineHeight: 1.1,
            margin: "0 0 16px",
          }}
        >
          Acesso real, presença real
        </h2>
        <p style={{ fontSize: isMobile ? 16 : 20, color: "#272618", margin: 0 }}>
          Compartilhe conhecimento via 1:1 com sua audiência.
        </p>
      </div>

      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            animation: "catScroll 24s linear infinite",
            width: "max-content",
          }}
        >
          {[...CATEGORIES, ...CATEGORIES].map(({ label, icon }, i) => (
            <div
              key={i}
              style={{
                height: 64,
                background: "#FFFFFF",
                borderRadius: 4,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexShrink: 0,
                boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
              }}
            >
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{icon}</div>
              <span style={{ fontSize: 20, color: "#272518", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 6 — INCENTIVE BANNER ────────────────────────────────────────────

function CTABannerSection({ onCTA, isMobile }: { onCTA: () => void; isMobile: boolean }) {
  return (
    <section style={{ padding: isMobile ? "0 16px" : "0 246px" }}>
      <div
        style={{
          background: tokens.lime,
          borderRadius: 12,
          padding: isMobile ? "32px 24px" : 48,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "flex-end",
          gap: isMobile ? 24 : 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h3
            style={{
              fontSize: isMobile ? 24 : 30,
              fontWeight: 300,
              color: "#272518",
              fontFamily: "var(--font-host-grotesk)",
              lineHeight: 1.07,
              margin: 0,
            }}
          >
            Faça parte do Loop.Talk
            <br />e inspire pessoas.
          </h3>
          <p style={{ maxWidth: 320, fontSize: 16, color: "#272518", lineHeight: 1.5, margin: 0 }}>
            Conecte-se virtualmente, aconselhe e ganhe pelo seu tempo.
          </p>
        </div>

        <button
          onClick={onCTA}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            background: "#272618",
            border: "1px solid #272618",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            color: "#FCFBF8",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
            alignSelf: isMobile ? "flex-start" : "auto",
          }}
        >
          Entrar na lista de espera
          <ArrowIcon color="#FCFBF8" />
        </button>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function LandingFooter({ onCTA, isMobile }: { onCTA: () => void; isMobile: boolean }) {
  return (
    <footer style={{ padding: isMobile ? "0 16px 16px" : "0 24px 24px" }}>
      <div
        style={{
          background: "#272618",
          borderRadius: 16,
          padding: isMobile ? "32px 24px 0" : "40px 40px 0",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "flex-end",
            gap: isMobile ? 32 : 0,
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 24 : 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
              <Logo size="footer" lime />
              <p style={{ fontSize: 16, color: "#AEADA4", lineHeight: 1.5, margin: 0, maxWidth: 340 }}>
                A plataforma para te conectar com sua audiência valorizando seu tempo.
              </p>
            </div>
            {!isMobile && (
              <button
                onClick={onCTA}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: tokens.lime,
                  border: `1px solid ${tokens.lime}`,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#272618",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  alignSelf: "flex-start",
                }}
              >
                Solicitar acesso
                <ArrowIcon color="#272618" />
              </button>
            )}
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="#"
              aria-label="Instagram"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#514F41",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FCFBF8" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="#FCFBF8" stroke="none" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#514F41",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#FCFBF8">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 24,
            paddingBottom: 24,
            borderTop: "1px solid #514F41",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 12 : 0,
          }}
        >
          <span style={{ fontSize: 12, color: "#AEADA4" }}>© 2026 Loop.Talk</span>
          <div style={{ display: "flex", gap: isMobile ? 20 : 32 }}>
            <a href="#" style={{ fontSize: 12, color: "#AEADA4", textDecoration: "none" }}>
              Termos e Condições
            </a>
            <a href="#" style={{ fontSize: 12, color: "#AEADA4", textDecoration: "none" }}>
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MOBILE FIXED BOTTOM CTA ─────────────────────────────────────────────────

function MobileBottomCTA({ onCTA }: { onCTA: () => void }) {
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
      <button
        onClick={onCTA}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px 20px",
          background: tokens.lime,
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          color: "#272618",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Entrar na lista de espera
        <ArrowIcon color="#272618" />
      </button>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function LandingClient({ referralCode }: { referralCode?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        background: "#F4F2EB",
        minHeight: "100vh",
        overflowX: "hidden",
        paddingBottom: isMobile ? 88 : 0,
      }}
    >
      <style>{KEYFRAMES}</style>

      {isMobile && <MobileNav onCTA={openModal} />}

      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 40 : 64,
          paddingTop: isMobile ? 80 : 24,
          paddingBottom: isMobile ? 16 : 24,
        }}
      >
        <HeroSection onCTA={openModal} isMobile={isMobile} />
        <ImpactSection isMobile={isMobile} />
        <HowItWorksSection isMobile={isMobile} />
        <CategoriesSection isMobile={isMobile} />
        <CTABannerSection onCTA={openModal} isMobile={isMobile} />
        <LandingFooter onCTA={openModal} isMobile={isMobile} />
      </div>

      {isMobile && <MobileBottomCTA onCTA={openModal} />}

      <WaitlistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        referralCode={referralCode}
      />
    </div>
  );
}
