"use client";

import { tokens } from "./tokens";

interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div style={{ display: "flex", gap: 8, maxWidth: 480, margin: "0 auto", width: "100%" }}>
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div
            key={label}
            style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}
          >
            <div style={{
              width: "100%", height: 4, borderRadius: 999,
              background: done ? tokens.lime : active ? tokens.dark : tokens.borderSubtle,
              transition: "background 0.3s",
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              color: active ? tokens.dark : done ? tokens.muted : tokens.faint,
              transition: "all 0.2s",
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
