import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { experts } from "@/lib/mockExperts";
import { BookingSidebar } from "@/components/BookingSidebar";
import { MobileCreatorLayout } from "@/components/MobileCreatorLayout";
import { IconStar } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { CategoryIcon } from "@/components/CategoryIcon";

type Props = { params: Promise<{ slug: string }> };

type SessionType = {
  id: string;
  label: string | null;
  duration_minutes: number;
  price_brl: number;
};

type RealProfile = {
  id: string;
  name: string | null;
  last_name: string | null;
  username: string | null;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  sessionTypes: SessionType[];
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

function RealCreatorPage({ profile }: { profile: RealProfile }) {
  const name = [profile.name, profile.last_name].filter(Boolean).join(" ");
  const initials = [profile.name, profile.last_name]
    .filter(Boolean)
    .map((s) => s![0].toUpperCase())
    .join("")
    .slice(0, 2);

  const cheapest = profile.sessionTypes[0];
  const cheapestPrice = cheapest ? (cheapest.price_brl / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : null;

  return (
    <div style={{ background: "#F4F2EB", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1194, margin: "0 auto", padding: "112px 24px 80px" }}>

        {/* Hero grid */}
        <div style={{ display: "grid", gridTemplateColumns: "336px 1fr 335px", gap: 32, alignItems: "start" }}>

          {/* Col 1: info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 68 }}>
            <h1 style={{ fontSize: 48, fontWeight: 300, color: "#272518", lineHeight: "48px", margin: 0 }}>
              {name || profile.username}
            </h1>
            {profile.headline && (
              <p style={{ fontSize: 16, fontWeight: 500, color: "#272518", margin: 0 }}>
                {profile.headline}
              </p>
            )}
            {profile.bio && (
              <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>
                {profile.bio}
              </p>
            )}
            <div style={{ fontSize: 14, color: "#626053", lineHeight: "20px" }}>
              <p style={{ color: "#272518", fontWeight: 500, margin: "0 0 6px" }}>O que esperar:</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                <li>Sessão 100% focada na sua dúvida ou desafio</li>
                <li>Feedback direto e acionável, sem rodeios</li>
                <li>Acesso à experiência real, não a teoria</li>
              </ul>
            </div>
          </div>

          {/* Col 2: photo */}
          <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "456/557", background: "#E0DDC1", position: "relative" }}>
            {profile.photo_url ? (
              <Image src={profile.photo_url} alt={name} fill className="object-cover object-top" sizes="456px" />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 700, color: "#272518", background: "#EAEA68" }}>
                {initials}
              </div>
            )}
          </div>

          {/* Col 3: booking panel */}
          <div style={{ position: "sticky", top: 96 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E0DDC1", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={{ fontSize: 12, color: "#626053", margin: "0 0 4px" }}>A partir de</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: "#272518", margin: 0 }}>
                  {cheapestPrice ? `R$ ${cheapestPrice}` : "—"}
                </p>
              </div>

              {profile.sessionTypes.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.sessionTypes.map((st) => (
                    <div
                      key={st.id}
                      style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #E0DDC1", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#272518", margin: 0 }}>
                          {st.label || `Sessão ${st.duration_minutes} min`}
                        </p>
                        <p style={{ fontSize: 12, color: "#626053", margin: "2px 0 0" }}>{st.duration_minutes} minutos</p>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#272518", margin: 0 }}>
                        R$ {(st.price_brl / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#626053", margin: 0 }}>Nenhuma sessão disponível no momento.</p>
              )}

              {profile.sessionTypes.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px",
                    borderRadius: 8,
                    background: "#272518",
                    color: "#FCFBF8",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Agendar sessão
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio section */}
        {profile.bio && (
          <div style={{ maxWidth: 829, borderTop: "1px solid #E0DDC1", paddingTop: 24, marginTop: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272518", lineHeight: "32px", marginBottom: 12 }}>Sobre</h2>
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px" }}>{profile.bio}</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CreatorPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, name, last_name, username, headline, bio, photo_url")
    .eq("username", slug)
    .eq("host_profile_activated", true)
    .single();

  if (profileRow) {
    const { data: sessionTypes } = await supabase
      .from("session_types")
      .select("id, label, duration_minutes, price_brl")
      .eq("host_id", profileRow.id)
      .eq("active", true)
      .order("price_brl");

    const realProfile: RealProfile = { ...profileRow, sessionTypes: sessionTypes ?? [] };
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
      <div className="max-w-[1194px] mx-auto px-6 pt-28 pb-20">

        {/* ══ HERO: 3 colunas ══════════════════════════════════════════════════ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "336px 1fr 335px",
            gap: 32,
            alignItems: "start",
          }}
        >

          {/* ── Col 1: info do creator ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingTop: 68 }}>

            {/* Category pill */}
            <div style={{ display: "inline-flex", alignSelf: "flex-start" }}>
              <span style={{
                background: "rgba(255,255,255,0.40)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: 4,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#272618",
                boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}>
                <CategoryIcon categoria={expert.categoria} />
                {expert.categoria}
              </span>
            </div>

            {/* Nome + tagline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1 style={{ fontFamily: "Host Grotesk, sans-serif", fontSize: 48, fontWeight: 300, color: "#272618", lineHeight: "52.8px", margin: 0 }}>
                {expert.nome}
              </h1>
              <p style={{ fontSize: 14, color: "#272618", lineHeight: "20px", margin: 0 }}>
                {expert.bio}
              </p>
            </div>

            {/* Redes sociais */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SocialCircle href={expert.social.instagram ?? "#"} label="Instagram"><InstagramIcon /></SocialCircle>
              <SocialCircle href={expert.social.linkedin ?? "#"} label="LinkedIn"><LinkedInIcon /></SocialCircle>
              <SocialCircle href="#" label="YouTube"><YouTubeIcon /></SocialCircle>
              <SocialCircle href="#" label="TikTok"><TikTokIcon /></SocialCircle>
            </div>
          </div>

          {/* ── Col 2: foto principal ── */}
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 12, aspectRatio: "456/557" }}
          >
            <Image
              src={`/mentors/${expert.slug}/profile.webp`}
              alt={expert.nome}
              fill
              priority
              className="object-cover object-top"
              sizes="456px"
            />
          </div>

          {/* ── Col 3: booking sidebar ── */}
          <div className="sticky top-24">
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
                <IconStar className="w-4 h-4" style={{ color: "#181D27" }} />
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
              width: 335,
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
          maxWidth: 829,
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
            <p style={{ fontSize: 14, color: "#181D27", lineHeight: "18px", margin: 0 }}>
              {expert.bio}
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
                        <IconStar className="w-5 h-5" style={{ color: "#272618" }} />
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
            background: "#EAEA68",
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
