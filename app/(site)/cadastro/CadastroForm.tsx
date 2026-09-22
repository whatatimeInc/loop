"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";
import { safeRedirectPath } from "@/lib/safe-redirect";

// ── Inline floating-label input ───────────────────────────────────────────────
function InlineInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  helper,
  autoComplete,
  autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helper?: string;
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
      {error && <p style={{ fontSize: 12, color: "var(--color-error)", marginTop: 4 }}>{error}</p>}
      {helper && !error && <p style={{ fontSize: 12, color: "var(--color-gray-400)", marginTop: 4 }}>{helper}</p>}
    </div>
  );
}

type Step = "form" | "link-sent";

export function CadastroForm() {
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"), "/criar");

  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Nome obrigatório";
    if (lastName.trim().length < 2) errs.lastName = "Sobrenome obrigatório";
    if (!email.includes("@")) errs.email = "E-mail inválido";
    if (password && password.length < 8) errs.password = "Mín. 8 caracteres";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const supabase = createClient();
    let authError: string | null = null;

    if (password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          data: { name, last_name: lastName },
        },
      });
      if (error) authError = error.message;
      else if (data.session) {
        // email confirmation disabled — session created immediately
        setLoading(false);
        router.push(redirect);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          data: { name, last_name: lastName },
        },
      });
      if (error) authError = error.message;
    }

    setLoading(false);
    if (authError) { setErrors({ geral: authError }); return; }
    setStep("link-sent");
  }

  // ── Link sent ──────────────────────────────────────────────────────────────────
  if (step === "link-sent") {
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
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
            <Logo size="header" />
          </div>
          <div
            style={{
              background: "var(--color-bg-white)",
              borderRadius: 16,
              border: "1px solid #E4E2D9",
              padding: "40px 32px",
            }}
          >
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
              Verifique seu e-mail
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-gray-600)", lineHeight: 1.6, margin: 0 }}>
              Enviamos um link de acesso para{" "}
              <strong style={{ color: "var(--color-gray-900)" }}>{email}</strong>. Clique nele
              para ativar sua conta.
            </p>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-gray-400)", marginTop: 20 }}>
            Não recebeu?{" "}
            <button
              onClick={() => setStep("form")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-gray-900)",
                fontWeight: 600,
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Tentar novamente
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────────
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
            Crie sua conta gratuitamente
          </p>
        </div>

        <div
          style={{
            background: "var(--color-bg-white)",
            borderRadius: 16,
            border: "1px solid #E4E2D9",
            padding: "32px",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <InlineInput
                label="Nome"
                value={name}
                onChange={setName}
                error={errors.name}
                autoComplete="given-name"
                autoFocus
              />
              <InlineInput
                label="Sobrenome"
                value={lastName}
                onChange={setLastName}
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>
            <InlineInput
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              autoComplete="email"
            />
            <InlineInput
              label="Senha (opcional)"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              helper="Você também pode entrar pelo link enviado no e-mail."
              autoComplete="new-password"
            />

            {errors.geral && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "rgba(235,106,103,0.08)",
                  border: "1px solid rgba(235,106,103,0.3)",
                  fontSize: 13,
                  color: "var(--color-error)",
                }}
              >
                {errors.geral}
              </div>
            )}

            <p style={{ fontSize: 12, color: "var(--color-gray-400)", lineHeight: 1.5, margin: "4px 0 0" }}>
              Ao criar sua conta você concorda com os{" "}
              <Link href="/termos" style={{ color: "var(--color-gray-600)" }}>Termos de Uso</Link>{" "}
              e a{" "}
              <Link href="/privacidade" style={{ color: "var(--color-gray-600)" }}>Política de Privacidade</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 20px",
                borderRadius: "var(--radius-pill)",
                background: "var(--color-gray-900)",
                color: "var(--color-cream)",
                border: "none",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontFamily: "inherit",
                marginTop: 4,
              }}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-gray-600)", marginTop: 20 }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "var(--color-gray-900)", textDecoration: "none" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
