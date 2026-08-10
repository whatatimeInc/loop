"use client";

import { useState } from "react";

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-gray-600)", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 8,
          border: "1.5px solid #E4E2D9",
          fontSize: 14,
          color: "var(--color-gray-900)",
          background: "var(--color-bg-white)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {helper && (
        <p style={{ fontSize: 12, color: "var(--color-gray-400)", marginTop: 4 }}>{helper}</p>
      )}
    </div>
  );
}

export function SegurancaClient({
  email,
  hasPassword,
}: {
  email: string;
  hasPassword: boolean;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg("A senha deve ter pelo menos 8 caracteres.");
      setStatus("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setStatus("error");
      return;
    }
    setLoading(true);
    setStatus("idle");

    const res = await fetch("/conta/api/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    setLoading(false);
    if (res.ok) {
      setStatus("success");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const json = await res.json().catch(() => ({}));
      setErrorMsg(json.error ?? "Algo deu errado.");
      setStatus("error");
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg-white)",
    borderRadius: 12,
    border: "1px solid #E4E2D9",
    padding: "24px",
    marginBottom: 16,
    maxWidth: 520,
  };

  return (
    <div>
      {/* E-mail section */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-gray-900)", margin: "0 0 4px" }}>
          E-mail
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-gray-600)", margin: "0 0 16px" }}>
          Para alterar seu e-mail, entre em contato com o suporte.
        </p>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "var(--color-gray-100)",
            fontSize: 14,
            color: "var(--color-gray-900)",
          }}
        >
          {email}
        </div>
      </div>

      {/* Password section */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-gray-900)", margin: "0 0 4px" }}>
          {hasPassword ? "Alterar senha" : "Definir senha"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-gray-600)", margin: "0 0 20px" }}>
          {hasPassword
            ? "Você já tem uma senha definida. Insira uma nova para alterar."
            : "Opcionalmente, defina uma senha para entrar sem precisar de link por e-mail."}
        </p>

        <form onSubmit={handleSavePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Mín. 8 caracteres"
            helper="Use uma mistura de letras, números e símbolos."
          />
          <Field
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repita a nova senha"
          />

          {status === "error" && (
            <p style={{ fontSize: 13, color: "#D93B3B" }}>{errorMsg}</p>
          )}
          {status === "success" && (
            <p style={{ fontSize: 13, color: "#3B8C5A" }}>
              Senha {hasPassword ? "alterada" : "definida"} com sucesso.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              background: "var(--color-gray-900)",
              color: "var(--color-cream)",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              alignSelf: "flex-start",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Salvando..." : "Salvar senha"}
          </button>
        </form>
      </div>

      {/* 2FA placeholder */}
      <div style={{ ...cardStyle, opacity: 0.5 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-gray-900)", margin: "0 0 4px" }}>
          Autenticação em dois fatores
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-gray-600)", margin: 0 }}>
          Em breve.
        </p>
      </div>
    </div>
  );
}
