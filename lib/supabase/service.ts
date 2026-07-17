// Server-side only — never import from client components.
// Uses the service-role key to bypass RLS for trusted server operations.
import { createServerClient } from "@supabase/ssr";

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
