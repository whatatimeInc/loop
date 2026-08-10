"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";

// ── Valores aprovados em protótipo — não mude sem re-testar ──────────────
const DURATION = 900; // ms
const EASING   = "cubic-bezier(0.16, 1, 0.3, 1)";
const OFFSET   = 24;  // px, translateY inicial
export const STAGGER = 80; // ms, entre irmãos — exportado para uso nos delays

type Phase = "idle" | "hidden" | "visible";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * "idle" não aplica nenhum estilo — é o estado do primeiro render (server e
 * client), igual em ambos, sem mismatch de hidratação. Só depois do mount o
 * JS decide esconder e reanimar. Se o JS não rodar, o elemento nunca sai de
 * "idle" e a página aparece inteira, no CSS normal.
 */
function styleFor(phase: Phase, delayMs: number): CSSProperties {
  if (phase === "idle") return {};
  const hidden = phase === "hidden";
  const transition = `opacity ${DURATION}ms ${EASING} ${delayMs}ms, `
    + `transform ${DURATION}ms ${EASING} ${delayMs}ms`;
  return {
    opacity:   hidden ? 0 : 1,
    transform: hidden ? `translateY(${OFFSET}px)` : "translateY(0)",
    transition,
  };
}

/**
 * Hero — anima no load, sem esperar viewport. Retorna a "phase" da
 * sequência; cada elemento calcula seu próprio estilo com `revealStyle`,
 * passando o delay que lhe cabe (headline = 0).
 */
export function useRevealOnLoad(): Phase {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setPhase("hidden");
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("visible"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return phase;
}

/**
 * Demais seções — anima uma vez ao entrar na viewport. Recebe o ref da
 * própria seção (para quem já tem um, como CategoriesSection, que o reusa
 * para o hover da miniatura) e devolve a "phase" para `revealStyle`.
 * unobserve() dispara assim que a animação é acionada.
 */
export function useRevealOnView(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.15,
): Phase {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    setPhase("hidden");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  return phase;
}

export function revealStyle(phase: Phase, delayMs = 0): CSSProperties {
  return styleFor(phase, delayMs);
}
