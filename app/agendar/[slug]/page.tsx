import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/creators";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/BookingFlow";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WaitlistModalProvider } from "@/components/WaitlistModalProvider";
import { LAUNCH_PHASE } from "@/lib/launch";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ duracao?: string }>;
};

export default async function AgendarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { duracao } = await searchParams;

  const creator = await getCreatorBySlug(slug);
  if (!creator) notFound();
  if (creator.offers.length === 0) notFound();

  const requested = duracao ? Number(duracao) : null;
  // Middle offer when the count is odd; the first of the two middles otherwise
  // (same formula as BookingCta.defaultDuration on the creator page).
  const offer =
    creator.offers.find((o) => o.durationMinutes === requested) ??
    creator.offers[Math.floor((creator.offers.length - 1) / 2)];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initialUser = user
    ? { id: user.id, name: (user.user_metadata?.name as string | undefined) ?? user.email?.split("@")[0] ?? "" }
    : null;

  return (
    <BookingFlow
      key={creator.id}
      creator={creator}
      offer={offer}
      initialUser={initialUser}
      header={<WaitlistModalProvider phase={LAUNCH_PHASE}><Header phase={LAUNCH_PHASE} /></WaitlistModalProvider>}
      footer={<WaitlistModalProvider phase={LAUNCH_PHASE}><Footer phase={LAUNCH_PHASE} /></WaitlistModalProvider>}
    />
  );
}
