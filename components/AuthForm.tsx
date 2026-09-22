"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "iconoir-react";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";

// ─── componente de input ──────────────────────────────────────────────────────

function Input({
  label, type = "text", value, onChange, placeholder, error, autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2">{label}</label>
      <div className={`flex items-center border-2 rounded-lg transition-colors ${error ? "border-red-300" : "border-gray-200 focus-within:border-lime"}`}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent rounded-lg"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="px-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            {show ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}

// ─── força da senha ───────────────────────────────────────────────────────────

function ForcaSenha({ senha }: { senha: string }) {
  if (!senha) return null;
  const checks = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Fraca", "Razoável", "Boa", "Forte"];
  const colors = ["bg-red-400", "bg-amber-400", "bg-lime/70", "bg-lime"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-[10px] font-medium ${score <= 1 ? "text-red-400" : score === 2 ? "text-amber-500" : "text-gray-500"}`}>
        {labels[score - 1] ?? "Muito fraca"}
      </p>
    </div>
  );
}

// ─── AuthForm principal ───────────────────────────────────────────────────────

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"), "/explorar");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (mode === "signup" && nome.trim().length < 2) errs.nome = "Nome muito curto";
    if (!email.includes("@")) errs.email = "E-mail inválido";
    if (senha.length < 6) errs.senha = "Senha deve ter pelo menos 6 caracteres";
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

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) authError = error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos"
        : error.message;
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { full_name: nome } },
      });
      if (error) authError = error.message;
    }

    setLoading(false);

    if (authError) {
      setErrors({ geral: authError });
      return;
    }

    setSucesso(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push(redirect);
    router.refresh();
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tight text-gray-900">
              face<span className="text-lime">.</span>Talk
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta gratuitamente"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Nome completo"
                value={nome}
                onChange={setNome}
                placeholder="Seu nome"
                error={errors.nome}
                autoComplete="name"
              />
            )}
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="voce@email.com"
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600">Senha</label>
                {isLogin && (
                  <Link href="/login/recuperar" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Esqueci minha senha
                  </Link>
                )}
              </div>
              <div className={`flex items-center border-2 rounded-lg transition-colors ${errors.senha ? "border-red-300" : "border-gray-200 focus-within:border-lime"}`}>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={isLogin ? "Sua senha" : "Mín. 8 caracteres"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="flex-1 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none bg-transparent rounded-lg"
                />
              </div>
              {errors.senha && <p className="text-xs text-red-400 mt-1.5">{errors.senha}</p>}
              {!isLogin && <ForcaSenha senha={senha} />}
            </div>

            {/* Termos (apenas signup) */}
            {!isLogin && (
              <p className="text-xs text-gray-400 leading-relaxed">
                Ao criar sua conta você concorda com os{" "}
                <Link href="/termos" className="text-gray-600 underline underline-offset-2">Termos de Uso</Link>
                {" "}e a{" "}
                <Link href="/privacidade" className="text-gray-600 underline underline-offset-2">Política de Privacidade</Link>.
              </p>
            )}

            {/* Erro geral (ex: credenciais inválidas) */}
            {errors.geral && (
              <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-xs text-red-600 font-medium">
                {errors.geral}
              </div>
            )}

            {/* Botão submit */}
            <button
              type="submit"
              disabled={loading || sucesso}
              className="w-full py-4 rounded-lg bg-gray-900 text-white font-bold text-sm disabled:opacity-50 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              {sucesso ? (
                <>
                  <Check className="w-4 h-4 text-lime" />
                  {isLogin ? "Entrando..." : "Conta criada!"}
                </>
              ) : loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : isLogin ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>

        {/* Link de alternância */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? (
            <>Não tem conta?{" "}
              <Link href="/signup" className="font-semibold text-gray-900 hover:underline">Criar conta grátis</Link>
            </>
          ) : (
            <>Já tem conta?{" "}
              <Link href="/login" className="font-semibold text-gray-900 hover:underline">Entrar</Link>
            </>
          )}
        </p>

        {/* Separador para criadores */}
        {!isLogin && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 mb-2">É um criador de conteúdo?</p>
            <Link
              href="/seja-mentor"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
            >
              Saiba como monetizar suas sessões →
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
