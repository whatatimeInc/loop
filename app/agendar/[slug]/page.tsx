import { notFound } from "next/navigation";
import { experts } from "@/lib/mockExperts";
import { BookingFlow } from "@/components/BookingFlow";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experts.map((e) => ({ slug: e.slug }));
}

export default async function AgendarPage({ params }: Props) {
  const { slug } = await params;
  const expert = experts.find((e) => e.slug === slug);
  if (!expert) notFound();

  return <BookingFlow expert={expert} />;
}
