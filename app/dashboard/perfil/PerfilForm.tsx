"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  headline: string;
  bio: string;
  photo_url: string;
};

export function PerfilForm({
  userId,
  username,
  initialData,
}: {
  userId: string;
  username: string | null;
  initialData: FormState;
}) {
  const [form, setForm] = useState<FormState>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
      })
      .eq("id", userId);

    setSaving(false);
    if (err) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setSaved(true);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #E4E2D9",
    fontSize: 14,
    color: "#272618",
    background: "#fff",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#272618",
    display: "block",
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      {/* Username (readonly) */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Nome de usuário</label>
        <input
          value={username ?? ""}
          disabled
          style={{ ...inputStyle, background: "#F4F2EB", color: "#626053", cursor: "not-allowed" }}
        />
        <p style={{ fontSize: 12, color: "#626053", marginTop: 4 }}>
          Para alterar o username, entre em contato com o suporte.
        </p>
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Headline</label>
        <input
          type="text"
          value={form.headline}
          onChange={(e) => set("headline", e.target.value)}
          placeholder="Ex: Product Designer · Ajudo equipes a criar produtos melhores"
          maxLength={100}
          style={inputStyle}
        />
        <p style={{ fontSize: 12, color: "#626053", marginTop: 4 }}>
          {form.headline.length}/100 caracteres
        </p>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Conte sobre sua experiência, como você pode ajudar e o que as pessoas ganham ao conversar com você."
          maxLength={600}
          rows={5}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
        <p style={{ fontSize: 12, color: "#626053", marginTop: 4 }}>
          {form.bio.length}/600 caracteres
        </p>
      </div>

      {/* Photo URL */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>URL da foto de perfil</label>
        <input
          type="url"
          value={form.photo_url}
          onChange={(e) => set("photo_url", e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />
        <p style={{ fontSize: 12, color: "#626053", marginTop: 4 }}>
          Use uma URL pública de imagem (JPG ou PNG). Upload direto em breve.
        </p>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#c0392b", marginBottom: 16 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: "12px 28px",
          borderRadius: 8,
          border: "none",
          background: saving ? "#E4E2D9" : "#EAEA68",
          color: "#272618",
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {saving ? "Salvando…" : saved ? "Salvo ✓" : "Salvar alterações"}
      </button>
    </form>
  );
}
