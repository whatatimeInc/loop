"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { tokens } from "@/components/ui/tokens";

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
          background: "#FCFBF8",
          border: `1px solid ${error ? "#EB6A67" : focused ? "#272618" : "#DAD9D5"}`,
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
            color: floated ? "#626053" : "#AEADA4",
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
            color: "#272618",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: "#EB6A67", marginTop: 4 }}>{error}</p>}
      {helper && !error && <p style={{ fontSize: 12, color: "#AEADA4", marginTop: 4 }}>{helper}</p>}
    </div>
  );
}

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

type Step = "form" | "link-sent";

export function CadastroForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/criar";

  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // ── Link sent ──────────────────────────────────────────────────────────────────
  if (step === "link-sent") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F4F2EB",
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
              background: "#FFFFFF",
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#272618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: "#272618", margin: "0 0 12px", fontFamily: "var(--font-host-grotesk)" }}>
              Verifique seu e-mail
            </h2>
            <p style={{ fontSize: 14, color: "#626053", lineHeight: 1.6, margin: 0 }}>
              Enviamos um link de acesso para{" "}
              <strong style={{ color: "#272618" }}>{email}</strong>. Clique nele
              para ativar sua conta.
            </p>
          </div>
          <p style={{ fontSize: 13, color: "#AEADA4", marginTop: 20 }}>
            Não recebeu?{" "}
            <button
              onClick={() => setStep("form")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#272618",
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
        background: "#F4F2EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <Logo size="header" />
          <p style={{ fontSize: 14, color: "#626053", marginTop: 10 }}>
            Crie sua conta gratuitamente
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E4E2D9",
            padding: "32px",
          }}
        >
          {/* Google */}
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
              background: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              color: "#272618",
              cursor: googleLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: googleLoading ? 0.6 : 1,
            }}
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E4E2D9" }} />
            <span style={{ fontSize: 12, color: "#AEADA4" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#E4E2D9" }} />
          </div>

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
                  color: "#EB6A67",
                }}
              >
                {errors.geral}
              </div>
            )}

            <p style={{ fontSize: 12, color: "#AEADA4", lineHeight: 1.5, margin: "4px 0 0" }}>
              Ao criar sua conta você concorda com os{" "}
              <Link href="/termos" style={{ color: "#626053" }}>Termos de Uso</Link>{" "}
              e a{" "}
              <Link href="/privacidade" style={{ color: "#626053" }}>Política de Privacidade</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 20px",
                borderRadius: 8,
                background: "#272618",
                color: "#FCFBF8",
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

        <p style={{ textAlign: "center", fontSize: 14, color: "#626053", marginTop: 20 }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "#272618", textDecoration: "none" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
