"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShareAndroid } from "iconoir-react";
import { tokens } from "@/components/ui/tokens";

const PHOTO_URL = "/mentors/andre-do-amaral/profile.webp";

// Same keyframes as HowItWorksSection; prefixed class names to avoid collisions
const ANIMATION_CSS = `
  @keyframes how-lift {
    0%, 16%  { transform: translateY(0);     }
    40%, 60% { transform: translateY(-16px); }
    86%,100% { transform: translateY(0);     }
  }
  @keyframes how-fanA {
    0%, 16%  { transform: rotate(0deg);  }
    40%, 60% { transform: rotate(6deg);  }
    86%,100% { transform: rotate(0deg);  }
  }
  @keyframes how-fanB {
    0%, 16%  { transform: rotate(0deg);  }
    40%, 60% { transform: rotate(-4deg); }
    86%,100% { transform: rotate(0deg);  }
  }
  .np-lift {
    animation: how-lift 5.2s cubic-bezier(.4,0,.2,1) infinite;
    will-change: transform;
  }
  .np-fanA {
    animation: how-fanA 5.2s cubic-bezier(.4,0,.2,1) infinite;
    transform-origin: 65% 70%;
    will-change: transform;
  }
  .np-fanB {
    animation: how-fanB 5.2s cubic-bezier(.4,0,.2,1) infinite;
    transform-origin: 70% 80%;
    will-change: transform;
  }
  .np-lift.paused, .np-fanA.paused, .np-fanB.paused {
    animation-play-state: paused;
  }
  @media (prefers-reduced-motion: reduce) {
    .np-lift, .np-fanA, .np-fanB { animation: none !important; }
  }
`;

// ── FolderFrame geometry — identical to HowItWorksSection ────────────────────
const CW = 193;
const CH = 234;
const FOLDER_W = 220;
const FOLDER_H = Math.round((FOLDER_W * CH) / CW); // ≈ 267
const LIFT_PAD = 28;

function folderFacePath(fw: number, fh: number): string {
  const sx = fw / 158;
  const sy = fh / 192;
  const x = (v: number) => (v * sx).toFixed(2);
  const y = (v: number) => (v * sy).toFixed(2);
  return (
    `path("M${x(132.84)} ${y(192)}H${x(8.55)}` +
    `C${x(4.20)} ${y(192)} ${x(0.68)} ${y(188.49)} ${x(0.68)} ${y(184.16)}` +
    `V${y(70.22)}` +
    `C${x(0.68)} ${y(65.91)} ${x(4.20)} ${y(62.36)} ${x(8.55)} ${y(62.36)}` +
    `H${x(42.18)}` +
    `C${x(44.98)} ${y(62.36)} ${x(47.72)} ${y(63.35)} ${x(49.88)} ${y(65.17)}` +
    `C${x(60.78)} ${y(74.31)} ${x(95.55)} ${y(102.73)} ${x(95.55)} ${y(102.73)}` +
    `L${x(138.10)} ${y(140.72)}` +
    `C${x(139.76)} ${y(142.24)} ${x(140.81)} ${y(144.37)} ${x(140.81)} ${y(146.60)}` +
    `V${y(184.16)}` +
    `C${x(140.81)} ${y(188.49)} ${x(137.29)} ${y(192)} ${x(132.94)} ${y(192)}Z")`
  );
}

// Animation colors and mechanics are identical to HowItWorksSection
function FolderIllustration({ playing }: { playing: boolean }) {
  const p = playing ? "" : " paused";
  const photoLeft = (26.834 / CW) * FOLDER_W;
  const photoWidth = (137 / CW) * FOLDER_W;
  const photoHeight = (169 / CH) * FOLDER_H;
  const photoRadius = (24 / CW) * FOLDER_W;

  return (
    <div style={{ position: "relative", width: FOLDER_W, height: FOLDER_H + LIFT_PAD, overflow: "hidden" }}>
      <div
        className={`np-lift${p}`}
        style={{ position: "absolute", top: LIFT_PAD, left: 0, width: FOLDER_W, height: FOLDER_H }}
      >
        <div style={{ position: "absolute", inset: 0, clipPath: "inset(0)", overflow: "hidden" }}>
          <div className={`np-fanA${p}`} style={{ position: "absolute", inset: 0 }}>
            <svg width={FOLDER_W} height={FOLDER_H} viewBox={`0 0 ${CW} ${CH}`} fill="none"
              style={{ position: "absolute", inset: 0 }} aria-hidden="true">
              <path
                d="M165.525 55.3413L108.388 47.6067C101.833 46.7193 95.7992 51.3063 94.9106 57.852L84.4432 134.959C83.5546 141.505 88.148 147.531 94.7029 148.418L151.84 156.152C158.394 157.04 164.429 152.453 165.317 145.907L175.785 68.7999C176.673 62.2542 172.08 56.2286 165.525 55.3413Z"
                fill={tokens.lime}
              />
            </svg>
          </div>
          <div className={`np-fanB${p}`} style={{ position: "absolute", inset: 0 }}>
            <svg width={FOLDER_W} height={FOLDER_H} viewBox={`0 0 ${CW} ${CH}`} fill="none"
              style={{ position: "absolute", inset: 0 }} aria-hidden="true">
              <path
                d="M180.669 89.2264L117.691 70.884C111.341 69.0345 104.692 72.6758 102.84 79.0171L80.5429 155.357C78.6907 161.698 82.3372 168.338 88.6874 170.188L151.665 188.53C158.015 190.38 164.665 186.739 166.517 180.397L188.814 104.057C190.666 97.716 187.019 91.076 180.669 89.2264Z"
                fill="#E0DDC1"
              />
            </svg>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTO_URL}
            alt="Mentor"
            style={{
              position: "absolute",
              left: photoLeft,
              top: 0,
              width: photoWidth,
              height: photoHeight,
              objectFit: "cover",
              borderRadius: photoRadius,
            }}
          />
        </div>
      </div>
      {/* Folder face — frosted glass, unchanged */}
      <div
        style={{
          position: "absolute",
          top: LIFT_PAD,
          left: 0,
          width: FOLDER_W,
          height: FOLDER_H,
          zIndex: 2,
          pointerEvents: "none",
          clipPath: folderFacePath(FOLDER_W, FOLDER_H),
          background:
            "linear-gradient(135deg, rgba(180,176,140,0.34) 0%, rgba(140,136,104,0.20) 46%, rgba(120,116,86,0.30) 100%), rgba(120,117,88,0.42)",
          backdropFilter: "blur(16px) saturate(1.1)",
          WebkitBackdropFilter: "blur(16px) saturate(1.1)",
          filter: "drop-shadow(0px 10px 26px rgba(39,38,24,0.30))",
          boxShadow:
            "inset 1px 1px 0 rgba(255,255,255,0.42), inset -1px -1px 0 rgba(120,116,86,0.28)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: Math.round((12 / 158) * FOLDER_W),
          top: LIFT_PAD + Math.round((85 / 192) * FOLDER_H),
          zIndex: 3,
          color: "#EDEBDD",
          pointerEvents: "none",
          display: "flex",
        }}
        aria-hidden="true"
      >
        <ShareAndroid width={18} height={18} strokeWidth={1.5} />
      </span>
      <div
        style={{
          position: "absolute",
          left: Math.round((16 / CW) * FOLDER_W),
          top: LIFT_PAD + FOLDER_H - Math.round((58 / 192) * FOLDER_H),
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <p style={{ color: "#F3F1E6", fontSize: 12, fontFamily: "var(--font-sans), Inter, sans-serif", fontWeight: 600, lineHeight: "17px", letterSpacing: ".2px", margin: "0 0 5px" }}>
          Loop.Talk
        </p>
        <p style={{ fontFamily: "Nerfos, cursive", color: "#F3F1E6", fontSize: 24, lineHeight: 1, margin: 0 }}>
          André do Amaral
        </p>
      </div>
    </div>
  );
}

// ── AgendaCarousel — same mechanics, dark chip colors ────────────────────────
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const PING_PONG = [2, 3, 4, 3];
const CHIP_SIZE = 56;
const CHIP_GAP = 10;
const CHIP_STEP = CHIP_SIZE + CHIP_GAP;
const ALL_CHIPS = [...DAYS, ...DAYS, ...DAYS];

function AgendaCarousel({ playing }: { playing: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingRef = useRef(0);

  const step = useCallback(() => {
    const wrap = wrapRef.current;
    const row = rowRef.current;
    if (!wrap || !row) return;
    const target = DAYS.length + PING_PONG[pingRef.current % PING_PONG.length];
    const centerX = wrap.clientWidth / 2;
    const chipCenter = target * CHIP_STEP + CHIP_SIZE / 2;
    row.style.transition = "transform 1s cubic-bezier(.4,0,.2,1)";
    row.style.transform = `translateX(${(centerX - chipCenter).toFixed(1)}px)`;
    setActiveIdx(target);
    pingRef.current = (pingRef.current + 1) % PING_PONG.length;
  }, []);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    step();
    timerRef.current = setInterval(step, 1600);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, step]);

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
      }}
    >
      <div ref={rowRef} style={{ display: "flex", gap: CHIP_GAP, padding: "14px 0", willChange: "transform" }}>
        {ALL_CHIPS.map((day, i) => {
          const isActive = i === activeIdx;
          return (
            <div
              key={i}
              style={{
                width: CHIP_SIZE,
                height: CHIP_SIZE,
                flexShrink: 0,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 500,
                background: isActive ? tokens.lime : "#2E332F",
                color: isActive ? "#3E3B12" : "#7A8480",
                transform: isActive ? "scale(1.1)" : "scale(1)",
                transition: "background 0.5s ease, color 0.5s ease, transform 0.5s ease",
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

// ── PriceSlider — same mechanics, dark text + track ──────────────────────────
const PRICE_LO = 120;
const PRICE_HI = 310;
const TRACK_W = 190;
const THUMB_W = 24;
const ANIM_DUR = 2600;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function PriceSlider({ playing }: { playing: boolean }) {
  const valRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!playing || prefersReduced) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      if (prefersReduced) {
        if (valRef.current) valRef.current.textContent = String(PRICE_HI);
        if (fillRef.current) fillRef.current.style.transform = "translateY(-50%) scaleX(0.85)";
        if (thumbRef.current) thumbRef.current.style.transform = `translate(${(0.85 * TRACK_W).toFixed(1)}px, -50%)`;
      }
      return;
    }

    function frame(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % (ANIM_DUR * 2);
      const p = elapsed < ANIM_DUR ? elapsed / ANIM_DUR : 1 - (elapsed - ANIM_DUR) / ANIM_DUR;
      const k = easeInOutCubic(p);
      const frac = 0.1 + 0.75 * k;
      if (valRef.current)
        valRef.current.textContent = String(Math.round(PRICE_LO + (PRICE_HI - PRICE_LO) * k));
      if (fillRef.current)
        fillRef.current.style.transform = `translateY(-50%) scaleX(${frac.toFixed(3)})`;
      if (thumbRef.current)
        thumbRef.current.style.transform = `translate(${(frac * TRACK_W).toFixed(1)}px, -50%)`;
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [playing]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingBottom: 16 }}>
      <p style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 14, color: "#FCFBF8", fontFamily: "var(--font-inter)" }}>R$</span>
        <span
          ref={valRef}
          style={{ fontSize: 24, fontWeight: 500, color: "#FCFBF8", fontFamily: "var(--font-host-grotesk)", fontVariantNumeric: "tabular-nums", lineHeight: "30px" }}
        >
          {PRICE_LO}
        </span>
        <span style={{ fontSize: 14, color: "#FCFBF8", fontFamily: "var(--font-inter)" }}>/hora</span>
      </p>
      <div style={{ position: "relative", width: TRACK_W, height: 48, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: TRACK_W, height: 15, borderRadius: 99, background: "#3A3F3C" }} />
        <div
          ref={fillRef}
          style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%) scaleX(0.1)", transformOrigin: "left center", width: TRACK_W, height: 15, borderRadius: 99, background: tokens.lime, willChange: "transform" }}
        />
        <div
          ref={thumbRef}
          style={{ position: "absolute", left: 0, top: "50%", transform: "translate(0, -50%)", width: THUMB_W, height: 48, borderRadius: 99, background: "rgba(224,221,193,0.40)", border: "1px solid #fff", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", willChange: "transform" }}
        />
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.17 10h11.66M10 4.17L15.83 10 10 15.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SUPER: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "1.68px",
  textTransform: "uppercase",
  color: "#FCFBF8",
  margin: 0,
  fontFamily: "Inter, var(--font-inter), sans-serif",
};

// ── Section ───────────────────────────────────────────────────────────────────
export function NossaPropostaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ padding: 12 }}>
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />
      <div
        ref={sectionRef}
        style={{ background: "#151918", borderRadius: 22, overflow: "hidden" }}
      >

        {/* ── (a) Section header — centered ──────────────────────────────── */}
        <div style={{ textAlign: "center", padding: "96px 64px 88px" }}>
          <p style={{ ...SUPER, marginBottom: 20 }}>Nossa Proposta</p>
          <h2 style={{
            fontSize: 40,
            fontWeight: 500,
            color: "#FCFBF8",
            lineHeight: 1.15,
            margin: "0 auto",
            fontFamily: "var(--font-host-grotesk)",
            maxWidth: 560,
          }}>
            Seu tempo tem valor. Agora tem um lugar para provar isso.
          </h2>
        </div>

        {/* ── Shared width container: (b) + (c) share same axis ─────────── */}
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── (b) "Crie seu perfil" — 50/50, hero racional ───────────────── */}
        {/* flex: "0 0 50%" + minWidth: 0 — mirrors the hero column pattern exactly */}
        <div style={{ display: "flex", flexDirection: "row" }}>
          {/* Left col — text block centered vertically in column */}
          <div
            style={{
              flex: "0 0 50%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "56px 48px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: 440 }}>
              <p style={SUPER}>Como Funciona</p>
              <h3 style={{
                fontSize: 40,
                fontWeight: 500,
                color: "#FCFBF8",
                lineHeight: 1.1,
                margin: 0,
                fontFamily: "var(--font-host-grotesk)",
              }}>
                Crie seu perfil
              </h3>
              <p style={{ fontSize: 16, color: "#AEADA4", lineHeight: 1.55, margin: 0 }}>
                Em minutos, um link exclusivo para compartilhar com sua audiência.
              </p>
              <Link
                href="/cadastro"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 24px",
                  background: tokens.lime,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#3E3B12",
                  textDecoration: "none",
                  width: 320,
                  boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
                }}
              >
                Criar Loop.Talk <ArrowIcon />
              </Link>
            </div>
          </div>
          {/* Right col — FolderIllustration centered */}
          <div
            style={{
              flex: "0 0 50%",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "56px 48px",
            }}
          >
            <FolderIllustration playing={playing} />
          </div>
        </div>

        {/* ── (c) Two dark cards — 50/50 grid ────────────────────────────── */}
        {/* minWidth: 0 on grid items prevents AgendaCarousel's inner flex row
            from expanding the cell beyond its 1fr allocation */}
        <div style={{ padding: "88px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Card: Defina sua agenda */}
            <div style={{
              minWidth: 0,
              background: "#232928",
              border: "0.5px solid #514F41",
              borderRadius: 12,
              padding: "64px 40px 72px",
              height: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
              <p style={{ fontSize: 40, fontWeight: 500, color: "#FCFBF8", margin: "0 0 12px", textAlign: "center", fontFamily: "var(--font-host-grotesk)", lineHeight: 1.1 }}>
                Defina sua agenda
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#AEADA4", margin: "0 0 32px", textAlign: "center", maxWidth: 280 }}>
                Escolha seus horários e conecte ao Google Calendar.
              </p>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", overflow: "hidden" }}>
                <AgendaCarousel playing={playing} />
              </div>
            </div>
            {/* Card: Receba seu valor */}
            <div style={{
              minWidth: 0,
              background: "#232928",
              border: "0.5px solid #514F41",
              borderRadius: 12,
              padding: "64px 40px 72px",
              height: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
              <p style={{ fontSize: 40, fontWeight: 500, color: "#FCFBF8", margin: "0 0 12px", textAlign: "center", fontFamily: "var(--font-host-grotesk)", lineHeight: 1.1 }}>
                Receba seu valor
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "#AEADA4", margin: "0 0 32px", textAlign: "center", maxWidth: 280 }}>
                Defina seu preço e receba na conta de preferência. Sem mensalidade.
              </p>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", width: "100%" }}>
                <PriceSlider playing={playing} />
              </div>
            </div>
          </div>
        </div>
        </div> {/* end shared container */}

        {/* ── (d) Closing block — centered ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "0 64px 100px" }}>
          <svg
            viewBox="0 0 135.3 78.6"
            width="72"
            height="42"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path fill={tokens.limeLight} d="M49.8,69.3c-.3,3.5-2.5,7.2-6.4,6.3-2.1,2.1-5,2.5-7.9,2.6-3.3,0-6.7,0-10,0-1.5,0-3.1.2-4.6.3-3.7.2-8.7.3-11-3.1-.1-.2-.2-.4-.3-.6-2.3-.9-2.3-3.7-.4-4.9.1-.4.3-.9.5-1.3,1-2,2.9-3.4,4.8-4.4,2.1-1.2,4.4-2.2,6.8-3,1-.3,2-.5,2.9-.7,0-.8.1-1.5.2-2.2.5-3.3.8-6.7,1.6-9.9,0-.7,0-1.4-.1-2.1,0-1-.7-2.3-.8-3.5-.3-2,0-4,0-6,0-2.1,0-4.2-.2-6.2-.2-3.5-.6-7.1-.6-10.6,0-2,0-4,0-6-.1-2.1-.3-4.3-1.1-6.3-.5-.6-1.1-1.2-1.7-1.7-.4-.3-.9-.6-1.4-.8-.4.3-.9.6-1.2.9-.9.8-1.7,1.8-2.5,2.7-1.4,1.8-2.6,3.8-3.8,5.7-1.9,2.9-4.1,8.4-8.3,8.4-3.2,0-4.6-3.5-4-6.2.7-2.8,2.7-5.5,4.4-7.8,1.2-1.5,2.4-2.9,3.6-4.4,1-1.2,1.8-2.6,3.2-3.4C13.6-.3,17-.2,19.5.5c1.2-.4,2.5-.5,3.8-.2,2.8.7,5,3.2,6.2,5.8,1.3,2.7,1.7,5.6,2.1,8.5.4,3.8.8,7.5,1.2,11.3,1,8.1,2.1,16.2,2.2,24.4,0,2,0,4-.1,6,0,1-.2,1.9-.5,2.8,1.3-.2,2.7-.3,4.1-.3,2.4,0,5.3-.1,7.4,1.2,3,1.9,4.2,6,3.9,9.4ZM9.9,9.1c-.5.6-1,1.2-1.5,1.8-1.4,1.7-3.1,3.9-3.8,6.1,1.8-2.6,3.5-5.4,5.3-8Z" />
            <path fill={tokens.limeLight} d="M62.3,33.2c-1-1.3-1.1-2.8-.8-4.4.1-.5.3-1,.5-1.5.1-.3.3-.7.4-1,0,0,0,0,0,0,0-.1.1-.3.2-.4.4-1.1.9-2.4,2.1-3,.3-.2.7-.3,1-.3,0,0,0,0,.1-.1,2.4-1.5,4.6.8,5.8,2.6.6.8,1,1.7,1.4,2.6.4.9.5,1.9.2,2.8-.8,2.8-3.8,4.8-6.6,4.8-1.6,0-3.2-.8-4.3-2.1ZM73.2,58.4c-.3.7-.6,1.3-.9,1.9-.3,1.9-1,3.6-2.4,4.9-1,.9-2.2,1.5-3.5,1.2-.3,0-.5-.2-.8-.3-1.7-.3-3-1.8-3.5-3.4-.4-1.1-.2-2.5,0-3.6.3-1.2.7-2.3,1.4-3.3.7-1.2,1.7-2.1,3-2.6,1.1-.4,2.5-.2,3.5.4,1,0,2.1.3,2.8,1,1,1,1,2.6.5,3.9ZM65.7,30.2c0,0,0,.1,0,.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.2,0,.2.1,0,0,0,0,0,0,0,0,0,0,.1,0,0,0,0,0,0,0,0,0,0,0,0,0,.1,0,.2,0,.4,0,0,0,.1,0,.1,0,0,0,.2,0,.3,0,0,0,.2,0,.3,0,.2,0,.4-.2.6-.3,0,0,.1,0,.2-.1,0,0,0,0,0,0,.2-.1.3-.3.4-.4,0,0,0-.1.1-.2,0,0,0,0,0,0,0,0,0-.1,0-.2,0,0,0,0,0,0,0,0,0-.2,0-.3,0-.1-.1-.3-.2-.4-.2-.3-.3-.6-.5-.9-.1-.2-.2-.3-.3-.5,0,0,0,0,0-.1-.1-.1-.2-.2-.3-.4-.1,0-.3,0-.4,0,0,0,0,0,0,0-.2.4-.3.9-.5,1.3-.2.4-.3.8-.4,1.3,0,.2-.1.4-.2.6,0,0,0,.1,0,.2Z" />
            <path fill={tokens.limeLight} d="M135.2,69.3c-.3,3.5-2.5,7.2-6.4,6.3-2.1,2.1-5,2.5-7.9,2.6-3.3,0-6.7,0-10,0-1.5,0-3.1.2-4.6.3-3.7.2-8.7.3-11-3.1-.1-.2-.2-.4-.3-.6-2.3-.9-2.3-3.7-.4-4.9.1-.4.3-.9.5-1.3,1-2,2.9-3.4,4.8-4.4,2.1-1.2,4.4-2.2,6.8-3,1-.3,2-.5,2.9-.7,0-.8.1-1.5.2-2.2.5-3.3.8-6.7,1.6-9.9,0-.7,0-1.4-.1-2.1,0-1-.7-2.3-.8-3.5-.3-2,0-4,0-6,0-2.1,0-4.2-.2-6.2-.2-3.5-.6-7.1-.6-10.6,0-2,0-4,0-6-.1-2.1-.3-4.3-1.1-6.3-.5-.6-1.1-1.2-1.7-1.7-.4-.3-.9-.6-1.4-.8-.4.3-.9.6-1.2.9-.9.8-1.7,1.8-2.5,2.7-1.4,1.8-2.6,3.8-3.8,5.7-1.9,2.9-4.1,8.4-8.3,8.4-3.2,0-4.6-3.5-4-6.2.7-2.8,2.7-5.5,4.4-7.8,1.2-1.5,2.4-2.9,3.6-4.4,1-1.2,1.8-2.6,3.2-3.4,2.2-1.3,5.6-1.2,8.1-.6,1.2-.4,2.5-.5,3.8-.2,2.8.7,5,3.2,6.2,5.8,1.3,2.7,1.7,5.6,2.1,8.5.4,3.8.8,7.5,1.2,11.3,1,8.1,2.1,16.2,2.2,24.4,0,2,0,4-.1,6,0,1-.2,1.9-.5,2.8,1.3-.2,2.7-.3,4.1-.3,2.4,0,5.3-.1,7.4,1.2,3,1.9,4.2,6,3.9,9.4ZM95.3,9.1c-.5.6-1,1.2-1.5,1.8-1.4,1.7-3.1,3.9-3.8,6.1,1.8-2.6,3.5-5.4,5.3-8Z" />
          </svg>
          <h2 style={{
            fontSize: 40,
            fontWeight: 500,
            color: "#FCFBF8",
            lineHeight: 1.1,
            margin: 0,
            fontFamily: "var(--font-host-grotesk)",
            textAlign: "center",
          }}>
            Liberado com um clique
          </h2>
          <Link
            href="/cadastro"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 24px",
              background: tokens.lime,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "#3E3B12",
              textDecoration: "none",
              width: 320,
              boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
            }}
          >
            Criar Loop.Talk <ArrowIcon />
          </Link>
        </div>

      </div>
    </section>
  );
}
