"use client";

import { useState } from "react";

type Props = {
  referralUrl: string;
  referralCode: string;
  referralCount: number;
};

export function ReferralSection({ referralUrl }: Props) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(referralUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Link display + copy */}
      <div
        className="flex items-center gap-2 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.6)",
          borderRadius: 8,
          padding: "10px 12px",
        }}
      >
        <span
          className="flex-1 truncate text-sm"
          style={{ color: "#514F41", fontFamily: "monospace" }}
        >
          {referralUrl}
        </span>
        <button
          onClick={copy}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            background: copied ? "#272518" : "#EAEA68",
            color: copied ? "#FCFBF8" : "#272518",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.18s",
          }}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Entrei na lista do Loop.Talk! Entra você também: ${referralUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 7,
            background: "#25D366",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          WhatsApp
        </a>
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Entrei na lista do Loop.Talk! ${referralUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 7,
            background: "#000",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          X / Twitter
        </a>
      </div>
    </div>
  );
}
