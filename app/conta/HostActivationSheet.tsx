"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { tokens } from "@/components/ui/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = "basic-info" | "profile" | "username" | "sessions" | "availability" | "payment";

const STEPS: { id: StepId; label: string; required: boolean }[] = [
  { id: "basic-info",   label: "Informações básicas", required: false },
  { id: "profile",      label: "Perfil",              required: true  },
  { id: "username",     label: "Seu link",            required: true  },
  { id: "sessions",     label: "Sessões e preços",    required: false },
  { id: "availability", label: "Disponibilidade",     required: false },
  { id: "payment",      label: "Pagamento",           required: false },
];

const STEP_IDS = STEPS.map((s) => s.id);

interface SessionType {
  duration: number;
  price: string;
  label: string;
}

const DAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"] as const;
type Day = typeof DAYS[number];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  helper,
  error,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  helper?: string;
  error?: string;
  multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 8,
    border: `1.5px solid ${error ? "#D93B3B" : "#E4E2D9"}`,
    fontSize: 14,
    color: "var(--color-gray-900)",
    background: "var(--color-bg-white)",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-gray-600)", marginBottom: 6 }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={base}
        />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
      {error && <p style={{ fontSize: 12, color: "#D93B3B", margin: "4px 0 0" }}>{error}</p>}
      {helper && !error && <p style={{ fontSize: 12, color: "var(--color-gray-400)", margin: "4px 0 0" }}>{helper}</p>}
    </div>
  );
}

// ─── Step content components ──────────────────────────────────────────────────

function StepBasicInfo({
  name, setName, lastName, setLastName,
}: {
  name: string; setName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0 }}>
        Confirme seu nome. Ele aparecerá no seu perfil público.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nome" value={name} onChange={setName} placeholder="Seu nome" />
        <Field label="Sobrenome" value={lastName} onChange={setLastName} placeholder="Seu sobrenome" />
      </div>
    </div>
  );
}

function StepProfile({
  photoUrl, setPhotoUrl, headline, setHeadline, bio, setBio, error,
}: {
  photoUrl: string; setPhotoUrl: (v: string) => void;
  headline: string; setHeadline: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field
        label="URL da foto de perfil *"
        value={photoUrl}
        onChange={setPhotoUrl}
        placeholder="https://..."
        helper="Cole a URL de uma foto sua (JPEG ou PNG). Upload de arquivo em breve."
        error={error}
      />
      {photoUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#E4E2D9",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => {}} />
          </div>
          <p style={{ fontSize: 13, color: "var(--color-gray-600)" }}>Preview da foto</p>
        </div>
      )}
      <Field
        label="Título profissional"
        value={headline}
        onChange={setHeadline}
        placeholder="Ex: CEO da Empresa X · Investidor"
        helper="Uma linha que aparece abaixo do seu nome."
      />
      <Field
        label="Sobre você"
        value={bio}
        onChange={setBio}
        placeholder="Conte um pouco sobre sua trajetória e o que você pode oferecer nas sessões..."
        multiline
      />
    </div>
  );
}

function StepUsername({
  username, setUsername, error, checking,
}: {
  username: string; setUsername: (v: string) => void; error?: string; checking: boolean;
}) {
  const slug = username.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0 }}>
        Escolha o nome único do seu link público.
      </p>
      <Field
        label="Username *"
        value={username}
        onChange={setUsername}
        placeholder="seu-nome"
        error={error}
        helper={checking ? "Verificando disponibilidade..." : undefined}
      />
      {slug && !error && !checking && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "var(--color-gray-100)",
            border: "1px solid #E4E2D9",
            fontSize: 14,
            color: "var(--color-gray-900)",
          }}
        >
          Seu link: <strong>loop.talk/{slug}</strong>
        </div>
      )}
    </div>
  );
}

function StepSessions({
  sessions, setSessions,
}: {
  sessions: SessionType[];
  setSessions: (s: SessionType[]) => void;
}) {
  function add() {
    setSessions([...sessions, { duration: 30, price: "", label: "" }]);
  }
  function update(i: number, field: keyof SessionType, value: string | number) {
    setSessions(sessions.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s
    ));
  }
  function remove(i: number) {
    setSessions(sessions.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0 }}>
        Defina as opções de sessão que os clientes poderão agendar.
      </p>
      {sessions.map((s, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 1fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-gray-600)", marginBottom: 6 }}>
              Duração
            </label>
            <select
              value={s.duration}
              onChange={(e) => update(i, "duration", Number(e.target.value))}
              style={{
                width: "100%",
                padding: "11px 10px",
                borderRadius: 8,
                border: "1.5px solid #E4E2D9",
                fontSize: 14,
                color: "var(--color-gray-900)",
                background: "var(--color-bg-white)",
                fontFamily: "inherit",
              }}
            >
              {[15, 20, 30, 45, 60, 90].map((d) => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </div>
          <Field label="Preço (R$)" value={s.price} onChange={(v) => update(i, "price", v)} placeholder="150" type="number" />
          <Field label="Nome (opcional)" value={s.label} onChange={(v) => update(i, "label", v)} placeholder="Mentoria rápida" />
          <button
            onClick={() => remove(i)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-gray-400)",
              fontSize: 18,
              padding: "8px",
              marginBottom: 2,
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 16px",
          borderRadius: 8,
          border: "1.5px dashed #E4E2D9",
          background: "none",
          fontSize: 14,
          color: "var(--color-gray-600)",
          cursor: "pointer",
          fontFamily: "inherit",
          alignSelf: "flex-start",
        }}
      >
        + Adicionar sessão
      </button>
    </div>
  );
}

function StepAvailability({
  availability, setAvailability,
}: {
  availability: Record<Day, boolean>;
  setAvailability: (a: Record<Day, boolean>) => void;
}) {
  function toggle(day: Day) {
    setAvailability({ ...availability, [day]: !availability[day] });
  }
  const labels: Record<Day, string> = {
    seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sáb: "Sáb", dom: "Dom",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0 }}>
        Quais dias da semana você está disponível? A configuração de horários fica no painel.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => toggle(day)}
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              border: `2px solid ${availability[day] ? "var(--color-gray-900)" : "#E4E2D9"}`,
              background: availability[day] ? "var(--color-gray-900)" : "var(--color-bg-white)",
              color: availability[day] ? "var(--color-cream)" : "var(--color-gray-600)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {labels[day]}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--color-gray-400)", margin: 0 }}>
        Horários específicos e bloqueios configurados em Painel → Disponibilidade.
      </p>
    </div>
  );
}

function StepPayment({
  pixKey, setPixKey,
}: {
  pixKey: string; setPixKey: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0 }}>
        Informe sua chave Pix para receber os pagamentos das sessões.
      </p>
      <Field
        label="Chave Pix"
        value={pixKey}
        onChange={setPixKey}
        placeholder="CPF, e-mail, telefone ou chave aleatória"
        helper="Repasses semanais toda sexta-feira."
      />
    </div>
  );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

export function HostActivationSheet({
  userId,
  initialStep,
  initialName,
  initialLastName,
  onClose,
}: {
  userId: string;
  initialStep: string | null;
  initialName: string;
  initialLastName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const resumeIndex = Math.max(0, STEP_IDS.indexOf((initialStep as StepId) ?? "basic-info"));
  const [stepIndex, setStepIndex] = useState(resumeIndex);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState(initialName);
  const [lastName, setLastName] = useState(initialLastName);
  const [photoUrl, setPhotoUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [sessions, setSessions] = useState<SessionType[]>([
    { duration: 30, price: "150", label: "" },
  ]);
  const [availability, setAvailability] = useState<Record<Day, boolean>>({
    seg: true, ter: true, qua: true, qui: true, sex: true, sáb: false, dom: false,
  });
  const [pixKey, setPixKey] = useState("");

  const currentStep = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const progress = ((stepIndex) / STEPS.length) * 100;

  const checkUsername = useCallback(async (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (slug.length < 3) { setUsernameError("Mínimo 3 caracteres"); return false; }
    setCheckingUsername(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", slug)
      .neq("id", userId)
      .single();
    setCheckingUsername(false);
    if (data) { setUsernameError("Esse username já está em uso"); return false; }
    setUsernameError("");
    return true;
  }, [userId]);

  async function validate(): Promise<boolean> {
    if (currentStep.id === "profile" && !photoUrl.startsWith("http")) {
      setError("URL da foto de perfil é obrigatória");
      return false;
    }
    if (currentStep.id === "username") {
      const ok = await checkUsername(username);
      if (!ok) return false;
    }
    setError("");
    return true;
  }

  async function saveStep() {
    const supabase = createClient();
    const slug = username.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

    const updates: Record<string, unknown> = { onboarding_step: currentStep.id };

    if (currentStep.id === "basic-info") {
      updates.name = name;
      updates.last_name = lastName;
    }
    if (currentStep.id === "profile") {
      updates.photo_url = photoUrl;
      updates.headline = headline;
      updates.bio = bio;
    }
    if (currentStep.id === "username") {
      updates.username = slug;
    }
    if (currentStep.id === "availability") {
      updates.availability_json = availability;
    }
    if (currentStep.id === "payment") {
      updates.pix_key = pixKey;
    }

    await supabase.from("profiles").update(updates).eq("id", userId);

    // Save session types
    if (currentStep.id === "sessions" && sessions.length > 0) {
      const valid = sessions.filter((s) => s.price && Number(s.price) > 0);
      if (valid.length > 0) {
        await supabase.from("session_types").delete().eq("host_id", userId);
        await supabase.from("session_types").insert(
          valid.map((s) => ({
            host_id: userId,
            duration_minutes: s.duration,
            price_brl: Number(s.price),
            label: s.label || null,
          }))
        );
      }
    }
  }

  async function handleContinue() {
    const ok = await validate();
    if (!ok) return;
    setSaving(true);
    await saveStep();
    setSaving(false);

    if (isLast) {
      // Activate host mode
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ host_profile_activated: true, host_activated_at: new Date().toISOString() })
        .eq("id", userId);
      router.push("/dashboard");
      router.refresh();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  async function handleSkip() {
    if (currentStep.required) return;
    setSaving(true);
    await saveStep();
    setSaving(false);
    if (isLast) {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ host_profile_activated: true, host_activated_at: new Date().toISOString() })
        .eq("id", userId);
      router.push("/dashboard");
      router.refresh();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleClose() {
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "color-mix(in srgb, var(--color-gray-900) 50%, transparent)",
          zIndex: 200,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          background: "var(--color-cream)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 32px color-mix(in srgb, var(--color-gray-900) 12%, transparent)",
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: "#E4E2D9" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: tokens.lime,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 28px",
            borderBottom: "1px solid #E4E2D9",
          }}
        >
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gray-400)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Passo {stepIndex + 1} de {STEPS.length}
            </p>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-gray-900)", margin: 0, fontFamily: "var(--font-host-grotesk)" }}>
              {currentStep.label}
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-gray-400)",
              fontSize: 22,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, padding: "16px 28px 0" }}>
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: i <= stepIndex ? "var(--color-gray-900)" : "#E4E2D9",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {currentStep.id === "basic-info" && (
            <StepBasicInfo name={name} setName={setName} lastName={lastName} setLastName={setLastName} />
          )}
          {currentStep.id === "profile" && (
            <StepProfile
              photoUrl={photoUrl} setPhotoUrl={setPhotoUrl}
              headline={headline} setHeadline={setHeadline}
              bio={bio} setBio={setBio}
              error={error || undefined}
            />
          )}
          {currentStep.id === "username" && (
            <StepUsername
              username={username} setUsername={(v) => { setUsername(v); setUsernameError(""); }}
              error={usernameError || undefined}
              checking={checkingUsername}
            />
          )}
          {currentStep.id === "sessions" && (
            <StepSessions sessions={sessions} setSessions={setSessions} />
          )}
          {currentStep.id === "availability" && (
            <StepAvailability availability={availability} setAvailability={setAvailability} />
          )}
          {currentStep.id === "payment" && (
            <StepPayment pixKey={pixKey} setPixKey={setPixKey} />
          )}

          {error && currentStep.id !== "profile" && (
            <p style={{ fontSize: 13, color: "#D93B3B", marginTop: 12 }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px 28px",
            borderTop: "1px solid #E4E2D9",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {stepIndex > 0 && (
            <button
              onClick={() => setStepIndex((i) => i - 1)}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: "1.5px solid #E4E2D9",
                background: "none",
                fontSize: 14,
                color: "var(--color-gray-600)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Voltar
            </button>
          )}

          <button
            onClick={handleContinue}
            disabled={saving}
            style={{
              flex: 1,
              padding: "13px 20px",
              borderRadius: 8,
              background: "var(--color-gray-900)",
              color: "var(--color-cream)",
              border: "none",
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {saving
              ? "Salvando..."
              : isLast
              ? "Ativar perfil de Host"
              : "Continuar"}
          </button>

          {!currentStep.required && (
            <button
              onClick={handleSkip}
              disabled={saving}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-gray-400)",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              Pular
            </button>
          )}
        </div>
      </div>
    </>
  );
}
