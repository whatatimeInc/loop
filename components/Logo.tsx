type LogoSize = "header" | "md" | "footer" | "hero";

const heights: Record<LogoSize, number> = {
  header: 28,
  md:     36,
  footer: 44,
  hero:   56,
};

interface LogoProps {
  size?: LogoSize;
  /** Fundos escuros — inverte para branco */
  light?: boolean;
  /** Versão lime (#CEFD58) para sidebars escuros */
  lime?: boolean;
  className?: string;
}

export function Logo({ size = "header", light = false, lime = false, className = "" }: LogoProps) {
  const h = heights[size];

  let filter = "none";
  if (lime) {
    // black SVG → lime #CEFD58
    filter = "brightness(0) saturate(100%) invert(95%) sepia(40%) saturate(800%) hue-rotate(30deg) brightness(108%)";
  } else if (light) {
    filter = "invert(1) brightness(10)";
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Face.Talk"
      height={h}
      className={className}
      style={{
        height: h,
        width: "auto",
        filter,
        display: "block",
      }}
    />
  );
}
