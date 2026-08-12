import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "@/components/HeaderClient";
import type { LaunchPhase } from "@/lib/launch";

export async function Header({ phase }: { phase: LaunchPhase }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <HeaderClient isLoggedIn={!!user} phase={phase} />;
}
