import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { experts } from "@/lib/mockExperts";
import { BookingFlow } from "@/components/BookingFlow";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}

export default async function Agendar({ params }: Props) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  return (
    <div className="min-h-screen bg-cream">
      {/* Barra superior com contexto do mentor */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link href={`/${expert.slug}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={`/mentors/${expert.slug}/profile.webp`}
                alt={expert.nome}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:underline">
                {expert.nome}
              </p>
              <p className="text-xs text-gray-500">{expert.categoria}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Flow principal */}
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-20">
        <BookingFlow expert={expert} />
      </div>
    </div>
  );
}
