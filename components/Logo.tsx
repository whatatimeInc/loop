type LogoSize = "header" | "md" | "footer" | "hero";

const textSizes: Record<LogoSize, string> = {
  header: "text-2xl",
  md:     "text-3xl",
  footer: "text-4xl",
  hero:   "text-5xl",
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

export function Logo({ size = "header", className = "" }: LogoProps) {
  return (
    <span
      className={`${textSizes[size]} ${className}`}
      style={{ fontFamily: "var(--font-permanent-marker), cursive" }}
      aria-label="Face.Talk"
    >
      Face.Talk
    </span>
  );
}
