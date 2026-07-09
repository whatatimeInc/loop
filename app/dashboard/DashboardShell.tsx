"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from "react";

export type DashboardMode = "mentor" | "guest";

export interface DashboardProfile {
  id: string;
  name: string | null;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
  is_mentor: boolean;
  hourly_price: number | null;
  whatsapp: string | null;
  headline: string | null;
  pix_key: string | null;
  onboarding_completed: boolean;
}

interface DashboardCtx {
  mode: DashboardMode;
  setMode: (m: DashboardMode) => void;
  profile: DashboardProfile;
  setProfile: Dispatch<SetStateAction<DashboardProfile>>;
}

const Ctx = createContext<DashboardCtx | null>(null);

export function useDashboard(): DashboardCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardShell");
  return ctx;
}

export function DashboardShell({
  profile: initialProfile,
  children,
}: {
  profile: DashboardProfile;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<DashboardProfile>(initialProfile);
  const [mode, setModeState] = useState<DashboardMode>(
    initialProfile.is_mentor ? "mentor" : "guest"
  );

  useEffect(() => {
    if (!initialProfile.is_mentor) return;
    const saved = localStorage.getItem("dashboard_mode");
    if (saved === "mentor") {
      setModeState("mentor");
    }
    // If saved is "guest", mentor always opens in mentor mode by default
  }, [initialProfile.is_mentor]);

  function setMode(m: DashboardMode) {
    setModeState(m);
    localStorage.setItem("dashboard_mode", m);
  }

  return (
    <Ctx.Provider value={{ mode, setMode, profile, setProfile }}>
      {children}
    </Ctx.Provider>
  );
}
