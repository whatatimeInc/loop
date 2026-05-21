type LogoSize = "header" | "md" | "footer" | "hero";

const heights: Record<LogoSize, number> = {
  header: 28,
  md:     36,
  footer: 44,
  hero:   56,
};

interface LogoProps {
  size?: LogoSize;
  /** Usar em fundos escuros — inverte o SVG para branco */
  light?: boolean;
  className?: string;
}

export function Logo({ size = "header", light = false, className = "" }: LogoProps) {
  const h = heights[size];
  // Aspect ratio do SVG original: 788.6 × 199.6 ≈ 3.95 : 1
  const w = Math.round(h * 3.95);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Face.Talk"
      width={w}
      height={h}
      className={className}
      style={{
        height: h,
        width: "auto",
        filter: light ? "invert(1) brightness(10)" : "none",
        display: "block",
      }}
    />
  );
}
