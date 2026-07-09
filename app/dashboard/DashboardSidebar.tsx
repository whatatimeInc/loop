"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useDashboard } from "./DashboardShell";

const DARK  = "#272618";
const MUTED = "#626053";
const FAINT = "#AEADA4";
const LIME  = "#EAEA68";
const BG    = "#FCFBF8";
const BEIGE = "#F4F2EB";
const BORDER = "#E4E2D9";

function IcoHome()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IcoCalendar() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IcoUser()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IcoCash()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function IcoSettings() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IcoSessions() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }

const MENTOR_NAV = [
  { href: "/dashboard",              label: "Home",          icon: IcoHome,     exact: true  },
  { href: "/dashboard/agenda",       label: "Agenda",        icon: IcoCalendar, exact: false },
  { href: "/dashboard/perfil",       label: "Editar perfil", icon: IcoUser,     exact: false },
  { href: "/dashboard/pagamentos",   label: "Pagamentos",    icon: IcoCash,     exact: false },
  { href: "/dashboard/configuracoes",label: "Configurações", icon: IcoSettings, exact: false },
];

const GUEST_NAV = [
  { href: "/dashboard/sessoes",      label: "Minhas sessões",icon: IcoSessions, exact: false },
  { href: "/dashboard/configuracoes",label: "Configurações", icon: IcoSettings, exact: false },
];

export function DashboardSidebar() {
  const { mode, setMode, profile } = useDashboard();
  const pathname = usePathname();

  const nav = mode === "mentor" ? MENTOR_NAV : GUEST_NAV;
  const firstName = profile.name?.split(" ")[0] ?? "Você";
  const initials = [profile.name, profile.last_name]
    .filter(Boolean).map(s => s![0].toUpperCase()).join("").slice(0, 2) || "?";

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column",
      background: BEIGE, minHeight: "100vh",
      position: "sticky", top: 0, alignSelf: "flex-start", maxHeight: "100vh", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 20px" }}>
        <Logo size="header" />
      </div>

      {/* Mode selector / CTA */}
      <div style={{ padding: "0 12px", marginBottom: 8 }}>
        {profile.is_mentor ? (
          <div style={{
            display: "flex", borderRadius: 8, overflow: "hidden",
            background: "#E8E6DC", padding: 3, gap: 2,
          }}>
            {(["mentor", "guest"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: "6px 8px", borderRadius: 6, border: "none",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  background: mode === m ? (m === "mentor" ? LIME : DARK) : "transparent",
                  color: mode === m ? (m === "mentor" ? "#3E3B12" : "#FCFBF8") : MUTED,
                  transition: "all 0.15s",
                }}
              >
                {m === "mentor" ? "Mentor" : "Guest"}
              </button>
            ))}
          </div>
        ) : (
          <Link href="/criar" style={{
            display: "block", padding: "10px 12px", borderRadius: 8,
            background: LIME, color: "#3E3B12",
            fontSize: 12, fontWeight: 600, textDecoration: "none", textAlign: "center",
          }}>
            Torne-se um mentor →
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "4px 12px", flex: 1 }}>
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? DARK : MUTED,
                background: active ? "rgba(234,234,104,0.20)" : "transparent",
                textDecoration: "none", transition: "background 0.1s",
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}><Icon /></span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{
        padding: "12px 16px", borderTop: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={firstName}
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: DARK,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: LIME, flexShrink: 0,
          }}>{initials}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: DARK, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {firstName}
          </p>
          {profile.username && (
            <p style={{ fontSize: 11, color: FAINT, margin: 0 }}>loop.talk/{profile.username}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
