"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { tokens } from "@/components/ui/tokens";

const DAYS = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

function makeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}
const SLOTS = makeSlots();

type AvailMap = Record<string, Set<string>>;

function jsonToMap(json: unknown): AvailMap {
  const map: AvailMap = {};
  if (json && typeof json === "object" && !Array.isArray(json)) {
    for (const [day, slots] of Object.entries(json as Record<string, unknown>)) {
      if (Array.isArray(slots)) {
        map[day] = new Set(slots as string[]);
      }
    }
  }
  return map;
}

function mapToJson(map: AvailMap): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [day, slots] of Object.entries(map)) {
    if (slots.size > 0) {
      out[day] = SLOTS.filter((s) => slots.has(s));
    }
  }
  return out;
}

export default function DisponibilidadePage() {
  const [avail, setAvail] = useState<AvailMap>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ day: string; toggling: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("availability_json")
        .eq("id", user.id)
        .single();

      setAvail(jsonToMap(data?.availability_json));
      setLoading(false);
    }
    load();
  }, []);

  function toggle(day: string, slot: string, force?: boolean) {
    setAvail((prev) => {
      const next = { ...prev };
      const set = new Set(next[day] ?? []);
      const shouldAdd = force !== undefined ? force : !set.has(slot);
      if (shouldAdd) {
        set.add(slot);
      } else {
        set.delete(slot);
      }
      next[day] = set;
      return next;
    });
    setSaved(false);
  }

  function toggleDay(day: string) {
    const allOn = SLOTS.every((s) => avail[day]?.has(s));
    setAvail((prev) => {
      const next = { ...prev };
      next[day] = allOn ? new Set() : new Set(SLOTS);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({ availability_json: mapToJson(avail) })
      .eq("id", userId);

    setSaving(false);
    if (err) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setSaved(true);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--color-gray-600)", fontSize: 14 }}>Carregando…</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-gray-900)", margin: "0 0 8px" }}>
          Disponibilidade
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-gray-600)", margin: 0 }}>
          Selecione os horários disponíveis por dia. Clique para marcar ou arraste para selecionar vários.
        </p>
      </div>

      <div
        style={{ overflowX: "auto", marginBottom: 24 }}
        onMouseLeave={() => setDragging(null)}
      >
        <table
          style={{
            borderCollapse: "collapse",
            minWidth: 600,
            userSelect: "none",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 60, paddingRight: 12 }} />
              {DAYS.map(({ key, label }) => {
                const allOn = SLOTS.every((s) => avail[key]?.has(s));
                const someOn = SLOTS.some((s) => avail[key]?.has(s));
                return (
                  <th
                    key={key}
                    style={{
                      padding: "0 4px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-gray-900)",
                      textAlign: "center",
                      cursor: "pointer",
                      minWidth: 60,
                    }}
                    onClick={() => toggleDay(key)}
                    title={allOn ? "Desmarcar todos" : "Marcar todos"}
                  >
                    <div>{label.slice(0, 3)}</div>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: allOn ? tokens.lime : someOn ? "color-mix(in srgb, var(--color-lime) 40%, transparent)" : "#E4E2D9",
                        margin: "4px auto 0",
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, si) => (
              <tr key={slot}>
                <td
                  style={{
                    fontSize: 11,
                    color: "var(--color-gray-600)",
                    paddingRight: 12,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                    paddingBottom: 2,
                    opacity: slot.endsWith(":00") ? 1 : 0.4,
                  }}
                >
                  {slot.endsWith(":00") ? slot : ""}
                </td>
                {DAYS.map(({ key }) => {
                  const active = avail[key]?.has(slot) ?? false;
                  return (
                    <td
                      key={key}
                      style={{
                        padding: "1px 4px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 16,
                          borderRadius: 4,
                          background: active ? tokens.lime : "var(--color-gray-100)",
                          border: `1px solid ${active ? "#CBCB50" : "#E4E2D9"}`,
                          cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onMouseDown={() => {
                          setDragging({ day: key, toggling: !active });
                          toggle(key, slot, !active);
                        }}
                        onMouseEnter={() => {
                          if (dragging) {
                            toggle(key, slot, dragging.toggling);
                          }
                        }}
                        onMouseUp={() => setDragging(null)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "#c0392b", marginBottom: 12 }}>{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "12px 28px",
          borderRadius: 8,
          border: "none",
          background: saving ? "#E4E2D9" : tokens.lime,
          color: "var(--color-gray-900)",
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {saving ? "Salvando…" : saved ? "Salvo ✓" : "Salvar disponibilidade"}
      </button>
    </div>
  );
}
