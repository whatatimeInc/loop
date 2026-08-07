"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { tokens } from "@/components/ui/tokens";

// ─── Variant types ────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "brand-primary"
  | "brand-secondary"
  | "neutral-primary"
  | "neutral-secondary";

export type ButtonLayout = "text" | "icon-text" | "icon-only";

// Legacy aliases (backward compat — mapped internally)
type LegacyVariant = "primary" | "secondary" | "ghost" | "outline";
type LegacySize    = "sm" | "md" | "lg";
type AnyVariant    = ButtonVariant | LegacyVariant;

// ─── Arrow SVG autoral (fill=currentColor) ────────────────────────────────────

export function ArrowIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 53.2 53.2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M52.8,25.3h-.5c-2.2,0-4.2-.3-6.3-.9-4.1-1.2-7.8-3.7-10.8-7.5-3-3.9-5-8.3-5.8-13.2v-.5c0,0-2.6.4-2.6.4v.5c1.1,5.9,3.7,11.4,7.7,15.9l1.7,1.7c1.5,1.4,3.2,2.6,5,3.6H1.2s0,2.6,0,2.6h39.9c-.7.4-1.4.8-2,1.2-1.4.9-2.7,2-4,3.3-4.4,4.6-7.3,10.4-8.3,16.7v.5c0,0,2.5.4,2.5.4v-.5c1-5.4,3.4-10.3,6.9-14.4,1-1.2,2.2-2.2,3.6-3.3,3.5-2.6,7.7-3.9,12.5-3.9h.5s0-2.6,0-2.6Z"
      />
    </svg>
  );
}

// ─── Variant config ───────────────────────────────────────────────────────────

interface VariantConfig {
  bg: string;
  color: string;
  border: string;
  /** brand-primary only: direct bg swap on hover */
  bgHover?: string;
  /** other variants: overlay at 10% opacity on hover, 15% on pressed */
  overlayColor?: string;
}

const VARIANT: Record<ButtonVariant, VariantConfig> = {
  "brand-primary":    { bg: tokens.lime,   color: tokens.dark, border: tokens.dark, bgHover: tokens.limeLight },
  "brand-secondary":  { bg: "transparent", color: tokens.lime, border: tokens.lime, overlayColor: tokens.lime },
  "neutral-primary":  { bg: tokens.dark,   color: "#FFFFFF",   border: "#FFFFFF",   overlayColor: "#FFFFFF"   },
  "neutral-secondary":{ bg: tokens.beige,  color: tokens.dark, border: tokens.dark, overlayColor: tokens.dark },
};

const LEGACY_MAP: Record<LegacyVariant, ButtonVariant> = {
  primary:   "brand-primary",
  secondary: "brand-secondary",
  outline:   "neutral-secondary",
  ghost:     "brand-secondary",
};

function resolveVariant(v: AnyVariant): ButtonVariant {
  return v in LEGACY_MAP ? LEGACY_MAP[v as LegacyVariant] : (v as ButtonVariant);
}

// ─── Style builders ───────────────────────────────────────────────────────────

function baseStyle(
  cfg: VariantConfig,
  layout: ButtonLayout,
  hovered: boolean,
  disabled: boolean,
): React.CSSProperties {
  const isIconOnly = layout === "icon-only";
  const bg = cfg.bgHover && hovered && !disabled ? cfg.bgHover : cfg.bg;

  return {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: layout !== "text" ? 24 : undefined,
    height: 56,
    ...(isIconOnly ? { width: 56 } : { paddingLeft: 40, paddingRight: 40 }),
    borderRadius: 99,
    border: `1px solid ${cfg.border}`,
    background: bg,
    color: cfg.color,
    fontFamily: "Host Grotesk, sans-serif",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: "24px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "background 0.15s ease, opacity 0.15s ease",
    whiteSpace: "nowrap",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    textDecoration: "none",
    boxSizing: "border-box",
    minWidth: 0,
  };
}

function overlayStyle(
  cfg: VariantConfig,
  hovered: boolean,
  pressed: boolean,
  disabled: boolean,
): React.CSSProperties {
  const opacity =
    cfg.overlayColor && !disabled
      ? pressed ? 0.15 : hovered ? 0.10 : 0
      : 0;

  return {
    position: "absolute",
    inset: 0,
    borderRadius: 99,
    background: cfg.overlayColor ?? "transparent",
    opacity,
    transition: "opacity 0.15s ease",
    pointerEvents: "none",
  };
}

// ─── Shared hooks ─────────────────────────────────────────────────────────────

function useHoverPress() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return {
    hovered,
    pressed,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => { setHovered(false); setPressed(false); },
      onMouseDown:  () => setPressed(true),
      onMouseUp:    () => setPressed(false),
      onTouchStart: () => setPressed(true),
      onTouchEnd:   () => setPressed(false),
    },
  };
}

// ─── Button ───────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: AnyVariant;
  layout?: ButtonLayout;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  /** @deprecated — ignored in new system, kept for backward compat */
  size?: LegacySize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "brand-primary", layout = "text", icon, children, className, disabled = false, size: _size, ...rest },
  ref,
) {
  const { hovered, pressed, handlers } = useHoverPress();
  const cfg = VARIANT[resolveVariant(variant)];

  return (
    <button
      ref={ref}
      {...rest}
      {...handlers}
      disabled={!!disabled}
      style={baseStyle(cfg, layout, hovered, !!disabled)}
      className={className}
    >
      <span style={overlayStyle(cfg, hovered, pressed, !!disabled)} aria-hidden="true" />
      {layout !== "icon-only" && children}
      {layout !== "text" && icon}
    </button>
  );
});

// ─── LinkButton ───────────────────────────────────────────────────────────────

export interface LinkButtonProps {
  href: string;
  variant?: AnyVariant;
  layout?: ButtonLayout;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** @deprecated — ignored in new system, kept for backward compat */
  size?: LegacySize;
}

export function LinkButton({
  href,
  variant = "brand-primary",
  layout = "text",
  icon,
  children,
  className,
  disabled = false,
  size: _size,
}: LinkButtonProps) {
  const { hovered, pressed, handlers } = useHoverPress();
  const cfg = VARIANT[resolveVariant(variant)];

  return (
    <Link
      href={href}
      {...handlers}
      style={baseStyle(cfg, layout, hovered, disabled)}
      className={className}
      aria-disabled={disabled || undefined}
    >
      <span style={overlayStyle(cfg, hovered, pressed, disabled)} aria-hidden="true" />
      {layout !== "icon-only" && children}
      {layout !== "text" && icon}
    </Link>
  );
}
