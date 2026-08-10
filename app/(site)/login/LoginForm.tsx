"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";

type Step = "email" | "password" | "link-sent";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── Inline floating-label input ───────────────────────────────────────────────
function InlineInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div>
      <div
        style={{
          position: "relative",
          height: 52,
          background: "var(--color-cream)",
          border: `1px solid ${error ? "var(--color-error)" : focused ? "var(--color-gray-900)" : "var(--color-gray-200)"}`,
          borderRadius: 8,
          boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
        }}
      >
        <label
          style={{
            position: "absolute",
            left: 14,
            pointerEvents: "none",
            transition: "top 0.12s ease, font-size 0.12s ease, color 0.12s ease",
            top: floated ? 9 : 17,
            fontSize: floated ? 10 : 14,
            fontWeight: floated ? 600 : 400,
            color: floated ? "var(--color-gray-600)" : "var(--color-gray-400)",
            lineHeight: 1,
          }}
        >
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            padding: "20px 14px 8px",
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            color: "var(--color-gray-900)",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>
      {error && (
        <p style={{ fontSize: 12, color: "var(--color-error)", marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-white)",
  borderRadius: 16,
  border: "1px solid #E4E2D9",
  padding: "32px",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: 8,
  background: "var(--color-gray-900)",
  color: "var(--color-cream)",
  border: "none",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const ghostBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  color: "var(--color-gray-600)",
  fontFamily: "inherit",
  padding: 0,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/conta";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkPurpose, setLinkPurpose] = useState<"login" | "forgot">("login");

  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("E-mail inválido"); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { hasPassword } = await res.json();

    if (hasPassword) {
      setLoading(false);
      setStep("password");
    } else {
      await sendMagicLink("login");
    }
  }

  async function sendMagicLink(purpose: "login" | "forgot") {
    setLinkPurpose(purpose);
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    setLoading(false);
    setStep("link-sent");
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Insira sua senha"); return; }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (authError) {
      setError("Senha incorreta. Tente novamente ou receba um link por e-mail.");
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
  }

  const divider = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "#E4E2D9" }} />
      <span style={{ fontSize: 12, color: "var(--color-gray-400)" }}>ou</span>
      <div style={{ flex: 1, height: 1, background: "#E4E2D9" }} />
    </div>
  );

  // ── Link sent ─────────────────────────────────────────────────────────────────
  if (step === "link-sent") {
    return (
      <Wrapper>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: tokens.lime,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-900)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: "var(--color-gray-900)", margin: "0 0 12px", fontFamily: "var(--font-host-grotesk)" }}>
            {linkPurpose === "forgot" ? "Link enviado" : "Verifique seu e-mail"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-gray-600)", lineHeight: 1.6, margin: "0 0 20px" }}>
            {linkPurpose === "forgot"
              ? "Enviamos um link para redefinir o acesso para "
              : "Enviamos um link de acesso para "}
            <strong style={{ color: "var(--color-gray-900)" }}>{email}</strong>.
          </p>
          <button
            onClick={() => { setStep("email"); setPassword(""); setError(""); }}
            style={{ ...ghostBtn, fontSize: 13 }}
          >
            Voltar e tentar com outro e-mail
          </button>
        </div>
      </Wrapper>
    );
  }

  // ── Password step ─────────────────────────────────────────────────────────────
  if (step === "password") {
    return (
      <Wrapper>
        <div style={cardStyle}>
          <form onSubmit={handlePasswordLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Locked email row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px",
                borderRadius: 8,
                background: "var(--color-gray-100)",
                border: "1px solid var(--color-gray-200)",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--color-gray-900)" }}>{email}</span>
              <button
                type="button"
                onClick={() => { setStep("email"); setPassword(""); setError(""); }}
                style={{ ...ghostBtn, fontSize: 12, color: "var(--color-gray-400)" }}
              >
                Alterar
              </button>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                <button
                  type="button"
                  onClick={() => sendMagicLink("forgot")}
                  style={{ ...ghostBtn, fontSize: 12 }}
                >
                  Esqueci minha senha
                </button>
              </div>
              <InlineInput
                label="Senha"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                autoFocus
                error={error || undefined}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...primaryBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => sendMagicLink("login")}
              disabled={loading}
              style={{ ...ghostBtn, width: "100%", textAlign: "center", fontSize: 13 }}
            >
              Prefiro receber um link por e-mail
            </button>
          </form>
        </div>
      </Wrapper>
    );
  }

  // ── Email step (default) ──────────────────────────────────────────────────────
  return (
    <Wrapper>
      <div style={cardStyle}>
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 8,
            border: "1.5px solid #E4E2D9",
            background: "var(--color-bg-white)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-gray-900)",
            cursor: googleLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: googleLoading ? 0.6 : 1,
          }}
        >
          <GoogleIcon />
          Continuar com Google
        </button>

        {divider}

        <form onSubmit={handleEmailContinue} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <InlineInput
            label="E-mail"
            type="email"
            value={email}
            onChange={(v) => { setEmail(v); setError(""); }}
            autoComplete="email"
            autoFocus
            error={error || undefined}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...primaryBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Verificando..." : "Continuar"}
          </button>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-gray-600)", marginTop: 20 }}>
        Não tem conta?{" "}
        <Link href="/cadastro" style={{ fontWeight: 600, color: "var(--color-gray-900)", textDecoration: "none" }}>
          Criar conta
        </Link>
      </p>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-gray-100)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Logo size="header" />
          <p style={{ fontSize: 14, color: "var(--color-gray-600)", marginTop: 10 }}>
            Boas vindas de volta
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
