"use client";

import { useState } from "react";
import { tokens } from "./tokens";

interface SelectCardProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectCard({ icon, label, selected, onClick }: SelectCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 24,
        padding: 24, borderRadius: 4, width: "100%",
        border: "none",
        background: selected ? tokens.lime : hovered ? tokens.limeHover : tokens.card,
        color: tokens.dark, textAlign: "left",
        cursor: "pointer", fontFamily: "inherit",
        transition: "background 0.15s",
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 400, lineHeight: "18px" }}>{label}</span>
    </button>
  );
}
