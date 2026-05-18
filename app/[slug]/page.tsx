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

const avaliacoesMock = [
  {
    nome: "Fernanda R.",
    nota: 5,
    texto: "Sessão incrível. Saí com clareza total sobre o próximo passo na carreira.",
    data: "Mar 2025",
  },
  {
    nome: "Lucas M.",
    nota: 5,
    texto: "Direto ao ponto, sem enrolação. Valeu cada centavo.",
    data: "Fev 2025",
  },
];

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

export default async function CreatorPage({ params }: Props) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  return (
    <div className="min-h-screen" style={{ background: "#F6F1E9" }}>
      <div
        className="max-w-[1194px] mx-auto px-6 pt-32 pb-20"
      >
        <div
          className="grid gap-8 items-start"
          style={{ gridTemplateColumns: "1fr 440px" }}
        >

          {/* ══════════════ COLUNA ESQUERDA ══════════════ */}
          <div className="flex flex-col gap-8">

            {/* 1. Breadcrumb */}
            <nav className="text-sm" style={{ color: "#181D27" }}>
              <Link href="/explorar" className="hover:opacity-60 transition-opacity">Creators</Link>
              <span className="mx-2 opacity-40">|</span>
              <Link href={`/explorar?categoria=${encodeURIComponent(expert.categoria)}`} className="hover:opacity-60 transition-opacity">{expert.categoria}</Link>
              <span className="mx-2 opacity-40">|</span>
              <span className="font-semibold">{expert.nome}</span>
            </nav>

            {/* 2. Galeria */}
            <div className="relative overflow-hidden rounded-3xl" style={{ height: 410 }}>
              <div className="flex gap-8 h-full" style={{ width: "max-content" }}>
                <div className="relative flex-shrink-0 rounded-3xl overflow-hidden" style={{ width: 335, height: 410 }}>
                  <Image
                    src={`/mentors/${expert.slug}/profile.webp`}
                    alt={expert.nome}
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="335px"
                  />
                </div>
                <div className="relative flex-shrink-0 rounded-3xl overflow-hidden" style={{ width: 335, height: 410 }}>
                  <Image
                    src={`/mentors/${expert.slug}/work.webp`}
                    alt={`Trabalho de ${expert.nome}`}
                    fill
                    className="object-cover object-center"
                    sizes="335px"
                  />
                </div>
              </div>
            </div>

            {/* 3. Header do creator */}
            <div className="flex items-start justify-between gap-4">
              {/* Nome + bio */}
              <div style={{ maxWidth: 237 }}>
                <h1
                  className="font-normal leading-tight mb-2"
                  style={{ fontSize: 30, color: "#181D27" }}
                >
                  {expert.nome}
                </h1>
                <p style={{ fontSize: 16, color: "#181D27", lineHeight: "24px" }}>
                  {expert.bio}
                </p>
              </div>

              {/* Rating badge */}
              <div
                className="flex items-center gap-1.5 flex-shrink-0"
                style={{
                  background: "#E7DAC8",
                  borderRadius: 999,
                  padding: "12px 16px",
                }}
              >
                <IconStar className="w-5 h-5" style={{ color: "#181D27" }} />
                <span className="font-bold" style={{ fontSize: 16, color: "#181D27" }}>
                  {expert.rating.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: "#414651" }}>
                  ({expert.sessoes})
                </span>
              </div>
            </div>

            {/* 4. Badge de doação */}
            {expert.doacao && (
              <div
                className="inline-flex items-center gap-2 self-start"
                style={{
                  background: "#CEFD58",
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#181D27",
                }}
              >
                🤝 Impacto Social — doe o que ganha
              </div>
            )}

            {/* 5. Social icons */}
            <div className="flex items-center gap-4" style={{ color: "#181D27" }}>
              <a href="#" aria-label="Instagram" className="hover:opacity-60 transition-opacity">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:opacity-60 transition-opacity">
                <LinkedInIcon />
              </a>
            </div>

            {/* 5. Sobre */}
            <div className="flex flex-col gap-4">
              <h2
                className="font-normal"
                style={{ fontSize: 24, color: "#181D27" }}
              >
                Sobre
              </h2>
              <p style={{ fontSize: 16, color: "#181D27", lineHeight: "28px" }}>
                {expert.bio}
              </p>
            </div>

            {/* 6. Avaliações */}
            <div className="flex flex-col gap-8">
              <h2
                className="font-normal"
                style={{ fontSize: 24, color: "#181D27" }}
              >
                Avaliações
              </h2>

              <div className="flex flex-col gap-6">
                {avaliacoesMock.map((av) => (
                  <div
                    key={av.nome}
                    className="flex flex-col gap-4"
                    style={{
                      background: "#FCFBF8",
                      borderRadius: 16,
                      padding: 32,
                    }}
                  >
                    {/* Header do review */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold" style={{ fontSize: 16, color: "#181D27" }}>
                          {av.nome}
                        </span>
                        <span style={{ fontSize: 14, color: "#181D27" }}>
                          {av.data}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconStar className="w-4 h-4" style={{ color: "#181D27" }} />
                        <span className="font-bold" style={{ fontSize: 16, color: "#181D27" }}>
                          {av.nota}.0
                        </span>
                      </div>
                    </div>
                    {/* Texto */}
                    <p style={{ fontSize: 16, color: "#181D27", lineHeight: "28px" }}>
                      {av.texto}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ver todas */}
              <div className="flex justify-center">
                <button
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-70"
                  style={{
                    outline: "1px solid #414651",
                    color: "#414651",
                    background: "transparent",
                    fontSize: 16,
                    padding: "10px 18px",
                  }}
                >
                  Ver todas
                </button>
              </div>
            </div>

          </div>

          {/* ══════════════ BOOKING CARD (sticky) ══════════════ */}
          <div className="sticky top-24">
            <BookingSidebar expert={expert} />
          </div>

        </div>
      </div>
    </div>
  );
}
