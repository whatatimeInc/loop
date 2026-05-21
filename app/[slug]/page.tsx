import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { experts } from "@/lib/mockExperts";
import { BookingSidebar } from "@/components/BookingSidebar";
import { IconStar } from "@/components/icons";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) return {};
  return {
    title: `${expert.nome} — face.Talk`,
    description: expert.bio,
  };
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function CreatorPage({ params }: Props) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  const recomendam = Math.round(expert.rating * 20);

  return (
    <div className="min-h-screen" style={{ background: "#181D27" }}>
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
          <div className="flex flex-col" style={{ gap: 32, paddingTop: 68 }}>

            {/* Category pill */}
            <div className="inline-flex self-start">
              <span
                className="text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.40)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  backdropFilter: "blur(20px)",
                  color: "#E9EAEB",
                }}
              >
                {expert.categoria}
              </span>
            </div>

            {/* Nome + bio */}
            <div className="flex flex-col gap-4">
              <h1 className="font-normal" style={{ fontSize: 48, color: "#E9EAEB", lineHeight: "48px" }}>
                {expert.nome}
              </h1>
              <p style={{ fontSize: 14, color: "#E9EAEB", lineHeight: "18px" }}>
                {expert.bio}
              </p>
            </div>

            {/* O que esperar */}
            <div style={{ fontSize: 14, color: "#E9EAEB", lineHeight: "18px" }}>
              <p className="mb-1">O que esperar:</p>
              <ul className="flex flex-col gap-1">
                <li>Sessão 100% focada na sua dúvida ou desafio</li>
                <li>Feedback direto e acionável, sem rodeios</li>
                <li>Acesso à experiência real, não a teoria</li>
                <li>Gravação disponível após a sessão</li>
              </ul>
            </div>

            {/* Redes sociais */}
            <div className="flex items-center gap-4" style={{ color: "#E9EAEB" }}>
              <a href={expert.social.instagram ?? "#"} aria-label="Instagram" className="hover:opacity-60 transition-opacity">
                <InstagramIcon />
              </a>
              <a href={expert.social.linkedin ?? "#"} aria-label="LinkedIn" className="hover:opacity-60 transition-opacity">
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* ── Col 2: foto principal ── */}
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 24, aspectRatio: "456/557" }}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 335px",
            gap: 32,
            marginTop: 24,
          }}
        >
          {/* Stats bar */}
          <div
            className="flex items-start"
            style={{ borderTop: "1px solid #535862", paddingTop: 24, gap: 64 }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <IconStar className="w-4 h-4" style={{ color: "#E9EAEB" }} />
                <span style={{ fontSize: 24, color: "#E9EAEB", lineHeight: "32px" }}>
                  {expert.rating.toFixed(1)}
                </span>
              </div>
              <span style={{ fontSize: 14, color: "#E9EAEB" }}>
                {expert.sessoes} avaliações
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 24, color: "#E9EAEB" }}>{expert.sessoes}+</span>
              <span style={{ fontSize: 14, color: "#E9EAEB" }}>sessões</span>
            </div>

            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 24, color: "#E9EAEB" }}>{recomendam}%</span>
              <span style={{ fontSize: 14, color: "#E9EAEB" }}>recomendam</span>
            </div>
          </div>

          {/* Donation card (alinha com a col da sidebar) */}
          {expert.doacao ? (
            <div
              className="flex items-center justify-center text-center"
              style={{
                background: "#414651",
                borderRadius: 12,
                padding: 24,
                fontSize: 14,
                color: "#E9EAEB",
                lineHeight: "18px",
              }}
            >
              100% dos ganhos serão doados para{" "}
              <strong className="ml-1">uma instituição social</strong>
            </div>
          ) : (
            <div /> /* placeholder para manter o grid alinhado */
          )}
        </div>

        {/* ══ SOBRE + AVALIAÇÕES ═══════════════════════════════════════════════ */}
        <div
          style={{
            maxWidth: 829,
            borderTop: "1px solid #535862",
            paddingTop: 24,
            marginTop: 32,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Sobre */}
          <div className="flex flex-col gap-2">
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#E9EAEB", lineHeight: "32px" }}>
              Sobre
            </h2>
            <p style={{ fontSize: 14, color: "#E9EAEB", lineHeight: "18px" }}>
              {expert.bio}
            </p>
          </div>

          {/* Avaliações */}
          <div className="flex flex-col gap-8">
            <h2 style={{ fontSize: 24, fontWeight: 400, color: "#E9EAEB", lineHeight: "32px" }}>
              Avaliações
            </h2>

            <div className="flex flex-col gap-6">
              {avaliacoesMock.map((av) => (
                <div
                  key={av.nome}
                  className="flex flex-col"
                  style={{ background: "#414651", borderRadius: 16, padding: 32, gap: 18 }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#E9EAEB" }}>
                        {av.nome}
                      </span>
                      <div className="flex items-center gap-2">
                        <IconStar className="w-5 h-5" style={{ color: "#E9EAEB" }} />
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#E9EAEB" }}>
                          {av.nota}.0
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: "#E9EAEB" }}>{av.data}</span>
                  </div>
                  <p style={{ fontSize: 16, color: "#E9EAEB", lineHeight: "24px" }}>
                    {av.texto}
                  </p>
                </div>
              ))}
            </div>

            {/* Ver todas */}
            <div className="flex justify-center">
              <button
                className="font-semibold transition-opacity hover:opacity-70"
                style={{
                  outline: "1px solid #D5D7DA",
                  outlineOffset: -1,
                  color: "#D5D7DA",
                  background: "transparent",
                  fontSize: 16,
                  padding: "10px 18px",
                  borderRadius: 8,
                }}
              >
                Ver todas
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
