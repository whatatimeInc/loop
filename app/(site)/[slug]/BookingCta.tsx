"use client";

import { useState } from "react";
import Link from "next/link";
import type { Duration, Offer } from "@/lib/creators";
import { tokens } from "@/components/ui/tokens";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

/** Middle offer when the count is odd; the first of the two middles otherwise. */
function defaultDuration(offers: Offer[]): Duration | null {
  if (offers.length === 0) return null;
  return offers[Math.floor((offers.length - 1) / 2)].durationMinutes;
}

/**
 * Duration tiles + booking CTA for one creator.
 *
 * `variant="card"` is the tile row + solid CTA of the desktop booking card;
 * `variant="bar"` is the single lime button of the mobile fixed bottom bar.
 * Both share the selected-duration state so the link always carries it.
 * Renders nothing when the creator has no offers — the page owns that copy.
 */
export function BookingCta({
  slug,
  offers,
  variant,
}: {
  slug: string;
  offers: Offer[];
  variant: "card" | "bar";
}) {
  const [selected, setSelected] = useState<Duration | null>(() => defaultDuration(offers));

  if (selected === null) return null;

  const href = `/agendar/${slug}?duracao=${selected}`;

  if (variant === "bar") {
    return (
      <Link
        href={href}
        aria-label="Agendar Loop.Talk"
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          height: 56, background: tokens.lime, borderRadius: 8,
          fontSize: 16, fontWeight: 600, fontFamily: "inherit",
          color: "#272618", textDecoration: "none",
        }}
      >
        Agendar Loop.Talk
      </Link>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {offers.map((offer) => {
          const active = offer.durationMinutes === selected;
          return (
            <button
              key={offer.id ?? offer.durationMinutes}
              type="button"
              onClick={() => setSelected(offer.durationMinutes)}
              aria-pressed={active}
              style={{
                flex: 1, height: 72, borderRadius: 4, border: "none", padding: 0,
                background: active ? tokens.lime : "#FFFFFF",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 4,
                fontFamily: "inherit", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 400, color: "#272618", lineHeight: "24px" }}>
                {offer.durationMinutes} min
              </span>
              <span style={{ fontSize: 12, fontWeight: 400, color: "#807F71", lineHeight: "16px" }}>
                R$ {formatPrice(offer.priceCents)}
              </span>
            </button>
          );
        })}
      </div>

      <Link
        href={href}
        aria-label="Agendar Loop.Talk"
        style={{
          width: "100%", boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px 20px", borderRadius: 8, background: "#272618",
          fontSize: 16, fontWeight: 600, fontFamily: "inherit",
          color: "#FCFBF8", textDecoration: "none",
        }}
      >
        Agendar Loop.Talk
      </Link>
    </div>
  );
}
