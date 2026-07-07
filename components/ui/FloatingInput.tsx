"use client";

import { useState } from "react";
import { tokens } from "./tokens";

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  valid?: boolean;
  autoComplete?: string;
  borderColor?: string;
}

export function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  valid,
  autoComplete,
  borderColor,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  const id = `fi-${label}`;

  return (
    <div
      style={{
        position: "relative", height: 48,
        background: tokens.bg, borderRadius: 8,
        outline: `1px solid ${borderColor ?? (focused ? tokens.dark : tokens.borderSubtle)}`,
        boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
        overflow: "hidden", cursor: "text",
      }}
      onClick={() => document.getElementById(id)?.focus()}
    >
      <label
        htmlFor={id}
        style={{
          position: "absolute", left: 14,
          top: lifted ? 8 : "50%",
          transform: lifted ? "none" : "translateY(-50%)",
          fontSize: lifted ? 10 : 14,
          lineHeight: lifted ? "12px" : "20px",
          color: tokens.muted,
          transition: "all 0.15s ease",
          pointerEvents: "none", userSelect: "none", fontFamily: "inherit",
        }}
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        style={{
          position: "absolute", inset: 0,
          paddingTop: lifted ? 20 : 0,
          paddingLeft: 14,
          paddingRight: valid ? 36 : 14,
          width: "100%", height: "100%",
          background: "transparent", border: "none", outline: "none",
          fontSize: 14, color: tokens.dark,
          fontFamily: "inherit", boxSizing: "border-box",
        }}
      />

      {valid && (
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M1 5.5l4.5 4.5L15 1" stroke={tokens.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
