import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { experts } from "@/lib/mockExperts";
import { BookingSidebar } from "@/components/BookingSidebar";
import { MobileCreatorLayout } from "@/components/MobileCreatorLayout";
import { StarSolid } from "iconoir-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryIcon } from "@/components/CategoryIcon";
import { type Categoria } from "@/lib/mockExperts";
import { ShareButton } from "./ShareButton";
import { tokens } from "@/components/ui/tokens";

type Props = { params: Promise<{ slug: string }> };

type SessionType = {
  id: string;
  label: string | null;
  duration_minutes: number;
  price_brl: number;
};

type SocialLink = {
  platform: string;
  url: string;
  sort_order: number;
};

type RealProfile = {
  id: string;
  name: string | null;
  last_name: string | null;
  username: string | null;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  area: string | null;
  sessionTypes: SessionType[];
  socialLinks: SocialLink[];
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, last_name, headline, bio")
    .eq("username", slug)
    .eq("host_profile_activated", true)
    .single();

  if (profile) {
    const name = [profile.name, profile.last_name].filter(Boolean).join(" ");
    return { title: `${name} — Loop.Talk`, description: profile.headline ?? profile.bio ?? "" };
  }

  const expert = experts.find((e) => e.slug === slug);
  if (!expert) return {};
  return { title: `${expert.nome} — Loop.Talk`, description: expert.bio };
}

// ─── mock reviews ─────────────────────────────────────────────────────────────

const avaliacoesMock = [
  {
    nome: "Felipe M.",
    nota: 5,
    texto: "Really great person. Was very open and thoughtful with his feedback.",
    data: "Abril 2026",
  },
  {
    nome: "Marina M.",
    nota: 5,
    texto:
      "He gave me some great ideas about the design for my app as well as different directions I can go with. He also mentioned some things that I had never even thought about. Thank you.",
    data: "Fevereiro 2026",
  },
];

// ─── icons ────────────────────────────────────────────────────────────────────

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <polygon points="10,9 15,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4.17 10h11.66M10 4.17L15.83 10 10 15.83" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SocialCircle({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} aria-label={label} style={{
      width: 32, height: 32, background: "#E0DDC1", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      textDecoration: "none", color: "#272618", flexShrink: 0,
    }}>
      {children}
    </a>
  );
}

// ─── real profile page ────────────────────────────────────────────────────────

const AREA_LABEL: Record<string, Categoria> = {
  career_business:   "Carreira e Negócios",
  lifestyle_fashion: "Estilo de Vida",
  health_wellness:   "Saúde e Bem Estar",
  technology:        "Tecnologia",
  creativity:        "Criatividade",
  gastronomy:        "Gastronomia",
};

function SocialIconByPlatform({ platform }: { platform: string }) {
  if (platform === "instagram") return <InstagramIcon />;
  if (platform === "linkedin")  return <LinkedInIcon />;
  if (platform === "youtube")   return <YouTubeIcon />;
  if (platform === "tiktok")    return <TikTokIcon />;
  if (platform === "twitter")   return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function RealCreatorPage({ profile }: { profile: RealProfile }) {
  const name = [profile.name, profile.last_name].filter(Boolean).join(" ");
  const initials = [profile.name, profile.last_name]
    .filter(Boolean)
    .map((s) => s![0].toUpperCase())
    .join("")
    .slice(0, 2);

  const cheapest = profile.sessionTypes[0];
  const cheapestPrice = cheapest
    ? (cheapest.price_brl / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    : null;

  const areaLabel = profile.area ? (AREA_LABEL[profile.area] ?? null) : null;

  const chipStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.40)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 4, padding: "8px 12px",
    fontSize: 12, fontWeight: 600, color: "#272618",
    boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
    display: "inline-flex", alignItems: "center", gap: 4,
  };

  const socialRow = profile.socialLinks.length > 0 && (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {profile.socialLinks.map((l) => (
        <SocialCircle key={l.platform} href={l.url} label={l.platform}>
          <SocialIconByPlatform platform={l.platform} />
        </SocialCircle>
      ))}
    </div>
  );

  return (
    <>
    {/* ── MOBILE ────────────────────────────────────────────────────────────── */}
    <div className="md:hidden" style={{ background: "#F4F2EB", paddingBottom: 96 }}>
      <div style={{ padding: "96px 16px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero photo */}
        <div style={{ width: "100%", height: 500, borderRadius: 12, overflow: "hidden", position: "relative", background: "#E0DDC1" }}>
          {profile.photo_url ? (
            <Image src={profile.photo_url} alt={name} fill className="object-cover object-top" sizes="100vw" />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 700, color: "#272518", background: tokens.lime }}>
              {initials}
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0) 55%, rgba(255,255,255,0.38) 75%, rgba(255,255,255,0.80) 100%)" }} />
          {/* Bottom frosted section */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 310, paddingTop: 58, paddingBottom: 32, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%)", maskImage: "linear-gradient(180deg, transparent 0%, black 22%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {areaLabel && <span style={chipStyle}><CategoryIcon categoria={areaLabel} />{areaLabel}</span>}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingLeft: 16, paddingRight: 16 }}>
              <h1 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 30, fontWeight: 300, color: "#181D27", lineHeight: "32px", textAlign: "center", margin: 0 }}>
                {name || profile.username}
              </h1>
              {profile.headline && (
                <p style={{ fontSize: 12, color: "#181D27", lineHeight: "16px", textAlign: "center", margin: 0 }}>{profile.headline}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sobre + social */}
        {profile.bio && (
          <div style={{ borderTop: "1px solid #DAD9D5", paddingTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272618", lineHeight: "32px", margin: 0 }}>Sobre</h2>
              {socialRow}
            </div>
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, padding: "17px 16px 16px", background: "rgba(255,255,255,0.50)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {profile.sessionTypes.length > 0 && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 56, background: tokens.lime, borderRadius: 8, fontSize: 16, fontWeight: 600, color: "#272618", cursor: "pointer" }}>
              Agendar Loop.Talk
            </div>
          )}
          <ShareButton slug={profile.username ?? ""} name={name} />
        </div>
      </div>
    </div>

    {/* ── DESKTOP ───────────────────────────────────────────────────────────── */}
    <div className="hidden md:block" style={{ background: "#F4F2EB", minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "112px 12px 80px" }}>

        {/* ══ HERO: 2 colunas ══════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

          {/* Col esquerda: foto com overlay de vidro */}
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 557, background: "#E0DDC1" }}>
            {profile.photo_url ? (
              <Image src={profile.photo_url} alt={name} fill priority className="object-cover object-top" sizes="456px" />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 700, color: "#272518", background: tokens.lime }}>
                {initials}
              </div>
            )}

            {/* Botão compartilhar — glass, canto superior direito */}
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
              <ShareButton slug={profile.username ?? ""} name={name} variant="glass" />
            </div>

            {/* Gradiente de base */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0) 56%, rgba(255,255,255,0.38) 76%, rgba(255,255,255,0.80) 100%)" }} />

            {/* Painel frosted glass */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, top: "52%",
              backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
              maskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-end", gap: 8, paddingBottom: 28,
            }}>
              {areaLabel && (
                <span style={chipStyle}>
                  <CategoryIcon categoria={areaLabel} />
                  {areaLabel}
                </span>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingLeft: 24, paddingRight: 24 }}>
                <h1 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 30, fontWeight: 300, color: "#181D27", lineHeight: "32px", textAlign: "center", margin: 0 }}>
                  {name || profile.username}
                </h1>
                {profile.headline && (
                  <p style={{ fontSize: 14, fontWeight: 400, color: "#181D27", lineHeight: "20px", textAlign: "center", margin: 0 }}>
                    {profile.headline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Col direita: card de agendamento */}
          <div style={{ position: "sticky", top: 96 }}>
            <div style={{
              background: "#F4F2EB", borderRadius: 12, outline: "1px solid #DAD9D5", outlineOffset: -1,
              padding: "40px 24px", height: 557, boxSizing: "border-box",
              display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24,
            }}>
              {/* Logo + nome + social */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <img src="/logo.svg" alt="Loop.Talk" style={{ height: 20, display: "block" }} />
                  <p style={{ fontSize: 30, fontWeight: 400, color: "#181D27", lineHeight: "38px", textAlign: "center", margin: 0 }}>
                    {name || profile.username}
                  </p>
                </div>
                {profile.socialLinks.length > 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {profile.socialLinks.map((l) => (
                      <a key={l.platform} href={l.url} aria-label={l.platform} style={{
                        width: 32, height: 32, background: "#E0DDC1", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textDecoration: "none", color: "#272618", flexShrink: 0,
                      }}>
                        <SocialIconByPlatform platform={l.platform} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Session tiles + CTA + share */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {profile.sessionTypes.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {profile.sessionTypes.map((st, i) => {
                        const isHighlighted = i === profile.sessionTypes.length - 1;
                        return (
                          <div key={st.id} style={{
                            flex: 1, height: 72, borderRadius: 4,
                            background: isHighlighted ? tokens.lime : "#FFFFFF",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                          }}>
                            <span style={{ fontSize: 16, fontWeight: 400, color: "#272618", lineHeight: "24px" }}>
                              {st.label || `${st.duration_minutes} min`}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 400, color: "#807F71", lineHeight: "16px" }}>
                              R$ {(st.price_brl / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px", borderRadius: 8, background: "#272618", color: "#FCFBF8", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                      Agendar Loop.Talk
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#626053", margin: 0, textAlign: "center" }}>Nenhuma sessão disponível no momento.</p>
                )}
                <ShareButton slug={profile.username ?? ""} name={name} variant="text" />
              </div>
            </div>
          </div>
        </div>

        {/* Sobre */}
        {profile.bio && (
          <div style={{ borderTop: "1px solid #DAD9D5", paddingTop: 24, marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272518", lineHeight: "32px", margin: 0 }}>Sobre</h2>
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>{profile.bio}</p>
          </div>
        )}

      </div>
    </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CreatorPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, name, last_name, username, headline, bio, photo_url, area")
    .eq("username", slug)
    .eq("host_profile_activated", true)
    .single();

  if (profileRow) {
    const [{ data: sessionTypes }, { data: socialLinks }] = await Promise.all([
      supabase
        .from("session_types")
        .select("id, label, duration_minutes, price_brl")
        .eq("host_id", profileRow.id)
        .eq("active", true)
        .order("price_brl"),
      supabase
        .from("social_links")
        .select("platform, url, sort_order")
        .eq("profile_id", profileRow.id)
        .order("sort_order"),
    ]);

    const realProfile: RealProfile = {
      ...profileRow,
      sessionTypes: sessionTypes ?? [],
      socialLinks: socialLinks ?? [],
    };
    return <RealCreatorPage profile={realProfile} />;
  }

  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  const recomendam = Math.round(expert.rating * 20);

  return (
    <>
      {/* ═══ MOBILE ══════════════════════════════════════════════════════════ */}
      <MobileCreatorLayout expert={expert} />

      {/* ═══ DESKTOP ══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen" style={{ background: "#F4F2EB" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "112px 12px 80px" }}>

        {/* ══ HERO: 2 colunas (foto + agendamento) ════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

          {/* ── Col esquerda: foto com overlay de vidro ── */}
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 557, background: "#E0DDC1" }}>
            <Image
              src={`/mentors/${expert.slug}/profile.webp`}
              alt={expert.nome}
              fill
              priority
              className="object-cover object-top"
              sizes="456px"
            />

            {/* Botão compartilhar — glass, canto superior direito */}
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
              <ShareButton slug={expert.slug} name={expert.nome} variant="glass" />
            </div>

            {/* Gradiente de clareamento sobre a foto */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(255,255,255,0.38) 76%, rgba(255,255,255,0.82) 100%)" }} />

            {/* Painel frosted glass — base da foto */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, top: "60%",
              backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
              maskImage: "linear-gradient(180deg, transparent 0%, black 22%)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-end", gap: 8, paddingBottom: 28,
            }}>
              {/* Chip de área */}
              <span style={{
                background: "rgba(255,255,255,0.40)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                borderRadius: 4, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#272618",
                boxShadow: "0px 1px 2px rgba(10,13,18,0.05)", display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <CategoryIcon categoria={expert.categoria} />
                {expert.categoria}
              </span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingLeft: 24, paddingRight: 24 }}>
                <h1 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 30, fontWeight: 300, color: "#181D27", lineHeight: "32px", textAlign: "center", margin: 0 }}>
                  {expert.nome}
                </h1>
                <p style={{ fontSize: 14, fontWeight: 400, color: "#181D27", lineHeight: "20px", textAlign: "center", margin: 0 }}>
                  {expert.bio}
                </p>
              </div>
            </div>
          </div>

          {/* ── Col direita: card de agendamento ── */}
          <div style={{ position: "sticky", top: 96 }}>
            <BookingSidebar expert={expert} />
          </div>

        </div>

        {/* ══ STATS + DOAÇÃO ═══════════════════════════════════════════════════ */}
        <div style={{
          borderTop: "1px solid #DAD9D5",
          borderBottom: "1px solid #DAD9D5",
          padding: "24px 0",
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 56 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <StarSolid className="w-4 h-4" style={{ color: "#181D27" }} />
                <span style={{ fontSize: 20, color: "#181D27", lineHeight: "24px" }}>
                  {expert.rating.toFixed(1)}
                </span>
              </div>
              <span style={{ fontSize: 14, color: "#181D27" }}>
                {avaliacoesMock.length * 10} avaliações
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 20, color: "#181D27" }}>{expert.sessoes}+</span>
              <span style={{ fontSize: 14, color: "#181D27" }}>sessões</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 20, color: "#181D27" }}>{recomendam}%</span>
              <span style={{ fontSize: 14, color: "#181D27" }}>recomendam</span>
            </div>
          </div>

          {expert.doacao && (
            <div style={{
              width: 457,
              padding: 16,
              background: "#E0DDC1",
              borderRadius: 4,
              textAlign: "center",
              fontSize: 12,
              color: "#272618",
              lineHeight: "16px",
            }}>
              100% dos ganhos serão doados para{" "}
              <strong>Instituição ABC</strong>
            </div>
          )}
        </div>

        {/* ══ SOBRE + AVALIAÇÕES ═══════════════════════════════════════════════ */}
        <div style={{
          paddingTop: 24,
          paddingBottom: 24,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}>
          {/* Sobre */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#181D27", lineHeight: "32px", margin: 0 }}>
              Sobre
            </h2>
            <p style={{ fontSize: 14, color: "#181D27", lineHeight: "20px", margin: 0 }}>
              I am a designer building digital products. For the past 10+ years, I have worked with multi-disciplinary professionals shaping the future of brands and products around the world. My background is in Visual and User Interface with a deep understanding of User Experience. I&apos;ve led projects for different industries such as entertainment, fashion, retail and finance. I helped create great design teams and also coach young designers from different parts of the world. I have a great understanding of design culture and design processes. After we finished Move to Apple we decided to create our next product focused on the creative industry, approaching a problem that&apos;s common for anyone who wants to collect and browse inspiration that they find on the internet. We launched Savee in 2016, an ad-free platform that was designed to be simple and easy to use. We started with 60 beta users and currently we are more than 13.000 users that are constantly increasing and I am proud of what we are building. I believe in team-work and discipline in Design. Integrating great visual and interaction design is in my view the way to create well-crafted experiences that are consequentially responsible for meaningful products. My specialties are in User Interface Design, Motion Design &amp; Interactive Prototypes, my main focus is how we can use design to solve business challenges focused on the user experience.
            </p>
          </div>

          {/* Avaliações */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#181D27", lineHeight: "32px", margin: 0 }}>
              Avaliações
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {avaliacoesMock.map((av, i) => (
                <div
                  key={av.nome}
                  style={{ background: "#E0DDC1", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", gap: 18 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#272618" }}>{av.nome}</span>
                        {i === 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 18, height: 18, background: "#8E8857", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="#E0DDC1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#8E8857" }}>EXPERT</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StarSolid className="w-5 h-5" style={{ color: "#272618" }} />
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#272618" }}>{av.nota}.0</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: "#272618" }}>{av.data}</span>
                  </div>
                  <p style={{ fontSize: 16, color: "#272618", lineHeight: "24px", margin: 0 }}>{av.texto}</p>
                </div>
              ))}
            </div>

            {/* Ver todas */}
            <button style={{
              alignSelf: "stretch",
              padding: "12px 20px",
              background: "#FCFBF8",
              border: "none",
              outline: "1px solid #8E8857",
              outlineOffset: -1,
              color: "#272618",
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
              cursor: "pointer",
            }}>
              Ver todas
            </button>
          </div>
        </div>

        {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
        <div style={{ padding: "48px 0" }}>
          <div style={{
            background: tokens.lime,
            borderRadius: 12,
            padding: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontFamily: "Host Grotesk, sans-serif", fontSize: 30, fontWeight: 300, lineHeight: "32px", color: "#272518", margin: 0 }}>
                Faça parte do Loop.Talk<br />e inspire pessoas.
              </p>
              <p style={{ fontSize: 16, color: "#272518", lineHeight: "24px", margin: 0, maxWidth: 320 }}>
                Conecte-se virtualmente, aconselhe e ganhe pelo seu tempo.
              </p>
            </div>
            <Link href="/cadastro" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              background: "#272618",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              color: "#FCFBF8",
              textDecoration: "none",
              flexShrink: 0,
            }}>
              Entrar na lista de espera
              <ArrowIcon />
            </Link>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
