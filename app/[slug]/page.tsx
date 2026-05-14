import Image from "next/image";
import { notFound } from "next/navigation";
import { experts } from "@/lib/mockExperts";
import { BookingSidebar } from "@/components/BookingSidebar";
import { IconStar, IconShare, IconCheck } from "@/components/icons";
import { LinkButton } from "@/components/ui/Button";
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
    texto: "Sessão incrível. Sai com clareza total sobre o próximo passo na carreira.",
    data: "Mar 2025",
  },
  {
    nome: "Lucas M.",
    nota: 5,
    texto: "Direto ao ponto, sem enrolação. Valeu cada centavo.",
    data: "Fev 2025",
  },
  {
    nome: "Camila T.",
    nota: 5,
    texto: "Esperava muito e superou. A experiência prática fez toda a diferença.",
    data: "Jan 2025",
  },
];

export default async function PerfilMentor({ params }: Props) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  return (
    <div className="min-h-screen bg-cream">

      {/* ======== HERO ======== */}
      <section className="relative h-[420px] md:h-[520px]">
        <Image
          src={`/mentors/${expert.slug}/work.webp`}
          alt={`Foto de ${expert.nome}`}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradiente escuro de baixo */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

        {/* Botão compartilhar */}
        <button
          className="absolute top-24 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Compartilhar perfil"
        >
          <IconShare className="w-5 h-5 text-white" />
        </button>

        {/* Info no rodapé do hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8 flex items-end gap-5">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white flex-shrink-0 shadow-soft">
            <Image
              src={`/mentors/${expert.slug}/profile.webp`}
              alt={expert.nome}
              fill
              className="object-cover object-top"
              sizes="96px"
            />
          </div>
          {/* Nome e categoria */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight">
                {expert.nome}
              </h1>
              <span className="w-5 h-5 rounded-full bg-lime flex items-center justify-center flex-shrink-0">
                <IconCheck className="w-3 h-3 text-dark" />
              </span>
            </div>
            <span className="text-gray-300 text-sm">{expert.categoria}</span>
          </div>
        </div>
      </section>

      {/* ======== CONTEÚDO ======== */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-[1fr_360px] gap-10 items-start">

          {/* ——— COLUNA ESQUERDA ——— */}
          <div className="space-y-10">

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{expert.sessoes}</p>
                <p className="text-xs text-gray-500 mt-0.5">sessões realizadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{expert.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-0.5">avaliação média</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-xs text-gray-500 mt-0.5">taxa de resposta</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">72%</p>
                <p className="text-xs text-gray-500 mt-0.5">clientes recorrentes</p>
              </div>
            </div>

            {/* Scarcity */}
            {expert.scarcity && (
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {expert.scarcity}
              </div>
            )}

            {/* Sobre */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre</h2>
              <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
            </div>

            {/* O que você pode esperar */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                O que você pode esperar
              </h2>
              <ul className="space-y-3">
                {[
                  "Sessão 100% focada na sua dúvida ou desafio",
                  "Feedback direto e acionável, sem rodeios",
                  "Acesso à experiência real, não a teoria",
                  "Gravação disponível após a sessão",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 rounded-full bg-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconCheck className="w-3 h-3 text-dark" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Avaliações */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Avaliações</h2>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <IconStar
                      key={i}
                      className={`w-4 h-4 ${
                        i <= Math.round(expert.rating)
                          ? "text-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">
                    {expert.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {avaliacoesMock.map((av) => (
                  <div
                    key={av.nome}
                    className="bg-white rounded-2xl border border-gray-200 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {av.nome[0]}
                        </div>
                        <span className="font-medium text-sm text-gray-900">
                          {av.nome}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{av.data}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <IconStar
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i <= av.nota ? "text-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {av.texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ——— COLUNA DIREITA (sticky) ——— */}
          <div className="md:sticky md:top-24">
            <BookingSidebar expert={expert} />
            <p className="text-center text-xs text-gray-400 mt-4">
              Compartilhe este perfil
            </p>
            <div className="flex justify-center mt-2">
              <LinkButton href={`/${expert.slug}`} variant="ghost" size="sm">
                <IconShare className="w-4 h-4 mr-1.5" />
                face.talk/{expert.slug}
              </LinkButton>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
