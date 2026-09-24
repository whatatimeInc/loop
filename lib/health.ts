// Health check logic, pure and injectable. The route in app/api/health builds
// the ping from the Supabase service client; here we only decide what a
// resolved, rejected or overdue ping means and never let a raw error message
// leak into the response body — the raw error goes to the reporter, which is
// what turns a failing health check into an alert.

export const DEFAULT_HEALTH_TIMEOUT_MS = 4000;

export type HealthReason = "query_failed" | "timeout";

export type HealthBody = {
  ok: boolean;
  checkedAt: string;
  /** `reason` is present only on failure; success has no reason key at all. */
  supabase: { ok: boolean; latencyMs: number; reason?: HealthReason };
};

export type HealthResult = { status: 200 | 503; body: HealthBody };

export type HealthOptions = {
  /** Resolves only after a real round trip to Supabase; rejects on any error. */
  ping: () => Promise<void>;
  /** Receives the raw failure; the route passes lib/report's reportError. */
  report: (where: string, error: unknown) => void;
  timeoutMs?: number;
  now?: () => Date;
  /** Monotonic clock in milliseconds (performance.now by default). */
  elapsed?: () => number;
};

export async function checkHealth(options: HealthOptions): Promise<HealthResult> {
  const {
    ping,
    report,
    timeoutMs = DEFAULT_HEALTH_TIMEOUT_MS,
    now = () => new Date(),
    elapsed = () => performance.now(),
  } = options;
  const checkedAt = now().toISOString();
  const start = elapsed();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const overdue = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  const failed = (reason: HealthReason): HealthResult => ({
    status: 503,
    body: { ok: false, checkedAt, supabase: { ok: false, latencyMs: Math.round(elapsed() - start), reason } },
  });
  try {
    // Promise.resolve().then(ping) turns a synchronous throw into a rejection.
    const outcome = await Promise.race([Promise.resolve().then(ping).then(() => "ok" as const), overdue]);
    if (outcome === "timeout") {
      report("api/health", new Error(`Supabase round trip exceeded ${timeoutMs} ms`));
      return failed("timeout");
    }
    return {
      status: 200,
      body: { ok: true, checkedAt, supabase: { ok: true, latencyMs: Math.round(elapsed() - start) } },
    };
  } catch (error) {
    report("api/health", error);
    return failed("query_failed");
  } finally {
    clearTimeout(timer);
  }
}
