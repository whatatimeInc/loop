"use client";

import { useState } from "react";

function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ShareButton({
  slug,
  name,
  variant = "icon",
}: {
  slug: string;
  name: string;
  /** "icon" = circular button (mobile bar / col 1), "text" = link row (booking panel) */
  variant?: "icon" | "text";
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleShare}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer",
          color: copied ? "#5FAD8E" : "#181D27",
          fontSize: 14, fontWeight: 400, lineHeight: "20px",
          fontFamily: "inherit", padding: 0,
          transition: "color 0.15s",
        }}
      >
        {copied ? <CheckIcon size={20} /> : <ShareIcon size={20} />}
        {copied ? "Link copiado!" : `loop.talk/${slug}`}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      title={copied ? "Link copiado!" : "Compartilhar perfil"}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "1px solid #DAD9D5",
        background: copied ? "#EAEA68" : "#FCFBF8",
        color: "#272618",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
        transition: "background 0.15s",
      }}
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
    </button>
  );
}
