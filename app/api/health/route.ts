import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/health";
import { reportError } from "@/lib/report";
import { createServiceClient } from "@/lib/supabase/service";

// Liveness for external monitors: 200 only after a real Supabase round trip.
// Never cached, never static — a stale 200 is worse than none.
export const dynamic = "force-dynamic";

async function pingSupabase(): Promise<void> {
  // The service client throws before any network call if its env is missing;
  // checkHealth turns that into a 503 query_failed rather than a crash.
  const { error } = await createServiceClient().from("profiles").select("id").limit(1);
  if (error) throw new Error(`${error.code ?? "unknown"}: ${error.message}`);
}

export async function GET() {
  const { status, body } = await checkHealth({ ping: pingSupabase, report: reportError });
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
