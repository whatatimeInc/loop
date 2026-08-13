"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";

// ─── CATEGORY ICONS ───────────────────────────────────────────────────────────

function IconCarreira() {
  return (
    <svg width="24" height="24" viewBox="0 0 50.1 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="car-cp0"><polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1"/></clipPath>
        <clipPath id="car-cp1"><polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1"/></clipPath>
        <clipPath id="car-cp2"><polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1"/></clipPath>
      </defs>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#car-cp0)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M29.5,16.9L1.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/>
        </g>
        <polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#car-cp1)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M11.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M39.5,16.9L11.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/>
        </g>
        <polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#car-cp2)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M21.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M49.5,16.9L21.2.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/>
        </g>
        <polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
    </svg>
  );
}
function IconModa() {
  return (
    <svg width="24" height="24" viewBox="0 0 48.9 48.5" fill="var(--color-gray-900)" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.7,2.8l21.4,21.4-21.4,21.4L3.3,24.2,24.7,2.8M24.7,0L.5,24.2l24.2,24.2,24.2-24.2L24.7,0h0Z"/>
      <path d="M34.8,14.1v20.2H14.6V14.1h20.2M36.8,12.1H12.6v24.2h24.2V12.1h0Z"/>
      <path d="M24.7,14.9l9.3,9.3-9.3,9.3-9.3-9.3,9.3-9.3M24.7,12.1l-12.1,12.1,12.1,12.1,12.1-12.1-12.1-12.1h0Z"/>
    </svg>
  );
}
function IconSaude() {
  return (
    <svg width="24" height="24" viewBox="0 0 42.8 43.5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="var(--color-gray-900)" strokeWidth="2" strokeMiterlimit="10">
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
  );
}
function IconTecnologia() {
  return (
    <svg width="24" height="24" viewBox="0 0 58.5 51.8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="tec-cp0"><polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5"/></clipPath>
        <clipPath id="tec-cp1"><polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9"/></clipPath>
        <clipPath id="tec-cp2"><polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3"/></clipPath>
      </defs>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#tec-cp0)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,34.5l27.5-16,27.7,16-27.5,16L1.9,34.5M58.5,34.5l-29.1-16.8L.5,34.5l29.1,16.8,28.9-16.8"/>
        </g>
        <polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#tec-cp1)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,25.9l27.5-16,27.7,16-27.5,16L1.9,25.9M58.5,25.9L29.4,9.1.5,25.9l29.1,16.8,28.9-16.8"/>
        </g>
        <polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#tec-cp2)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,17.3L29.4,1.3l27.7,16-27.5,16L1.9,17.3M58.5,17.3L29.4.5.5,17.3l29.1,16.8,28.9-16.8"/>
        </g>
        <polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
    </svg>
  );
}
function IconCriatividade() {
  return (
    <svg width="24" height="24" viewBox="0 0 40.5 40" fill="var(--color-gray-900)" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2.5,29.9,2.5,20,10.5,2,20.5,2M20.5,0C9.4,0,.5,8.9.5,20s9,20,20,20,20-9,20-20S31.5,0,20.5,0h0Z"/>
      <path d="M20.5,18c5.5,0,10,4.5,10,10s-4.5,10-10,10-10-4.5-10-10,4.5-10,10-10M20.5,16c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12-5.4-12-12-12h0Z"/>
      <path d="M20.5,26c3.3,0,6,2.7,6,6s-2.7,6-6,6-6-2.7-6-6,2.7-6,6-6M20.5,24c-4.4,0-8,3.6-8,8s3.6,8,8,8,8-3.6,8-8-3.6-8-8-8h0Z"/>
    </svg>
  );
}
function IconGastronomia() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 40" fill="var(--color-gray-900)" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2,29.9,2,20,10.1,2,20,2M20,0C9,0,0,9,0,20s9,20,20,20,20-9,20-20S31,0,20,0h0Z"/>
      <path d="M40,2c9.9,0,18,8.1,18,18s-8.1,18-18,18-18-8.1-18-18S30.1,2,40,2M40,0c-11,0-20,9-20,20s9,20,20,20,20-9,20-20S51,0,40,0h0Z"/>
    </svg>
  );
}
function IconArquitetura() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="var(--color-gray-900)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="10" y="14" width="4" height="7" rx="0.5" stroke="var(--color-gray-900)" strokeWidth="1.5"/>
    </svg>
  );
}

// ─── INTERESTS ────────────────────────────────────────────────────────────────

const INTERESTS = [
  { value: "career_business",   label: "Carreira e Negócios", Icon: IconCarreira },
  { value: "fashion_style",     label: "Moda e Lifestyle",    Icon: IconModa },
  { value: "health_wellness",   label: "Saúde e Bem-Estar",   Icon: IconSaude },
  { value: "technology",        label: "Tecnologia",          Icon: IconTecnologia },
  { value: "creativity_art",    label: "Criatividade",        Icon: IconCriatividade },
  { value: "gastronomy",        label: "Gastronomia",         Icon: IconGastronomia },
  { value: "home_architecture", label: "Casa e Arquitetura",  Icon: IconArquitetura },
] as const;

type Interest = typeof INTERESTS[number]["value"];

// ─── FLOATING LABEL INPUT ─────────────────────────────────────────────────────

function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  valid,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  valid?: boolean;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div
      style={{
        position: "relative",
        height: 48,
        background: "var(--color-cream)",
        borderRadius: 8,
        outline: `1px solid ${focused ? "var(--color-gray-900)" : "var(--color-gray-200)"}`,
        boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
        overflow: "hidden",
        cursor: "text",
      }}
      onClick={() => document.getElementById(`fi-${label}`)?.focus()}
    >
      {/* Floating label */}
      <label
        htmlFor={`fi-${label}`}
        style={{
          position: "absolute",
          left: 14,
          top: lifted ? 8 : "50%",
          transform: lifted ? "none" : "translateY(-50%)",
          fontSize: lifted ? 10 : 14,
          lineHeight: lifted ? "12px" : "20px",
          color: "var(--color-gray-600)",
          transition: "all 0.15s ease",
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "inherit",
        }}
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={`fi-${label}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: lifted ? 20 : 0,
          paddingLeft: 14,
          paddingRight: valid ? 36 : 14,
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 14,
          color: "#272518",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />

      {/* Valid checkmark */}
      {valid && (
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M1 5.5l4.5 4.5L15 1" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── ARROW ICON ───────────────────────────────────────────────────────────────

function ArrowRight({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10h12M11 5l5 5-5 5" stroke={color} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  referralCode?: string;
};

export function WaitlistModal({ open, onClose, referralCode }: Props) {
  const [step, setStep]         = useState<1 | 2>(1);
  const [name, setName]         = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail]       = useState("");
  const [agreed, setAgreed]     = useState(false);
  const [interest, setInterest] = useState<Interest | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [copied, setCopied]     = useState(false);

  const referralSlug = [name, lastName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "-");
  const referralUrl = `loop.talk/waitlist?ref=${referralSlug}`;

  function reset() {
    setStep(1); setName(""); setLastName(""); setEmail("");
    setAgreed(false); setInterest(""); setDone(false); setError(null);
    setPosition(null); setCopied(false);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 380);
  }

  const step1Valid = name.trim().length > 0 && email.includes("@") && agreed;

  async function handleSubmit() {
    if (!interest) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/waitlist/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: [name, lastName].filter(Boolean).join(" "),
          interest,
          ref: referralCode,
        }),
      });
      const json = await res.json().catch(() => ({})) as { ok?: boolean; error?: string; position?: number };
      if (!res.ok) {
        throw new Error(json.error ?? "Algo deu errado.");
      }
      setPosition(json.position ?? null);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  const ctaActive = step === 1 ? step1Valid : !!interest && !submitting;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(39,37,24,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />

          {/* Drawer — slides in from right */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 201,
              width: "min(500px, 92vw)",
              background: "var(--color-gray-100)",
              borderRadius: "16px 0 0 16px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              style={{
                flexShrink: 0,
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--color-gray-200)",
                position: "relative",
                background: "var(--color-gray-100)",
              }}
            >
              {/* Back arrow — hidden on step 1 / done */}
              <button
                onClick={step === 2 && !done ? () => setStep(1) : undefined}
                style={{
                  opacity: step === 2 && !done ? 1 : 0,
                  pointerEvents: step === 2 && !done ? "auto" : "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.15s",
                }}
                aria-label="Voltar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M10 7l-5 5 5 5" stroke="var(--color-gray-900)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Logo — absolutely centered */}
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                <Logo size="header" />
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-gray-900)",
                }}
                aria-label="Fechar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="var(--color-gray-900)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* ── Scrollable content ── */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    style={{
                      padding: "32px 16px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 24,
                    }}
                  >
                    {/* Title + name */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 300,
                          color: "var(--color-gray-600)",
                          fontFamily: "var(--font-host-grotesk)",
                          margin: 0,
                          lineHeight: "20px",
                        }}
                      >
                        Você está na lista de espera
                      </p>
                      <h2
                        style={{
                          fontSize: 40,
                          fontWeight: 400,
                          color: "var(--color-gray-900)",
                          fontFamily: "var(--font-nerfos), var(--font-host-grotesk)",
                          margin: 0,
                          lineHeight: "44px",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {[name, lastName].filter(Boolean).join(" ")}
                      </h2>
                    </div>

                    {/* White card */}
                    <div
                      style={{
                        background: "var(--color-bg-white)",
                        borderRadius: 8,
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {/* Position */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: "16px" }}>
                          Sua posição na fila
                        </span>
                        <span
                          style={{
                            fontSize: 30,
                            fontWeight: 500,
                            color: "var(--color-gray-900)",
                            fontFamily: "var(--font-host-grotesk)",
                            lineHeight: "36px",
                          }}
                        >
                          #{position ?? "—"}
                        </span>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: "#F0EFE9" }} />

                      {/* Referral */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: "16px" }}>
                          Indique e avance na fila
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-olive-600)",
                            lineHeight: "16px",
                            wordBreak: "break-all",
                          }}
                        >
                          {referralUrl}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard
                              .writeText(`https://${referralUrl}`)
                              .then(() => {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              })
                              .catch(() => {});
                          }}
                          style={{
                            alignSelf: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--color-olive-600)",
                            background: "var(--color-cream)",
                            color: "var(--color-olive-600)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "background 0.15s",
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="var(--color-olive-600)" strokeWidth="1.8"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="var(--color-olive-600)" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                          {copied ? "Link copiado!" : "Copiar link"}
                        </button>
                      </div>
                    </div>

                    {/* Email confirmation */}
                    <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0, lineHeight: "20px" }}>
                      Enviamos um e-mail para <strong style={{ color: "var(--color-gray-900)" }}>{email}</strong>.{" "}
                      Você pode fechar essa aba com segurança.
                    </p>
                  </motion.div>

                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: "32px 16px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 32,
                    }}
                  >
                    {/* Title */}
                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: 300,
                          color: "var(--color-gray-900)",
                          fontFamily: "var(--font-host-grotesk)",
                          lineHeight: "32px",
                          margin: 0,
                        }}
                      >
                        Entrar na lista de espera
                      </h2>
                      <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0, lineHeight: "20px" }}>
                        Preencha os campos abaixo para garantir sua vaga.
                      </p>
                    </div>

                    {/* Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <FloatingInput
                        label="Nome"
                        value={name}
                        onChange={setName}
                        valid={name.trim().length > 1}
                        autoComplete="given-name"
                      />
                      <FloatingInput
                        label="Sobrenome"
                        value={lastName}
                        onChange={setLastName}
                        autoComplete="family-name"
                      />
                      <FloatingInput
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        valid={email.includes("@") && email.includes(".")}
                        autoComplete="email"
                      />
                    </div>

                    {/* Terms */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                      <div
                        onClick={() => setAgreed(!agreed)}
                        style={{
                          flexShrink: 0,
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: `1px solid ${agreed ? "var(--color-gray-900)" : "var(--color-gray-200)"}`,
                          background: agreed ? "var(--color-gray-900)" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {agreed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="var(--color-cream)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--color-gray-600)", lineHeight: "16px" }}>
                        Concordo com os{" "}
                        <a href="/termos" target="_blank" style={{ color: "var(--color-gray-600)", textDecoration: "underline" }}>
                          Termos e Condições
                        </a>
                        {" "}do Loop.Talk e aceito a{" "}
                        <a href="/privacidade" target="_blank" style={{ color: "var(--color-gray-600)", textDecoration: "underline" }}>
                          Política de Privacidade
                        </a>
                        .
                      </span>
                    </label>

                    {referralCode && (
                      <p style={{ fontSize: 12, color: "var(--color-gray-500)", textAlign: "center", margin: 0 }}>
                        Você foi convidado(a) por um membro da lista.
                      </p>
                    )}
                  </motion.div>

                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: "32px 16px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 24,
                    }}
                  >
                    {/* Title */}
                    <h2
                      style={{
                        fontSize: 24,
                        fontWeight: 300,
                        color: "var(--color-gray-900)",
                        fontFamily: "var(--font-host-grotesk)",
                        lineHeight: "32px",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      Qual sua principal área de interesse?
                    </h2>

                    {/* Category list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {INTERESTS.map(({ value, label, Icon }) => {
                        const selected = interest === value;
                        return (
                          <button
                            key={value}
                            onClick={() => setInterest(value)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              padding: "0 18px",
                              height: 64,
                              borderRadius: 12,
                              background: selected ? tokens.lime : "var(--color-bg-white)",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.15s",
                              fontFamily: "inherit",
                            }}
                          >
                            <Icon />
                            <span style={{ fontSize: 15, fontWeight: selected ? 600 : 400, color: "var(--color-gray-900)" }}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {error && (
                      <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center", margin: 0 }}>{error}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Bottom bar ── */}
            <div style={{ flexShrink: 0 }}>
              {/* Two-segment progress bar — both yellow when done */}
              <div style={{ display: "flex", height: 4 }}>
                <div style={{ flex: 1, background: tokens.lime }} />
                <div style={{ flex: 1, background: done || step === 2 ? tokens.lime : "var(--color-gray-200)", transition: "background 0.3s" }} />
              </div>
              {/* Button area */}
              <div
                style={{
                  padding: 16,
                  background: "color-mix(in srgb, var(--color-bg-white) 50%, transparent)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                {done ? (
                  <button
                    onClick={handleClose}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      background: "var(--color-gray-900)",
                      color: "var(--color-cream)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Entendi
                  </button>
                ) : (
                  <button
                    onClick={step === 1 ? () => step1Valid && setStep(2) : handleSubmit}
                    disabled={!ctaActive}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      background: ctaActive ? "var(--color-gray-900)" : "var(--color-gray-200)",
                      color: ctaActive ? "var(--color-cream)" : "var(--color-gray-400)",
                      border: "1px solid " + (ctaActive ? "var(--color-gray-900)" : "var(--color-gray-200)"),
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: ctaActive ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "background 0.18s, color 0.18s, border-color 0.18s",
                    }}
                  >
                    {step === 1
                      ? "Continuar"
                      : submitting
                      ? "Entrando na lista…"
                      : "Entrar na lista de espera"}
                    {!submitting && <ArrowRight color={ctaActive ? "var(--color-cream)" : "var(--color-gray-400)"} />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
