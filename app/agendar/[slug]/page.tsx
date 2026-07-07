import { notFound } from "next/navigation";
import { experts } from "@/lib/mockExperts";
import { BookingFlow } from "@/components/BookingFlow";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ duracao?: string }>;
};

export function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}

export default async function AgendarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { duracao } = await searchParams;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  const duracaoInicial = duracao ? parseInt(duracao) : (expert.duracoes[0] ?? 60);

  return (
    <BookingFlow
      expert={expert}
      duracaoInicial={duracaoInicial}
      header={<Header />}
      footer={<Footer />}
    />
  );
}
