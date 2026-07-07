"use client";

import { useState } from "react";
import { tokens } from "./tokens";

interface FloatingTextareaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export function FloatingTextarea({ label, value, onChange, rows = 5 }: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  const id = `fta-${label}`;

  return (
    <div
      style={{
        position: "relative",
        background: tokens.bg, borderRadius: 8,
        outline: `1px solid ${focused ? tokens.dark : tokens.borderSubtle}`,
        boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
        cursor: "text",
      }}
      onClick={() => document.getElementById(id)?.focus()}
    >
      <label
        htmlFor={id}
        style={{
          position: "absolute", left: 14, top: 12,
          fontSize: lifted ? 10 : 14,
          lineHeight: lifted ? "12px" : "20px",
          color: tokens.muted,
          transition: "all 0.15s ease",
          pointerEvents: "none", userSelect: "none", fontFamily: "inherit",
        }}
      >
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        style={{
          display: "block", width: "100%",
          paddingTop: lifted ? 28 : 14,
          paddingLeft: 14, paddingRight: 14, paddingBottom: 14,
          background: "transparent", border: "none", outline: "none",
          fontSize: 14, color: tokens.dark, resize: "none",
          fontFamily: "inherit", boxSizing: "border-box",
          transition: "padding-top 0.15s ease",
        }}
      />
    </div>
  );
}
