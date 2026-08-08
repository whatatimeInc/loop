"use client";

import { tokens } from "@/components/ui/tokens";

const HOST_GROTESK = "Host Grotesk, var(--font-host-grotesk), sans-serif";
const INTER        = "Inter, var(--font-inter), sans-serif";

/**
 * The repeating home-section header: "(0n)" hanging to the left of a column
 * holding the title and the subtitle, so both share one left edge regardless
 * of how wide the number renders.
 *
 * `children` land inside that same text column — use it for a CTA that should
 * line up with the title rather than with the number.
 */
export function SectionHeader({
  number,
  title,
  subtitle,
  isMobile,
  children,
}: {
  number:    string;
  title:     string;
  subtitle?: string;
  isMobile:  boolean;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span
        style={{
          color:      tokens.lime,
          fontFamily: HOST_GROTESK,
          fontSize:   24,
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {number}
      </span>

      <div
        style={{
          display:       "flex",
          flexDirection: "column",
          alignItems:    "flex-start",
          gap:           isMobile ? 20 : 28,
          minWidth:      0,
          flex:          1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span
            style={{
              color:      tokens.lime,
              fontFamily: HOST_GROTESK,
              fontSize:   20,
              fontWeight: 500,
              lineHeight: 1.25,
            }}
          >
            {title}
          </span>
          {subtitle && (
            <p
              style={{
                color:      tokens.lime,
                fontFamily: INTER,
                fontSize:   14,
                fontWeight: 400,
                lineHeight: 1.45,
                margin:     0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
