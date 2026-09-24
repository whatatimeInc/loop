import { test } from "node:test";
import assert from "node:assert/strict";
import { deleteDailyRoom } from "./daily.ts";

// env() reads process.env once; give it a complete configuration before the
// first call so dailyHeaders() has a key to send.
Object.assign(process.env, {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_xxx",
  NEXT_PUBLIC_SITE_URL: "https://loop.example.com",
  SUPABASE_SECRET_KEY: "sb_secret_xxx",
  DAILY_CO_API_KEY: "daily-key",
  DAILY_WEBHOOK_SECRET: "c2VjcmV0LXNlY3JldC1zZWNyZXQtc2VjcmV0LTMyYg==",
  LAUNCH_PHASE: "post",
});

function responseWithBody(status: number) {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"deleted":true}'));
    },
    cancel() {
      cancelled = true;
    },
  });
  return { response: new Response(body, { status }), wasCancelled: () => cancelled };
}

for (const status of [200, 404]) {
  test(`deleteDailyRoom releases the response body on ${status} so the socket goes back to the pool`, async () => {
    const { response, wasCancelled } = responseWithBody(status);
    const original = globalThis.fetch;
    globalThis.fetch = async () => response;
    try {
      await deleteDailyRoom("looptalk-test");
    } finally {
      globalThis.fetch = original;
    }
    assert.equal(wasCancelled(), true);
  });
}
