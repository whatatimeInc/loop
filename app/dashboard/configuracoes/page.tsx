"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "../DashboardShell";

const DARK   = "#272618";
const MUTED  = "#626053";
const FAINT  = "#AEADA4";
const CARD   = "#FFFFFF";
const BEIGE  = "#F4F2EB";
const BORDER = "#E4E2D9";
const GREEN  = "#5FAD8E";
const RED    = "#D93B3B";
const LIME   = "#EAEA68";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{children}</p>;
}

export default function ConfiguracoesPage() {
  const { profile, setProfile } = useDashboard();
  const router = useRouter();

  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [waFocused, setWaFocused] = useState(false);
  const [waSaved, setWaSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setResolvedEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSaveWhatsapp() {
    startTransition(async () => {
      const raw = whatsapp.replace(/\D/g, "");
      const sb = createClient();
      await sb.from("profiles").update({ whatsapp: raw || null }).eq("id", profile.id);
      setProfile(prev => ({ ...prev, whatsapp: raw || null }));
      setWaSaved(true);
      setTimeout(() => setWaSaved(false), 2000);
    });
  }

  async function handleSignOut() {
    const confirmed = window.confirm("Sair da conta?");
    if (!confirmed) return;
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* E-mail */}
      <SectionCard title="E-mail">
        <FieldLabel>Endereço de e-mail</FieldLabel>
        <div style={{
          height: 48, display: "flex", alignItems: "center",
          padding: "0 16px", borderRadius: 8,
          border: `1px solid ${BORDER}`, background: BEIGE,
          fontSize: 14, color: MUTED,
        }}>
          {resolvedEmail ?? "—"}
        </div>
        <p style={{ fontSize: 12, color: FAINT, margin: "8px 0 0" }}>
          O e-mail está vinculado ao magic link e não pode ser alterado aqui.
        </p>
      </SectionCard>

      {/* WhatsApp */}
      <SectionCard title="WhatsApp">
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          background: `${LIME}33`, border: `1px solid ${LIME}`,
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#3E3B12", margin: "0 0 4px" }}>
            Conecte seu WhatsApp
          </p>
          <p style={{ fontSize: 12, color: "#5A5720", margin: 0 }}>
            Receba lembretes automáticos de agendamentos e notificações de sessão direto no seu WhatsApp.
          </p>
        </div>

        <FieldLabel>Número com DDD</FieldLabel>
        <div style={{ display: "flex", gap: 0, marginBottom: 8 }}>
          <div style={{
            height: 48, padding: "0 12px", display: "flex", alignItems: "center",
            background: BEIGE, border: `1px solid ${BORDER}`, borderRight: "none",
            borderRadius: "8px 0 0 8px", fontSize: 13, color: MUTED, gap: 6,
            flexShrink: 0,
          }}>
            <span>🇧🇷</span>
            <span>+55</span>
          </div>
          <input
            type="tel"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            onFocus={() => setWaFocused(true)}
            onBlur={() => setWaFocused(false)}
            placeholder="11 99999-9999"
            style={{
              flex: 1, height: 48,
              border: `1px solid ${waFocused ? DARK : BORDER}`,
              borderRadius: "0 8px 8px 0",
              padding: "0 16px", fontSize: 14, color: DARK,
              background: CARD, fontFamily: "inherit", outline: "none",
              transition: "border-color 0.15s",
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: FAINT, margin: "0 0 16px" }}>
          Apenas números, sem o +55. Exemplo: 11 99999-9999
        </p>

        <button
          onClick={handleSaveWhatsapp}
          disabled={isPending}
          style={{
            padding: "10px 20px", borderRadius: 8,
            background: waSaved ? GREEN : DARK,
            color: waSaved ? "white" : "#FCFBF8",
            fontSize: 14, fontWeight: 600, border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "background 0.2s",
          }}
        >
          {waSaved ? "Salvo ✓" : isPending ? "Salvando…" : "Salvar WhatsApp"}
        </button>
      </SectionCard>

      {/* Notificações stub */}
      <SectionCard title="Notificações">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Novo agendamento", desc: "Quando um guest agendar uma sessão com você" },
            { label: "Lembrete de sessão", desc: "1 hora antes de cada sessão" },
            { label: "Cancelamento", desc: "Quando uma sessão for cancelada" },
          ].map(({ label, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <p style={{ fontSize: 14, color: DARK, margin: "0 0 2px", fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 12, color: FAINT, margin: 0 }}>{desc}</p>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 11,
                background: BEIGE, border: `1px solid ${BORDER}`,
                position: "relative", cursor: "not-allowed", opacity: 0.6,
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: MUTED, position: "absolute", top: 2, left: 2,
                }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: FAINT, margin: "16px 0 0" }}>Notificações via e-mail em breve.</p>
      </SectionCard>

      {/* Conta */}
      <SectionCard title="Conta">
        <button
          onClick={handleSignOut}
          style={{
            padding: "10px 20px", borderRadius: 8,
            background: "transparent", border: `1px solid ${RED}`,
            color: RED, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Sair da conta
        </button>
      </SectionCard>
    </div>
  );
}
