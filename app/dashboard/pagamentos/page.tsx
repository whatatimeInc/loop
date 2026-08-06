"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "../DashboardShell";
import { tokens } from "@/components/ui/tokens";

const DARK   = "#272618";
const MUTED  = "#626053";
const FAINT  = "#AEADA4";
const LIME = tokens.lime;
const CARD   = "#FFFFFF";
const BEIGE  = "#F4F2EB";
const BORDER = "#E4E2D9";
const GREEN  = "#5FAD8E";

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

export default function PagamentosPage() {
  const { profile, setProfile } = useDashboard();
  const [hourlyInput, setHourlyInput] = useState(
    profile.hourly_price ? String(profile.hourly_price / 100) : ""
  );
  const [pixKey, setPixKey] = useState(profile.pix_key ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hourlyBRL = parseFloat(hourlyInput.replace(",", ".")) || 0;
  const hourlyCents = Math.round(hourlyBRL * 100);

  const DURATIONS = [
    { label: "30 min", pct: 0.5 },
    { label: "45 min", pct: 0.75 },
    { label: "60 min", pct: 1 },
  ];

  async function handleSave() {
    startTransition(async () => {
      const sb = createClient();
      await sb
        .from("profiles")
        .update({ hourly_price: hourlyCents, pix_key: pixKey || null })
        .eq("id", profile.id);

      // Sync session_types from the 3 duration tiers
      if (hourlyCents > 0) {
        await sb.from("session_types").delete().eq("host_id", profile.id);
        await sb.from("session_types").insert(
          DURATIONS.map(({ label, pct }) => ({
            host_id: profile.id,
            label,
            duration_minutes: label === "30 min" ? 30 : label === "45 min" ? 45 : 60,
            price_brl: Math.round(hourlyCents * pct),
            active: true,
          }))
        );
      }

      setProfile(prev => ({ ...prev, hourly_price: hourlyCents, pix_key: pixKey || null }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Preço da hora */}
      <SectionCard title="Preço da hora">
        <p style={{ fontSize: 13, color: MUTED, margin: "0 0 16px" }}>
          Define o valor base por hora. As sessões são derivadas proporcionalmente.
        </p>

        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
          <span style={{
            padding: "0 14px", height: 48, display: "flex", alignItems: "center",
            background: BEIGE, border: `1px solid ${BORDER}`, borderRight: "none",
            borderRadius: "8px 0 0 8px", fontSize: 15, fontWeight: 600, color: MUTED,
          }}>R$</span>
          <input
            type="number"
            min="0"
            step="10"
            value={hourlyInput}
            onChange={e => setHourlyInput(e.target.value)}
            placeholder="200"
            style={{
              height: 48, flex: 1, border: `1px solid ${BORDER}`, borderRadius: "0 8px 8px 0",
              padding: "0 16px", fontSize: 18, fontWeight: 700, color: DARK,
              background: CARD, fontFamily: "inherit", outline: "none",
            }}
          />
        </div>

        {/* Preview das durações */}
        {hourlyCents > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {DURATIONS.map(({ label, pct }) => {
              const price = Math.round(hourlyCents * pct);
              return (
                <div key={label} style={{
                  padding: "14px 16px", background: BEIGE, borderRadius: 10,
                  border: `1px solid ${BORDER}`, textAlign: "center",
                }}>
                  <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>{label}</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{fmtBRL(price)}</p>
                  <p style={{ fontSize: 11, color: FAINT, margin: "2px 0 0" }}>{Math.round(pct * 100)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Recebimento via Pix */}
      <SectionCard title="Recebimento via Pix">
        <p style={{ fontSize: 13, color: MUTED, margin: "0 0 16px" }}>
          Informe sua chave Pix para receber pagamentos das sessões.
        </p>
        <input
          type="text"
          value={pixKey}
          onChange={e => setPixKey(e.target.value)}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          style={{
            width: "100%", height: 48, border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: "0 16px", fontSize: 14, color: DARK, background: CARD,
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          }}
        />
        <p style={{ fontSize: 12, color: FAINT, margin: "8px 0 0" }}>
          O pagamento é processado via Pagar.me. Você receberá na chave informada após a sessão.
        </p>
      </SectionCard>

      {/* Extrato stub */}
      <SectionCard title="Extrato">
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 4px" }}>Extrato em breve</p>
          <p style={{ fontSize: 12, color: FAINT, margin: 0 }}>O histórico financeiro de sessões aparecerá aqui.</p>
        </div>
      </SectionCard>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: "12px 24px", borderRadius: 8,
            background: saved ? GREEN : DARK,
            color: saved ? "white" : "#FCFBF8",
            fontSize: 14, fontWeight: 600, border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "background 0.2s",
          }}
        >
          {saved ? "Salvo ✓" : isPending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
