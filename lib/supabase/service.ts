// Server-side only — never import from client components.
// Uses the service-role key to bypass RLS for trusted server operations.
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createServiceClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY } = env();
  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
