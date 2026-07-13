"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PHOTO_URL = "/mentors/andre-do-amaral/profile.webp";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  sectionBg: "#F2F0E8",
  card: "#FCFBF8",
  border: "rgba(39,38,24,0.10)",
  dark: "#272618",
  muted: "#6E6C60",
  lime: "#EAEA68",
  limeText: "#3E3B12",
  chipDefault: "#DEDBC6",
  chipDefaultText: "#4A4834",
  track: "#DAD9D5",
  decoBeige: "#E0DDC1",
};

// ── CSS keyframes + animation classes (injected once) ────────────────────────
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
  .how-lift {
    animation: how-lift 5.2s cubic-bezier(.4,0,.2,1) infinite;
    will-change: transform;
  }
  .how-fanA {
    animation: how-fanA 5.2s cubic-bezier(.4,0,.2,1) infinite;
    transform-origin: 65% 70%;
    will-change: transform;
  }
  .how-fanB {
    animation: how-fanB 5.2s cubic-bezier(.4,0,.2,1) infinite;
    transform-origin: 70% 80%;
    will-change: transform;
  }
  .how-lift.paused,
  .how-fanA.paused,
  .how-fanB.paused {
    animation-play-state: paused;
  }
  @media (prefers-reduced-motion: reduce) {
    .how-lift, .how-fanA, .how-fanB {
      animation: none !important;
    }
  }
`;

// ── FolderFrame geometry (matches components/ui/FolderFrame.tsx) ───────────
const CW = 193;
const CH = 234;
const FOLDER_W = 158;
const FOLDER_H = Math.round((FOLDER_W * CH) / CW); // ≈ 192
const LIFT_PAD = 20; // headroom above the animated cards for the lift

// ── Card 1: Folder illustration with animation ────────────────────────────────
function FolderIllustration({ playing }: { playing: boolean }) {
  const p = playing ? "" : " paused";

  const photoLeft = (26.834 / CW) * FOLDER_W;
  const photoWidth = (137 / CW) * FOLDER_W;
  const photoHeight = (169 / CH) * FOLDER_H;
  const photoRadius = (24 / CW) * FOLDER_W;

  return (
    <div
      style={{
        position: "relative",
        width: FOLDER_W,
        height: FOLDER_H + LIFT_PAD,
        overflow: "hidden",
      }}
    >
      {/* ── Animated group: photo + decorations lift together ── */}
      <div
        className={`how-lift${p}`}
        style={{
          position: "absolute",
          top: LIFT_PAD,
          left: 0,
          width: FOLDER_W,
          height: FOLDER_H,
        }}
      >
        {/* Yellow decoration (fans right) */}
        <div
          className={`how-fanA${p}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <svg
            width={FOLDER_W}
            height={FOLDER_H}
            viewBox={`0 0 ${CW} ${CH}`}
            fill="none"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden="true"
          >
            <path
              d="M165.525 55.3413L108.388 47.6067C101.833 46.7193 95.7992 51.3063 94.9106 57.852L84.4432 134.959C83.5546 141.505 88.148 147.531 94.7029 148.418L151.84 156.152C158.394 157.04 164.429 152.453 165.317 145.907L175.785 68.7999C176.673 62.2542 172.08 56.2286 165.525 55.3413Z"
              fill={T.lime}
            />
          </svg>
        </div>

        {/* Beige decoration (fans left) */}
        <div
          className={`how-fanB${p}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <svg
            width={FOLDER_W}
            height={FOLDER_H}
            viewBox={`0 0 ${CW} ${CH}`}
            fill="none"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden="true"
          >
            <path
              d="M180.669 89.2264L117.691 70.884C111.341 69.0345 104.692 72.6758 102.84 79.0171L80.5429 155.357C78.6907 161.698 82.3372 168.338 88.6874 170.188L151.665 188.53C158.015 190.38 164.665 186.739 166.517 180.397L188.814 104.057C190.666 97.716 187.019 91.076 180.669 89.2264Z"
              fill={T.decoBeige}
            />
          </svg>
        </div>

        {/* Mentor photo */}
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

      {/* ── Folder face — static, overlaps animated content ── */}
      <svg
        width={FOLDER_W}
        height={FOLDER_H}
        viewBox={`0 0 ${CW} ${CH}`}
        fill="none"
        style={{
          position: "absolute",
          top: LIFT_PAD,
          left: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <path
          d="M162.236 233.998H10.4345C5.13181 233.998 0.833984 229.719 0.833984 224.44V85.5577C0.833984 80.2786 5.13181 76 10.4345 76H51.4857C54.9235 76 58.251 77.2042 60.8839 79.4041C74.2235 90.5459 116.682 125.219 116.682 125.219L168.635 171.494C170.67 173.307 171.834 175.899 171.834 178.618V224.442C171.834 229.721 167.536 234 162.233 234L162.236 233.998Z"
          fill="#272618"
        />
      </svg>

      {/* ── Name in Nerfos — static ── */}
      <span
        style={{
          position: "absolute",
          left: (16 / CW) * FOLDER_W,
          top: LIFT_PAD + (188 / CH) * FOLDER_H,
          zIndex: 3,
          fontFamily: "Nerfos, cursive",
          color: "#FCFBF8",
          fontSize: FOLDER_W * (20 / 220),
          lineHeight: 1,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        André do Amaral
      </span>
    </div>
  );
}

// ── Card 2: Agenda chip carousel ──────────────────────────────────────────────
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
// Ping-pong sequence: Qua(2) → Qui(3) → Sex(4) → Qui(3) → repeat
const PING_PONG = [2, 3, 4, 3];
const CHIP_SIZE = 56;
const CHIP_GAP = 10;
const CHIP_STEP = CHIP_SIZE + CHIP_GAP;
// Three repetitions give enough chips for the carousel scroll
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

    // Target sits in the second repetition (first repetition = DAYS.length chips)
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, step]);

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        overflow: "hidden",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
      }}
    >
      <div
        ref={rowRef}
        style={{
          display: "flex",
          gap: CHIP_GAP,
          padding: "14px 0",
          willChange: "transform",
        }}
      >
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
                background: isActive ? T.lime : T.chipDefault,
                color: isActive ? T.limeText : T.chipDefaultText,
                transform: isActive ? "scale(1.1)" : "scale(1)",
                transition:
                  "background 0.5s ease, color 0.5s ease, transform 0.5s ease",
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

// ── Card 3: Price slider ──────────────────────────────────────────────────────
const PRICE_LO = 120;
const PRICE_HI = 310;
const TRACK_W = 190;
const THUMB_W = 24;
const ANIM_DUR = 2600; // ms for one direction

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
      // Show end state for reduced motion
      if (prefersReduced) {
        if (valRef.current) valRef.current.textContent = String(PRICE_HI);
        if (fillRef.current)
          fillRef.current.style.transform = "translateY(-50%) scaleX(0.85)";
        if (thumbRef.current)
          thumbRef.current.style.transform = `translate(${(0.85 * TRACK_W).toFixed(1)}px, -50%)`;
      }
      return;
    }

    function frame(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % (ANIM_DUR * 2);
      const p =
        elapsed < ANIM_DUR
          ? elapsed / ANIM_DUR
          : 1 - (elapsed - ANIM_DUR) / ANIM_DUR;
      const k = easeInOutCubic(p);
      const frac = 0.1 + 0.75 * k;

      if (valRef.current)
        valRef.current.textContent = String(
          Math.round(PRICE_LO + (PRICE_HI - PRICE_LO) * k)
        );
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
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        paddingBottom: 16,
      }}
    >
      <p style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 14, color: T.dark, fontFamily: "var(--font-inter)" }}>
          R$
        </span>
        <span
          ref={valRef}
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: T.dark,
            fontFamily: "var(--font-host-grotesk)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: "30px",
          }}
        >
          {PRICE_LO}
        </span>
        <span style={{ fontSize: 14, color: T.dark, fontFamily: "var(--font-inter)" }}>
          /hora
        </span>
      </p>

      <div
        style={{
          position: "relative",
          width: TRACK_W,
          height: 48,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Track */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: TRACK_W,
            height: 15,
            borderRadius: 99,
            background: T.track,
          }}
        />
        {/* Fill — animates via scaleX (GPU, no reflow) */}
        <div
          ref={fillRef}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%) scaleX(0.1)",
            transformOrigin: "left center",
            width: TRACK_W,
            height: 15,
            borderRadius: 99,
            background: T.lime,
            willChange: "transform",
          }}
        />
        {/* Thumb — frosted glass */}
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: `translate(0, -50%)`,
            width: THUMB_W,
            height: 48,
            borderRadius: 99,
            background: "rgba(224,221,193,0.40)",
            border: "1px solid #fff",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            willChange: "transform",
          }}
        />
      </div>
    </div>
  );
}

// ── Shared card styles ────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: T.card,
  border: `0.5px solid ${T.border}`,
  borderRadius: 14,
  padding: "32px 24px 36px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: 460,
};

const illustrationWrap: React.CSSProperties = {
  flex: 1,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 20,
};

function CardHeader({ title, subtitle, isMobile }: { title: string; subtitle: string; isMobile?: boolean }) {
  return (
    <>
      <p
        style={{
          fontSize: 24,
          fontWeight: 300,
          color: T.dark,
          margin: "0 0 8px",
          textAlign: "center",
          fontFamily: "var(--font-host-grotesk)",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: isMobile ? 14 : 16,
          lineHeight: 1.55,
          color: T.muted,
          margin: 0,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        {subtitle}
      </p>
    </>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export function HowItWorksSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cards = [
    {
      title: "Crie seu perfil",
      subtitle: "Em minutos, um link exclusivo para compartilhar com sua audiência.",
      illustration: <FolderIllustration playing={playing} />,
    },
    {
      title: "Defina sua agenda",
      subtitle: "Escolha seus horários e conecte ao Google Calendar.",
      illustration: <AgendaCarousel playing={playing} />,
    },
    {
      title: "Receba seu valor",
      subtitle: "Defina seu preço e receba na conta de preferência. Sem mensalidade.",
      illustration: <PriceSlider playing={playing} />,
    },
  ];

  if (isMobile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />
        <div ref={sectionRef} style={{ background: T.sectionBg, borderRadius: 16, padding: "20px 0 20px" }}>
          <style>{`
            .how-cards-carousel {
              display: flex;
              align-items: stretch;
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              scroll-padding-left: 24px;
              -webkit-overflow-scrolling: touch;
              padding: 0 24px 4px;
              gap: 12px;
              scrollbar-width: none;
            }
            .how-cards-carousel::-webkit-scrollbar { display: none; }
            .how-carousel-card { flex: 0 0 80%; scroll-snap-align: start; }
          `}</style>
          <div className="how-cards-carousel">
            {cards.map(({ title, subtitle, illustration }, i) => (
              <div
                key={title}
                className="how-carousel-card"
                style={{ ...cardStyle, minHeight: 380, overflow: "hidden", minWidth: 0 }}
              >
                <CardHeader title={title} subtitle={subtitle} isMobile={true} />
                <div style={illustrationWrap}>
                  {illustration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />
      <div
        ref={sectionRef}
        style={{
          background: T.sectionBg,
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 20,
          }}
        >
          {cards.map(({ title, subtitle, illustration }) => (
            <div key={title} style={cardStyle}>
              <CardHeader title={title} subtitle={subtitle} />
              <div style={illustrationWrap}>
                {illustration}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
