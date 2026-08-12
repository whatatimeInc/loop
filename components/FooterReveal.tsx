"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Footer } from "@/components/Footer";
import { useRevealOnView, revealStyle } from "@/components/home/useReveal";
import type { LaunchPhase } from "@/lib/launch";

/**
 * O Footer é compartilhado por todas as rotas (renderizado no layout). A
 * animação de entrada é só da home nova — nas demais rotas o ref nunca é
 * anexado, o observer nunca dispara, e o wrapper fica sem nenhum estilo:
 * um <div> inerte em volta do <footer>, sem efeito algum.
 */
const HOME_ROUTE = "/";

export function FooterReveal({ phase }: { phase: LaunchPhase }) {
  const pathname = usePathname();
  const isHome = pathname === HOME_ROUTE;
  const ref = useRef<HTMLDivElement>(null);
  const revealPhase = useRevealOnView(ref);

  return (
    <div ref={isHome ? ref : undefined} style={isHome ? revealStyle(revealPhase) : undefined}>
      <Footer phase={phase} />
    </div>
  );
}
