type LogoSize = "header" | "md" | "footer" | "hero";

const heights: Record<LogoSize, number> = {
  header: 28,
  md:     36,
  footer: 44,
  hero:   56,
};

interface LogoProps {
  size?: LogoSize;
  /** Fundos escuros — branco puro #ffffff */
  white?: boolean;
  /** Fundos escuros — off-white quente #FCFBF8 */
  light?: boolean;
  /** Versão amarela (#EAEA68) para fundos escuros */
  lime?: boolean;
  className?: string;
}

export function Logo({ size = "header", white = false, light = false, lime = false, className = "" }: LogoProps) {
  const h = heights[size];

  let filter = "none";
  if (lime) {
    // black SVG → brand yellow #EAEA68
    filter = "brightness(0) saturate(100%) invert(96%) sepia(55%) saturate(400%) hue-rotate(5deg) brightness(103%)";
  } else if (white) {
    // black SVG → pure white #ffffff (brightness(0) first forces black, invert(1) forces white)
    filter = "brightness(0) invert(1)";
  } else if (light) {
    // black SVG → warm off-white #FCFBF8
    filter = "invert(1) brightness(0.99) sepia(2%)";
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Loop.Talk"
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
