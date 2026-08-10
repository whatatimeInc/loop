"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { tokens } from "@/components/ui/tokens";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { Stepper } from "@/components/ui/Stepper";
import { SelectCard } from "@/components/ui/SelectCard";
import { WizardFooter } from "@/components/ui/WizardFooter";
import { FolderFrame } from "@/components/ui/FolderFrame";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProfileArea =
  | "career_business"
  | "lifestyle_fashion"
  | "health_wellness"
  | "technology"
  | "creativity"
  | "gastronomy";

type Platform = "instagram" | "linkedin" | "twitter" | "youtube" | "tiktok" | "website";
type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface SocialLink {
  id: string;
  platform: Platform;
  url: string;
}

interface AvailBlock {
  id: string;
  startTime: string;
  endTime: string;
  days: number[];
}

interface WizardState {
  firstName: string;
  lastName: string;
  slug: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  headline: string;
  bio: string;
  socialLinks: SocialLink[];
  area: ProfileArea | null;
  googleCalendar: boolean;
  availBlocks: AvailBlock[];
}

const INITIAL: WizardState = {
  firstName: "",
  lastName: "",
  slug: "",
  avatarFile: null,
  avatarPreview: null,
  headline: "",
  bio: "",
  socialLinks: [],
  area: null,
  googleCalendar: false,
  availBlocks: [],
};

// ─── Local token aliases (lê do DS) ────────────────────────────────────────────

const BG     = tokens.bg;
const CARD   = tokens.card;
const BORDER = tokens.border;
const DARK   = tokens.dark;
const LIME   = tokens.lime;
const MUTED  = tokens.muted;
const FAINT  = tokens.faint;
const BEIGE  = tokens.beige;
const RED    = tokens.red;
const GREEN  = tokens.green;

// ─── Utils ─────────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Icons ─────────────────────────────────────────────────────────────────────

function IcoCheck({ color = GREEN }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IcoX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}


function IcoArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IcoArrowLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function IcoChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IcoPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IcoTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

// FolderFrame, FloatingInput, FloatingTextarea → importados de @/components/ui

// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={value}
      style={{
        position: "relative", flexShrink: 0,
        width: 44, height: 26, borderRadius: 13,
        background: value ? LIME : "var(--color-gray-200)",
        border: "none", cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: 3,
        width: 20, height: 20, borderRadius: "50%",
        background: DARK, transition: "transform 0.2s",
        transform: value ? "translateX(18px)" : "translateX(0)",
      }} />
    </button>
  );
}

// Stepper → importado de @/components/ui
const STEPS = ["Perfil", "Sobre", "Área", "Agenda"];

// ─── Platform icons & data ─────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "twitter",   label: "X / Twitter" },
  { value: "youtube",   label: "YouTube" },
  { value: "tiktok",    label: "TikTok" },
  { value: "website",   label: "Website" },
];

function PlatformIcon({ p }: { p: Platform }) {
  if (p === "instagram") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
  if (p === "linkedin") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
  if (p === "twitter") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
  if (p === "youtube") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <polygon points="10,9 15,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
  if (p === "tiktok") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77-.39 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0 0 12.68 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─── SocialLinkRow ─────────────────────────────────────────────────────────────

function SocialLinkRow({
  link, onChange, onRemove,
}: {
  link: SocialLink;
  onChange: (l: SocialLink) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{
        display: "flex", alignItems: "stretch", flex: 1,
        border: `1.5px solid ${BORDER}`, borderRadius: 8,
        overflow: "hidden", background: CARD,
      }}>
        {/* Platform selector — icon left, chevron right */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* Icon left */}
          <span style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
            color: DARK, display: "flex", alignItems: "center",
          }}>
            <PlatformIcon p={link.platform} />
          </span>

          <select
            value={link.platform}
            onChange={(e) => onChange({ ...link, platform: e.target.value as Platform })}
            style={{
              appearance: "none",
              padding: "11px 32px 11px 34px",
              border: "none", borderRight: `1.5px solid ${BORDER}`,
              background: BEIGE, fontSize: 13, color: DARK,
              cursor: "pointer", fontFamily: "inherit", outline: "none",
              height: "100%",
            }}
          >
            {PLATFORMS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Chevron right */}
          <span style={{
            position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none", color: MUTED,
            display: "flex", alignItems: "center",
          }}>
            <IcoChevron />
          </span>
        </div>

        {/* URL */}
        <input
          type="url"
          value={link.url}
          onChange={(e) => onChange({ ...link, url: e.target.value })}
          placeholder="https://..."
          style={{
            flex: 1, padding: "10px 12px",
            border: "none", background: "transparent",
            fontSize: 13, color: DARK,
            outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          border: `1.5px solid ${BORDER}`, background: CARD,
          color: MUTED, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <IcoTrash />
      </button>
    </div>
  );
}

// ─── Area icons (design-system SVGs) ───────────────────────────────────────────

function AreaIconCarreira() {
  return (
    <svg width="20" height="20" viewBox="0 0 50.1 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="car-cp0"><polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1"/></clipPath>
        <clipPath id="car-cp1"><polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1"/></clipPath>
        <clipPath id="car-cp2"><polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1"/></clipPath>
      </defs>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#car-cp0)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M29.5,16.9L1.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/>
        </g>
        <polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#car-cp1)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M11.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M39.5,16.9L11.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/>
        </g>
        <polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#car-cp2)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M21.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M49.5,16.9L21.2.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/>
        </g>
        <polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
    </svg>
  );
}

function AreaIconModa() {
  return (
    <svg width="20" height="20" viewBox="0 0 48.9 48.5" fill="var(--color-gray-900)" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.7,2.8l21.4,21.4-21.4,21.4L3.3,24.2,24.7,2.8M24.7,0L.5,24.2l24.2,24.2,24.2-24.2L24.7,0h0Z"/>
      <path d="M34.8,14.1v20.2H14.6V14.1h20.2M36.8,12.1H12.6v24.2h24.2V12.1h0Z"/>
      <path d="M24.7,14.9l9.3,9.3-9.3,9.3-9.3-9.3,9.3-9.3M24.7,12.1l-12.1,12.1,12.1,12.1,12.1-12.1-12.1-12.1h0Z"/>
    </svg>
  );
}

function AreaIconSaude() {
  return (
    <svg width="20" height="20" viewBox="0 0 42.8 43.5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="var(--color-gray-900)" strokeWidth="2" strokeMiterlimit="10">
        <line x1="21.3" y1="0" x2="21.3" y2="12"/>
        <line x1="8.6" y1="4.2" x2="15.6" y2="13.9"/>
        <line x1=".7" y1="15.1" x2="12.1" y2="18.8"/>
        <line x1=".7" y1="28.5" x2="12.1" y2="24.8"/>
        <line x1="8.7" y1="39.4" x2="15.7" y2="29.7"/>
        <line x1="21.5" y1="43.5" x2="21.5" y2="31.5"/>
        <line x1="34.2" y1="39.3" x2="27.2" y2="29.6"/>
        <line x1="42.1" y1="28.4" x2="30.7" y2="24.7"/>
        <line x1="42" y1="15" x2="30.6" y2="18.7"/>
        <line x1="34.1" y1="4.2" x2="27.1" y2="13.9"/>
      </g>
    </svg>
  );
}

function AreaIconTecnologia() {
  return (
    <svg width="20" height="20" viewBox="0 0 58.5 51.8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="tec-cp0"><polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5"/></clipPath>
        <clipPath id="tec-cp1"><polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9"/></clipPath>
        <clipPath id="tec-cp2"><polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3"/></clipPath>
      </defs>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#tec-cp0)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,34.5l27.5-16,27.7,16-27.5,16L1.9,34.5M58.5,34.5l-29.1-16.8L.5,34.5l29.1,16.8,28.9-16.8"/>
        </g>
        <polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#tec-cp1)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,25.9l27.5-16,27.7,16-27.5,16L1.9,25.9M58.5,25.9L29.4,9.1.5,25.9l29.1,16.8,28.9-16.8"/>
        </g>
        <polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#tec-cp2)">
          <path stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,17.3L29.4,1.3l27.7,16-27.5,16L1.9,17.3M58.5,17.3L29.4.5.5,17.3l29.1,16.8,28.9-16.8"/>
        </g>
        <polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3" fill="none" stroke="var(--color-gray-900)" strokeWidth=".5" strokeMiterlimit="10"/>
      </g>
    </svg>
  );
}

function AreaIconCriatividade() {
  return (
    <svg width="20" height="20" viewBox="0 0 40.5 40" fill="var(--color-gray-900)" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2.5,29.9,2.5,20,10.5,2,20.5,2M20.5,0C9.4,0,.5,8.9.5,20s9,20,20,20,20-9,20-20S31.5,0,20.5,0h0Z"/>
      <path d="M20.5,18c5.5,0,10,4.5,10,10s-4.5,10-10,10-10-4.5-10-10,4.5-10,10-10M20.5,16c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12-5.4-12-12-12h0Z"/>
      <path d="M20.5,26c3.3,0,6,2.7,6,6s-2.7,6-6,6-6-2.7-6-6,2.7-6,6-6M20.5,24c-4.4,0-8,3.6-8,8s3.6,8,8,8,8-3.6,8-8-3.6-8-8-8h0Z"/>
    </svg>
  );
}

function AreaIconGastronomia() {
  return (
    <svg width="20" height="20" viewBox="0 0 60 40" fill="var(--color-gray-900)" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2,29.9,2,20,10.1,2,20,2M20,0C9,0,0,9,0,20s9,20,20,20,20-9,20-20S31,0,20,0h0Z"/>
      <path d="M40,2c9.9,0,18,8.1,18,18s-8.1,18-18,18-18-8.1-18-18S30.1,2,40,2M40,0c-11,0-20,9-20,20s9,20,20,20,20-9,20-20S51,0,40,0h0Z"/>
    </svg>
  );
}

// ─── Area data ─────────────────────────────────────────────────────────────────

const AREAS: { value: ProfileArea; label: string; icon: React.ReactNode }[] = [
  { value: "career_business",  label: "Carreira e Negócios", icon: <AreaIconCarreira /> },
  { value: "lifestyle_fashion", label: "Moda e Lifestyle",   icon: <AreaIconModa /> },
  { value: "health_wellness",  label: "Saúde e Bem estar",   icon: <AreaIconSaude /> },
  { value: "technology",       label: "Tecnologia",          icon: <AreaIconTecnologia /> },
  { value: "creativity",       label: "Criatividade",        icon: <AreaIconCriatividade /> },
  { value: "gastronomy",       label: "Gastronomia",         icon: <AreaIconGastronomia /> },
];

// ─── DayChips ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function DayChips({ selected, onToggle }: { selected: number[]; onToggle: (d: number) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {DAY_LABELS.map((label, i) => {
        const on = selected.includes(i);
        return (
          <button
            key={label}
            type="button"
            onClick={() => onToggle(i)}
            style={{
              padding: "6px 12px", borderRadius: 6,
              border: `1.5px solid ${on ? LIME : BORDER}`,
              background: on ? LIME : CARD,
              color: DARK, fontSize: 13, fontWeight: on ? 600 : 400,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── AvailBlockRow ─────────────────────────────────────────────────────────────

function AvailBlockRow({
  block, onChange, onRemove, canRemove,
}: {
  block: AvailBlock;
  onChange: (b: AvailBlock) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  function toggleDay(d: number) {
    const days = block.days.includes(d)
      ? block.days.filter(x => x !== d)
      : [...block.days, d].sort((a, b) => a - b);
    onChange({ ...block, days });
  }

  return (
    <div style={{
      background: CARD, borderRadius: 8, padding: 16,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      {/* Time inputs row */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* De */}
        <div style={{
          flex: 1, height: 48, position: "relative",
          background: tokens.bg, borderRadius: 8,
          outline: `1px solid ${tokens.borderSubtle}`,
          boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
        }}>
          <label style={{
            position: "absolute", left: 14, top: 8,
            fontSize: 10, lineHeight: "12px",
            color: MUTED, pointerEvents: "none", fontFamily: "inherit",
          }}>De</label>
          <input
            type="time"
            value={block.startTime}
            onChange={(e) => onChange({ ...block, startTime: e.target.value })}
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              height: 28, padding: "0 14px",
              background: "transparent", border: "none", outline: "none",
              fontSize: 14, color: DARK, fontFamily: "inherit",
              width: "100%", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Até */}
        <div style={{
          flex: 1, height: 48, position: "relative",
          background: tokens.bg, borderRadius: 8,
          outline: `1px solid ${tokens.borderSubtle}`,
          boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
        }}>
          <label style={{
            position: "absolute", left: 14, top: 8,
            fontSize: 10, lineHeight: "12px",
            color: MUTED, pointerEvents: "none", fontFamily: "inherit",
          }}>Até</label>
          <input
            type="time"
            value={block.endTime}
            onChange={(e) => onChange({ ...block, endTime: e.target.value })}
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              height: 28, padding: "0 14px",
              background: "transparent", border: "none", outline: "none",
              fontSize: 14, color: DARK, fontFamily: "inherit",
              width: "100%", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <DayChips selected={block.days} onToggle={toggleDay} />

      {/* Trash — bottom-right */}
      {canRemove && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onRemove}
            style={{
              width: 32, height: 32, borderRadius: 6, flexShrink: 0,
              border: "none", background: "none",
              color: FAINT, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IcoTrash />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 1 — Perfil ───────────────────────────────────────────────────────────

function StepPerfil({
  state, patch, slugStatus, setSlugStatus,
}: {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
  slugStatus: SlugStatus;
  setSlugStatus: (s: SlugStatus) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const checkSlug = useCallback(async (slug: string) => {
    if (slug.length < 2) { setSlugStatus("idle"); return; }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) { setSlugStatus("invalid"); return; }
    setSlugStatus("checking");
    try {
      const sb = createClient();
      const { data, error } = await sb.rpc("check_username_available", { p_username: slug });
      if (error) {
        setSlugStatus("idle"); // RPC não disponível (migration pendente) — deixa passar
      } else {
        setSlugStatus(data ? "available" : "taken");
      }
    } catch { setSlugStatus("idle"); }
  }, [setSlugStatus]);

  function scheduleCheck(slug: string) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => checkSlug(slug), 420);
  }

  function onFirstName(v: string) {
    const s = slugify(`${v} ${state.lastName}`);
    patch({ firstName: v, slug: s });
    scheduleCheck(s);
  }

  function onLastName(v: string) {
    const s = slugify(`${state.firstName} ${v}`);
    patch({ lastName: v, slug: s });
    scheduleCheck(s);
  }

  function onSlug(v: string) {
    const s = v.toLowerCase().replace(/[^a-z0-9-]/g, "");
    patch({ slug: s });
    scheduleCheck(s);
  }

  const slugInfo = {
    idle:      { text: "",                                       color: FAINT },
    checking:  { text: "Verificando...",                         color: FAINT },
    available: { text: `loop.talk/${state.slug} disponível`,    color: GREEN },
    taken:     { text: "Esse endereço já está em uso",           color: RED   },
    invalid:   { text: "Somente letras minúsculas, números e -", color: RED   },
  }[slugStatus];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 24, fontWeight: 400, color: DARK, margin: "0 0 6px" }}>
          Complete seu perfil
        </h2>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Adicione sua foto e seus dados de perfil
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <FolderFrame
          photoUrl={state.avatarPreview}
          firstName={state.firstName}
          lastName={state.lastName}
          onPhotoSelect={(f) => patch({ avatarFile: f, avatarPreview: URL.createObjectURL(f) })}
          width={220}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FloatingInput
          label="Nome"
          value={state.firstName}
          onChange={onFirstName}
          valid={state.firstName.trim().length >= 2}
          autoComplete="given-name"
        />
        <FloatingInput
          label="Sobrenome"
          value={state.lastName}
          onChange={onLastName}
          valid={state.lastName.trim().length >= 2}
          autoComplete="family-name"
        />
      </div>

      {/* Slug field */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: MUTED }}>URL pública</label>
        <div style={{
          display: "flex", alignItems: "center", overflow: "hidden",
          borderRadius: 8,
          border: `1.5px solid ${slugStatus === "available" ? GREEN : slugStatus === "taken" || slugStatus === "invalid" ? RED : BORDER}`,
          transition: "border-color 0.2s",
        }}>
          <span style={{
            padding: "12px 14px", background: BEIGE, color: MUTED,
            fontSize: 13, whiteSpace: "nowrap",
            borderRight: `1.5px solid ${BORDER}`, flexShrink: 0,
          }}>
            loop.talk/
          </span>
          <input
            value={state.slug}
            onChange={(e) => onSlug(e.target.value)}
            placeholder="seu-nome"
            style={{
              flex: 1, padding: "12px 14px",
              border: "none", background: "transparent",
              fontSize: 14, color: DARK,
              outline: "none", fontFamily: "inherit",
            }}
          />
          {slugStatus === "available" && (
            <span style={{ paddingRight: 12 }}><IcoCheck /></span>
          )}
        </div>
        {slugInfo.text && (
          <p style={{ fontSize: 12, color: slugInfo.color, margin: 0 }}>{slugInfo.text}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2 — Sobre ────────────────────────────────────────────────────────────

function StepSobre({ state, patch }: { state: WizardState; patch: (p: Partial<WizardState>) => void }) {
  function addLink() {
    patch({ socialLinks: [...state.socialLinks, { id: uid(), platform: "instagram", url: "" }] });
  }
  function updateLink(id: string, l: SocialLink) {
    patch({ socialLinks: state.socialLinks.map(x => x.id === id ? l : x) });
  }
  function removeLink(id: string) {
    patch({ socialLinks: state.socialLinks.filter(x => x.id !== id) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 24, fontWeight: 400, color: DARK, margin: "0 0 6px" }}>
          Complete seu perfil
        </h2>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Ajude as pessoas a te conhecerem melhor.
        </p>
      </div>

      {/* Descrição */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <FloatingInput
          label="Descrição"
          value={state.headline}
          onChange={(v) => patch({ headline: v.slice(0, 200) })}
          valid={state.headline.length > 0}
        />
        <span style={{ fontSize: 10, color: MUTED, textAlign: "right" }}>{state.headline.length}/200</span>
      </div>

      {/* Sobre */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <FloatingTextarea
          label="Sobre"
          value={state.bio}
          onChange={(v) => patch({ bio: v.slice(0, 1000) })}
          rows={8}
        />
        <span style={{ fontSize: 10, color: MUTED, textAlign: "right" }}>{state.bio.length}/1000</span>
      </div>

      {/* Social links */}
      {state.socialLinks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.socialLinks.map(l => (
            <SocialLinkRow
              key={l.id}
              link={l}
              onChange={(upd) => updateLink(l.id, upd)}
              onRemove={() => removeLink(l.id)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addLink}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "13px 20px", borderRadius: 8,
          border: `1.5px solid ${BORDER}`,
          background: CARD, color: DARK,
          fontSize: 14, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit", width: "100%",
        }}
      >
        <IcoPlus />
        Adicionar Rede Social
      </button>
    </div>
  );
}

// SelectCard → importado de @/components/ui

// ─── Step 3 — Área ─────────────────────────────────────────────────────────────

function StepArea({ state, patch }: { state: WizardState; patch: (p: Partial<WizardState>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 24, fontWeight: 400, color: DARK, margin: "0 0 6px" }}>
          Área
        </h2>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Qual sua principal área de interesse?
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {AREAS.map(({ value, label, icon }) => {
          const on = state.area === value;
          return (
            <SelectCard
              key={value}
              selected={on}
              icon={icon}
              label={label}
              onClick={() => patch({ area: value })}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4 — Agenda ───────────────────────────────────────────────────────────

function StepAgenda({ state, patch }: { state: WizardState; patch: (p: Partial<WizardState>) => void }) {
  function addBlock() {
    patch({
      availBlocks: [
        ...state.availBlocks,
        { id: uid(), startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
      ],
    });
  }
  function updateBlock(id: string, b: AvailBlock) {
    patch({ availBlocks: state.availBlocks.map(x => x.id === id ? b : x) });
  }
  function removeBlock(id: string) {
    patch({ availBlocks: state.availBlocks.filter(x => x.id !== id) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 24, fontWeight: 400, color: DARK, margin: "0 0 6px" }}>
          Quando você está disponível?
        </h2>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Configure os horários e dias em que você atende.
        </p>
      </div>

      {/* Google Calendar — TODO: implementar OAuth quando disponível */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: 10,
        border: `1.5px solid ${BORDER}`, background: CARD,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: BEIGE, border: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: 0 }}>Google Calendar</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Sincronizar com sua agenda pessoal</p>
          </div>
        </div>
        <Toggle value={state.googleCalendar} onChange={() => patch({ googleCalendar: !state.googleCalendar })} />
      </div>

      {/* Adicionar horário — fixed at top so it's always visible on scroll */}
      <button
        type="button"
        onClick={addBlock}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "12px 20px", borderRadius: 8,
          border: `1px solid ${tokens.border}`,
          background: tokens.bg, color: DARK,
          fontSize: 16, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", width: "100%",
          boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
        }}
      >
        <IcoPlus />
        Adicionar horário
      </button>

      {/* Blocos */}
      {state.availBlocks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {state.availBlocks.map(b => (
            <AvailBlockRow
              key={b.id}
              block={b}
              onChange={(upd) => updateBlock(b.id, upd)}
              onRemove={() => removeBlock(b.id)}
              canRemove={state.availBlocks.length > 1}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: FAINT, textAlign: "center", margin: 0 }}>
        A agenda é opcional — você pode configurar depois no painel.
      </p>
    </div>
  );
}

// ─── Sucesso ───────────────────────────────────────────────────────────────────

function StepSucesso({ state }: { state: WizardState }) {
  return (
    <div style={{
      maxWidth: 400, margin: "0 auto", width: "100%",
      background: CARD, borderRadius: 12,
      outline: `1px solid ${BORDER}`, outlineOffset: -1,
      padding: 24, display: "flex", flexDirection: "column", gap: 24,
    }}>
      {/* Check + título */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          padding: 10, background: LIME, borderRadius: 99,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 13l6 6 10-10" stroke={DARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 16, fontWeight: 400, color: DARK, margin: 0, lineHeight: "24px" }}>Perfil criado</p>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: "20px", margin: 0 }}>
            Agora você pode configurar seu pagamento e compartilhar seu perfil.
          </p>
        </div>
      </div>

      {/* FolderFrame preview */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FolderFrame
          photoUrl={state.avatarPreview}
          firstName={state.firstName}
          lastName={state.lastName}
          width={177}
        />
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          onClick={() => {
            const url = `${window.location.origin}/${state.slug}`;
            if (navigator.share) {
              navigator.share({ url });
            } else {
              navigator.clipboard.writeText(url);
            }
          }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "12px 20px", borderRadius: 8,
            background: DARK, color: "var(--color-cream)", border: "none",
            fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Compartilhar
        </button>

        <Link
          href="/dashboard/pagamentos"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", padding: "12px 20px", borderRadius: 8,
            outline: "1px solid var(--color-olive-600)", outlineOffset: -1,
            background: tokens.bg, color: DARK,
            fontSize: 16, fontWeight: 600,
            textDecoration: "none", boxSizing: "border-box",
            boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
          }}
        >
          Configurar Pagamento
        </Link>
      </div>
    </div>
  );
}

// ─── Slide animation ───────────────────────────────────────────────────────────

const slideV = {
  enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};
const slideT = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

// ─── Wizard ────────────────────────────────────────────────────────────────────

export function CreatorOnboarding() {
  const router     = useRouter();
  const [step,    setStep]    = useState(0);
  const [dir,     setDir]     = useState(1);
  const [state,   setState]   = useState<WizardState>(INITIAL);
  const [slugSt,  setSlugSt]  = useState<SlugStatus>("idle");
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const isSuccess = step === 4;

  // Pre-fill name from Supabase auth user metadata on mount
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      const firstName = (meta.name ?? meta.given_name ?? meta.full_name?.split(" ")[0] ?? "").trim();
      const lastName  = (meta.last_name ?? meta.family_name ?? meta.full_name?.split(" ").slice(1).join(" ") ?? "").trim();
      if (firstName || lastName) {
        const slug = slugify(`${firstName} ${lastName}`);
        setState(prev => ({ ...prev, firstName, lastName, slug }));
      }
    });
  }, []);

  function patch(p: Partial<WizardState>) {
    setState(prev => ({ ...prev, ...p }));
  }

  function next() { setDir(1);  setStep(s => s + 1); }
  function back() { setDir(-1); setStep(s => s - 1); }

  function canAdvance(): boolean {
    if (step === 0) {
      const slugOk  = state.slug.length >= 2 && /^[a-z0-9][a-z0-9-]*$/.test(state.slug);
      const slugBad = slugSt === "taken" || slugSt === "invalid" || slugSt === "checking";
      return (
        state.firstName.trim().length >= 2 &&
        state.lastName.trim().length >= 2 &&
        slugOk &&
        !slugBad
      );
    }
    if (step === 1) {
      return state.socialLinks.every(l => !l.url || l.url.startsWith("http"));
    }
    if (step === 2) return state.area !== null;
    if (step === 3) {
      return state.availBlocks.every(b => b.startTime < b.endTime && b.days.length > 0);
    }
    return true;
  }

  async function handleCreateProfile() {
    if (!canAdvance() || saving) return;
    setSaving(true);
    setSaveErr(null);

    try {
      const sb = createClient();

      // Upload avatar if user chose one
      let avatarUrl: string | null = null;
      if (state.avatarFile) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const ext  = state.avatarFile.name.split(".").pop() ?? "jpg";
          const path = `${user.id}/avatar.${ext}`;
          const { error: upErr } = await sb.storage
            .from("avatars")
            .upload(path, state.avatarFile, { upsert: true });
          if (upErr) throw new Error(`Falha no upload da foto: ${upErr.message}`);
          const { data: { publicUrl } } = sb.storage.from("avatars").getPublicUrl(path);
          avatarUrl = publicUrl;
        }
      }

      // Atomic save via RPC
      const { error } = await sb.rpc("save_creator_profile", {
        p_first_name:   state.firstName,
        p_last_name:    state.lastName,
        p_slug:         state.slug,
        p_avatar_url:   avatarUrl ?? null,
        p_headline:     state.headline,
        p_bio:          state.bio,
        p_area:         state.area,
        p_social_links: state.socialLinks.map((l, i) => ({
          platform: l.platform, url: l.url, sort_order: i,
        })),
        p_availability: state.availBlocks.map(b => ({
          start_time: b.startTime, end_time: b.endTime, days: b.days,
        })),
      });

      if (error) throw error;
      next();
    } catch (err) {
      console.error(err);
      setSaveErr("Algo deu errado. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, display: "flex", flexDirection: "column" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 20px",
        background: `${BG}f0`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <Logo size="header" />
        {!isSuccess && (
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              position: "absolute", right: 20,
              width: 32, height: 32, borderRadius: 7,
              border: `1.5px solid ${BORDER}`, background: CARD,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <IcoX />
          </button>
        )}
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        paddingTop: 60,
        paddingBottom: 116,
        display: "flex", flexDirection: "column",
      }}>
        {!isSuccess && (
          <div style={{ padding: "24px 20px 0" }}>
            <Stepper steps={STEPS} current={step} />
          </div>
        )}

        <div style={{ flex: 1, padding: "32px 20px 0" }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideV}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideT}
            >
              {step === 0 && <StepPerfil   state={state} patch={patch} slugStatus={slugSt} setSlugStatus={setSlugSt} />}
              {step === 1 && <StepSobre    state={state} patch={patch} />}
              {step === 2 && <StepArea     state={state} patch={patch} />}
              {step === 3 && <StepAgenda   state={state} patch={patch} />}
              {step === 4 && <StepSucesso  state={state} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer wizard ─────────────────────────────────────────── */}
      {!isSuccess && (
        <WizardFooter
          step={step}
          totalSteps={STEPS.length}
          onBack={back}
          onNext={step < 3 ? next : handleCreateProfile}
          canAdvance={canAdvance()}
          nextLabel={step < 3 ? "Próximo" : "Criar perfil"}
          saving={saving}
          error={saveErr}
        />
      )}

      {/* ── Footer sucesso ────────────────────────────────────────── */}
      {isSuccess && (
        <footer style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", flexDirection: "column",
        }}>
          {/* Progress bar — todos completos */}
          <div style={{ display: "flex", height: 4 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, background: tokens.lime }} />
            ))}
          </div>

          {/* Nav row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px 20px",
            background: "color-mix(in srgb, var(--color-bg-white) 50%, transparent)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}>
            <Link
              href="/"
              style={{
                fontSize: 16, fontWeight: 600, color: DARK,
                textDecoration: "none", fontFamily: "inherit",
              }}
            >
              Sair
            </Link>

            <Link
              href={`/${state.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 20px", borderRadius: 8,
                background: DARK, color: "var(--color-cream)",
                fontSize: 16, fontWeight: 600,
                textDecoration: "none", fontFamily: "inherit",
              }}
            >
              Ver perfil
              <IcoArrowRight size={20} />
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
