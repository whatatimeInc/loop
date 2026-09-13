import Image from "next/image";
import { Logo } from "@/components/Logo";
import { notFound } from "next/navigation";
import { StarSolid } from "iconoir-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ShareButton } from "./ShareButton";
import { BookingCta } from "./BookingCta";
import { tokens } from "@/components/ui/tokens";
import {
  getCreatorBySlug,
  getCreatorReviews,
  type Creator,
  type CreatorReview,
} from "@/lib/creators";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
  if (!creator) return {};
  return {
    title: `${creator.name} — Loop.Talk`,
    description: creator.headline ?? creator.bio ?? "",
  };
}

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

// ─── photo ────────────────────────────────────────────────────────────────────

/**
 * Photos are stored absolute (`${NEXT_PUBLIC_SITE_URL}/mentors/...`). Only
 * same-origin ones can go through next/image's optimizer; anything else is
 * rendered with a plain <img> so no remote host has to be allow-listed.
 */
function localPhotoSrc(photoUrl: string | null): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("/")) return photoUrl;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site && photoUrl.startsWith(site)) {
    const path = photoUrl.slice(site.length);
    return path.startsWith("/") ? path : `/${path}`;
  }
  return null;
}

function CreatorPhoto({
  photoUrl, alt, initials, sizes, priority,
}: {
  photoUrl: string | null; alt: string; initials: string; sizes: string; priority?: boolean;
}) {
  const local = localPhotoSrc(photoUrl);
  if (local) {
    return <Image src={local} alt={alt} fill priority={priority} className="object-cover object-top" sizes={sizes} />;
  }
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={alt}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
      />
    );
  }
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 700, color: "#272518", background: tokens.lime }}>
      {initials}
    </div>
  );
}

// ─── reviews ──────────────────────────────────────────────────────────────────

/** "2026-02-14T…" → "Fevereiro 2026". */
function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const timeZone = "America/Sao_Paulo";
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone }).format(date);
  const year = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone }).format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
}

function ReviewCard({ review }: { review: CreatorReview }) {
  return (
    <div style={{ background: "#E0DDC1", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#272618" }}>
            {review.reviewerName ?? "Anônimo"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarSolid className="w-5 h-5" style={{ color: "#272618" }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#272618" }}>
              {review.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <span style={{ fontSize: 14, color: "#272618" }}>{formatReviewDate(review.createdAt)}</span>
      </div>
      {review.text && (
        <p style={{ fontSize: 16, color: "#272618", lineHeight: "24px", margin: 0 }}>{review.text}</p>
      )}
    </div>
  );
}

// ─── creator page ─────────────────────────────────────────────────────────────

function RealCreatorPage({ creator, reviews }: { creator: Creator; reviews: CreatorReview[] }) {
  const initials = creator.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join("")
    .slice(0, 2);

  const chipStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.40)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 4, padding: "8px 12px",
    fontSize: 12, fontWeight: 600, color: "#272618",
    boxShadow: "0px 1px 2px rgba(10,13,18,0.05)",
    display: "inline-flex", alignItems: "center", gap: 4,
  };

  const socialRow = creator.socialLinks.length > 0 && (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {creator.socialLinks.map((l) => (
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
          <CreatorPhoto photoUrl={creator.photoUrl} alt={creator.name} initials={initials} sizes="100vw" />
          {/* Gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0) 55%, rgba(255,255,255,0.38) 75%, rgba(255,255,255,0.80) 100%)" }} />
          {/* Bottom frosted section */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 310, paddingTop: 58, paddingBottom: 32, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 22%)", maskImage: "linear-gradient(180deg, transparent 0%, black 22%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {creator.category && <span style={chipStyle}><CategoryIcon categoria={creator.category} />{creator.category}</span>}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingLeft: 16, paddingRight: 16 }}>
              <h1 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 30, fontWeight: 300, color: "#181D27", lineHeight: "32px", textAlign: "center", margin: 0 }}>
                {creator.name}
              </h1>
              {creator.headline && (
                <p style={{ fontSize: 12, color: "#181D27", lineHeight: "16px", textAlign: "center", margin: 0 }}>{creator.headline}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sobre + social */}
        {creator.bio && (
          <div style={{ borderTop: "1px solid #DAD9D5", paddingTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272618", lineHeight: "32px", margin: 0 }}>Sobre</h2>
              {socialRow}
            </div>
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>{creator.bio}</p>
          </div>
        )}

        {/* Avaliações */}
        <div style={{ borderTop: "1px solid #DAD9D5", paddingTop: 24, display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272518", lineHeight: "32px", margin: 0 }}>Avaliações</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarSolid className="w-4 h-4" style={{ color: "#181D27" }} />
              <span style={{ fontSize: 20, color: "#181D27", lineHeight: "24px" }}>
                {creator.rating !== null ? creator.rating.toFixed(1) : "—"}
              </span>
              <span style={{ fontSize: 14, color: "#626053" }}>{creator.reviewCount} avaliações</span>
            </div>
          </div>

          {reviews.length > 0 ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
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
            </>
          ) : (
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>Ainda sem avaliações.</p>
          )}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, padding: "17px 16px 16px", background: "rgba(255,255,255,0.50)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <BookingCta key={creator.slug} slug={creator.slug} offers={creator.offers} variant="bar" />
          <ShareButton slug={creator.slug} name={creator.name} />
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
            <CreatorPhoto photoUrl={creator.photoUrl} alt={creator.name} initials={initials} sizes="456px" priority />

            {/* Botão compartilhar — glass, canto superior direito */}
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
              <ShareButton slug={creator.slug} name={creator.name} variant="glass" />
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
              {creator.category && (
                <span style={chipStyle}>
                  <CategoryIcon categoria={creator.category} />
                  {creator.category}
                </span>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingLeft: 24, paddingRight: 24 }}>
                <h1 style={{ fontFamily: "var(--font-host-grotesk)", fontSize: 30, fontWeight: 300, color: "#181D27", lineHeight: "32px", textAlign: "center", margin: 0 }}>
                  {creator.name}
                </h1>
                {creator.headline && (
                  <p style={{ fontSize: 14, fontWeight: 400, color: "#181D27", lineHeight: "20px", textAlign: "center", margin: 0 }}>
                    {creator.headline}
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
                  <Logo size="header" style={{ height: 20 }} />
                  <p style={{ fontSize: 30, fontWeight: 400, color: "#181D27", lineHeight: "38px", textAlign: "center", margin: 0 }}>
                    {creator.name}
                  </p>
                </div>
                {creator.socialLinks.length > 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {creator.socialLinks.map((l) => (
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

              {/* Duration tiles + CTA + share */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {creator.offers.length > 0 ? (
                  <BookingCta key={creator.slug} slug={creator.slug} offers={creator.offers} variant="card" />
                ) : (
                  <p style={{ fontSize: 13, color: "#626053", margin: 0, textAlign: "center" }}>Nenhuma sessão disponível no momento.</p>
                )}
                <ShareButton slug={creator.slug} name={creator.name} variant="text" />
              </div>
            </div>
          </div>
        </div>

        {/* Sobre */}
        {creator.bio && (
          <div style={{ borderTop: "1px solid #DAD9D5", paddingTop: 24, marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272518", lineHeight: "32px", margin: 0 }}>Sobre</h2>
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>{creator.bio}</p>
          </div>
        )}

        {/* Avaliações */}
        <div style={{ borderTop: "1px solid #DAD9D5", paddingTop: 24, marginTop: 24, display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#272518", lineHeight: "32px", margin: 0 }}>Avaliações</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarSolid className="w-4 h-4" style={{ color: "#181D27" }} />
              <span style={{ fontSize: 20, color: "#181D27", lineHeight: "24px" }}>
                {creator.rating !== null ? creator.rating.toFixed(1) : "—"}
              </span>
              <span style={{ fontSize: 14, color: "#626053" }}>{creator.reviewCount} avaliações</span>
            </div>
          </div>

          {reviews.length > 0 ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
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
            </>
          ) : (
            <p style={{ fontSize: 14, color: "#626053", lineHeight: "20px", margin: 0 }}>Ainda sem avaliações.</p>
          )}
        </div>

      </div>
    </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CreatorPage({ params }: Props) {
  const { slug } = await params;

  const creator = await getCreatorBySlug(slug);
  if (!creator) notFound();

  const reviews = await getCreatorReviews(creator.id);

  return <RealCreatorPage creator={creator} reviews={reviews} />;
}
