import { redirect } from "next/navigation";

type Props = { params: Promise<{ bookingId: string }> };

// Checkout foi desativado: o pagamento está fora do escopo desta fase.
export default async function CheckoutPage({ params }: Props) {
  const { bookingId } = await params;
  redirect(`/confirmacao/${bookingId}`);
}
