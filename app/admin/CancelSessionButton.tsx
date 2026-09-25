"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tokens } from "@/components/ui/tokens";

const MESSAGES: Record<number, string> = {
  401: "Sua sessão expirou. Entre de novo.",
  404: "Sessão não encontrada.",
  409: "Esta sessão já não está agendada.",
};

export function CancelSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the server answered for good: the control stays locked until the
  // refreshed row replaces it, so a second POST cannot be sent meanwhile.
  const [settled, setSettled] = useState(false);

  async function cancel() {
    // The ref is set synchronously: a second click before the re-render cannot post again.
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/sessions/${sessionId}/cancel`, { method: "POST" });
      if (r.ok || r.status === 404 || r.status === 409) {
        // 404/409: the row is gone or no longer scheduled; the refreshed list
        // shows what it is now.
        if (!r.ok) setError(MESSAGES[r.status]);
        setSettled(true);
        router.refresh();
        return;
      }
      setError(MESSAGES[r.status] ?? "Não foi possível cancelar agora. Tente de novo.");
    } catch {
      setError("Sem conexão. Tente de novo.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const button: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: busy ? "default" : "pointer" };

  if (settled) {
    return <span role="status" style={{ fontSize: 13, color: error ? tokens.red : tokens.muted }}>{error ?? "Cancelada."}</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} style={{ ...button, background: "transparent", color: tokens.red, border: `1px solid ${tokens.red}` }}>
          Cancelar
        </button>
      ) : (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: tokens.dark }}>Cancelar esta sessão?</span>
          <button disabled={busy} onClick={cancel} style={{ ...button, background: tokens.red, color: "#fff", border: "none", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Cancelando…" : "Confirmar"}
          </button>
          <button disabled={busy} onClick={() => { setConfirming(false); setError(null); }} style={{ ...button, background: "transparent", color: tokens.dark, border: `1px solid ${tokens.border}` }}>
            Voltar
          </button>
        </div>
      )}
      {error && <span role="alert" style={{ fontSize: 12, color: tokens.red }}>{error}</span>}
    </div>
  );
}
