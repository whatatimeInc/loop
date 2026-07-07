import { type Metadata } from "next";
import { LandingClient } from "./LandingClient";

export const metadata: Metadata = {
  title: "Loop.Talk — Em breve",
  description: "Entre na lista de espera e seja um dos primeiros a acessar.",
};

type Props = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function WaitlistPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  return <LandingClient referralCode={ref} />;
}
