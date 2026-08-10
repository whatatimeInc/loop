"use client";

import { usePathname } from "next/navigation";

/**
 * Marca o canvas da rota. NÃO escolhe cor — só põe o atributo; quem resolve os
 * valores é o CSS, em [data-canvas="dark"] / [data-canvas="light"] no
 * globals.css. Assim header, main e footer compartilham uma superfície só, e o
 * footer para de sentar no fundo do body.
 *
 * usePathname funciona no SSR do App Router, então o atributo já vem no HTML
 * inicial — sem flash de cor na navegação.
 */

/** Rotas com canvas escuro. Igualdade exata: startsWith("/") pegaria tudo. */
const DARK_ROUTES = new Set<string>([
  "/", // home nova
]);

export function SiteCanvas({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const canvas = DARK_ROUTES.has(pathname) ? "dark" : "light";

  return (
    <div
      data-canvas={canvas}
      style={{
        background: "var(--color-surface-canvas)",
        minHeight: "100dvh",
      }}
    >
      {children}
    </div>
  );
}
