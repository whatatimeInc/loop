import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "@/components/HeaderClient";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <HeaderClient isLoggedIn={!!user} />;
}
