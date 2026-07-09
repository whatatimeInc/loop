"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FolderFrame } from "@/components/ui/FolderFrame";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { tokens } from "@/components/ui/tokens";

type FormState = {
  headline: string;
  bio: string;
  photo_url: string;
};

export function PerfilForm({
  userId,
  username,
  firstName,
  lastName,
  initialData,
}: {
  userId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  initialData: FormState;
}) {
  const [form, setForm] = useState<FormState>(initialData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handlePhotoSelect(file: File) {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    let photoUrl = form.photo_url || null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (upErr) {
        setError(`Erro no upload da foto: ${upErr.message}`);
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      photoUrl = publicUrl;
    }

    const { error: err } = await supabase
      .from("profiles")
      .update({
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        photo_url: photoUrl,
      })
      .eq("id", userId);

    setSaving(false);
    if (err) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setAvatarFile(null);
      setSaved(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Foto de perfil */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FolderFrame
          photoUrl={avatarPreview ?? form.photo_url ?? null}
          firstName={firstName ?? ""}
          lastName={lastName ?? ""}
          onPhotoSelect={handlePhotoSelect}
          width={160}
        />
        <p style={{ fontSize: 12, color: tokens.muted, margin: 0 }}>
          Clique no botão para trocar a foto.
        </p>
      </div>

      {/* URL pública (bloqueada) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: tokens.muted }}>URL pública</label>
        <div style={{
          display: "flex", alignItems: "center", overflow: "hidden",
          borderRadius: 8, border: `1px solid ${tokens.borderSubtle}`,
          background: tokens.bg, opacity: 0.7, cursor: "not-allowed",
        }}>
          <span style={{
            padding: "12px 14px", background: "#F4F2EB", color: tokens.muted,
            fontSize: 13, whiteSpace: "nowrap",
            borderRight: `1px solid ${tokens.borderSubtle}`, flexShrink: 0,
          }}>
            loop.talk/
          </span>
          <input
            value={username ?? ""}
            disabled
            style={{
              flex: 1, padding: "12px 14px",
              border: "none", background: "transparent",
              fontSize: 14, color: tokens.muted,
              outline: "none", fontFamily: "inherit", cursor: "not-allowed",
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: tokens.muted, margin: 0 }}>
          Para alterar o username, entre em contato com o suporte.
        </p>
      </div>

      {/* Descrição (headline) */}
      <FloatingInput
        label="Descrição"
        value={form.headline}
        onChange={(v) => set("headline", v)}
      />

      {/* Sobre (bio) */}
      <FloatingTextarea
        label="Sobre"
        value={form.bio}
        onChange={(v) => set("bio", v)}
        rows={6}
      />

      {error && (
        <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{error}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px 28px",
            borderRadius: 8,
            border: "none",
            background: saving ? tokens.borderSubtle : tokens.lime,
            color: tokens.dark,
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {saving ? "Salvando…" : saved ? "Salvo" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
