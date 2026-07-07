"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4.17 10h11.66M10 4.17L15.83 10 10 15.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FCFBF8" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="#FCFBF8" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FCFBF8">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function SocialIcons() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <a href="#" aria-label="Instagram" style={{ width: 48, height: 48, borderRadius: "50%", background: "#514F41", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
        <InstagramIcon />
      </a>
      <a href="#" aria-label="LinkedIn" style={{ width: 48, height: 48, borderRadius: "50%", background: "#514F41", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
        <LinkedInIcon />
      </a>
    </div>
  );
}

export function Footer() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <footer style={{ padding: "0 16px 16px" }}>
        <div style={{ background: "#272618", borderRadius: 12, padding: "40px 40px 0" }}>

          {/* Logo + tagline + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
              <Logo size="footer" lime />
              <p style={{ fontSize: 14, color: "#AEADA4", lineHeight: "20px", margin: 0 }}>
                A plataforma para te conectar com sua audiência valorizando seu tempo.
              </p>
            </div>
            <Link
              href="/cadastro"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                background: "#EAEA68",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: "#272618",
                textDecoration: "none",
                alignSelf: "flex-start",
                boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
              }}
            >
              Criar Loop.Talk
              <ArrowIcon />
            </Link>
          </div>

          {/* Social icons */}
          <div style={{ paddingTop: 24, borderTop: "1px solid #514F41", paddingBottom: 24 }}>
            <SocialIcons />
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop: 24, paddingBottom: 24, borderTop: "1px solid #514F41", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="#" style={{ fontSize: 12, color: "#AEADA4", lineHeight: "18px", textDecoration: "none" }}>Termos e Condições</a>
              <a href="#" style={{ fontSize: 12, color: "#AEADA4", lineHeight: "18px", textDecoration: "none" }}>Política de Privacidade</a>
            </div>
            <span style={{ fontSize: 12, color: "#AEADA4", lineHeight: "18px", textAlign: "center" }}>© 2026 Loop.Talk</span>
          </div>

        </div>
      </footer>
    );
  }

  return (
    <footer style={{ padding: "0 24px 24px" }}>
      <div style={{ background: "#272618", borderRadius: 16, padding: "40px 40px 0" }}>

        {/* Top row */}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          {/* Left: logo + tagline + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
              <Logo size="footer" light />
              <p style={{ fontSize: 16, color: "#AEADA4", lineHeight: "24px", margin: 0, maxWidth: 340 }}>
                A plataforma para te conectar com sua audiência valorizando seu tempo.
              </p>
            </div>
            <Link
              href="/cadastro"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                background: "#EAEA68",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                color: "#272618",
                textDecoration: "none",
                alignSelf: "flex-start",
                boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
              }}
            >
              Criar Loop.Talk
            </Link>
          </div>
          {/* Right: social icons */}
          <SocialIcons />
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #514F41", padding: "32px 0", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#AEADA4", lineHeight: "18px" }}>© 2026 Loop.Talk</span>
          <div style={{ display: "flex", gap: 32 }}>
            <a href="#" style={{ fontSize: 12, color: "#AEADA4", lineHeight: "18px", textDecoration: "none" }}>Termos e Condições</a>
            <a href="#" style={{ fontSize: 12, color: "#AEADA4", lineHeight: "18px", textDecoration: "none" }}>Política de Privacidade</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
