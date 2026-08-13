"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";
import type { LaunchPhase } from "@/lib/launch";

interface WaitlistModalContextValue {
  open: () => void;
}

const WaitlistModalContext = createContext<WaitlistModalContextValue | null>(null);

/**
 * Um modal só, aberto de qualquer lugar da árvore (Header, Hero, banner,
 * footer) via useWaitlistModal(). Existe porque esses pontos não têm
 * parentesco direto entre si -- prop-drilling um onCTA não alcançaria todos.
 */
export function WaitlistModalProvider({
  phase,
  children,
}: {
  phase: LaunchPhase;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <WaitlistModalContext.Provider value={{ open: openModal }}>
      {children}
      <WaitlistModal open={open} onClose={closeModal} phase={phase} />
    </WaitlistModalContext.Provider>
  );
}

export function useWaitlistModal(): WaitlistModalContextValue {
  const ctx = useContext(WaitlistModalContext);
  if (!ctx) {
    throw new Error("useWaitlistModal must be used within WaitlistModalProvider");
  }
  return ctx;
}
