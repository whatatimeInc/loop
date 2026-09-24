// The one way server code reports a failure it is about to swallow or answer
// with a 5xx. It always writes to the console (Vercel's function logs keep
// working) and then hands the error to the capture function — Sentry in
// production, a fake in tests. It never throws: an error reporter that can
// itself take a request down is worse than no reporter.
//
// The pure factory lives here; the Sentry-bound instance is in lib/report.ts so
// unit tests never load the Sentry SDK.

export type CaptureHint = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export type CaptureFn = (error: Error, hint: CaptureHint) => unknown;
export type LogFn = (...args: unknown[]) => void;

export type ErrorReporter = (where: string, error: unknown, extra?: Record<string, unknown>) => void;

function messageOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "message" in value && typeof value.message === "string") {
    return value.message;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Sentry renders a non-Error value as "Object captured as exception" with a
 * synthetic stack. Supabase and Resend return plain objects, so those are
 * wrapped in a real Error carrying the tag and message; the raw value rides
 * along as `extra.raw`.
 */
export function toError(where: string, value: unknown): { error: Error; raw?: unknown } {
  if (value instanceof Error) return { error: value };
  return { error: new Error(`${where}: ${messageOf(value)}`), raw: value };
}

export type ReporterDeps = {
  capture: CaptureFn;
  log: LogFn;
  /**
   * Pushes queued events to the transport. `capture` only enqueues; on a
   * serverless host the invocation can be frozen before the envelope leaves,
   * which is exactly the case for reports made inside `after()`.
   */
  flush?: () => Promise<unknown>;
  /** Extends the invocation's lifetime until the task settles (Vercel's waitUntil). */
  keepAlive?: (task: Promise<unknown>) => void;
};

export function createErrorReporter({ capture, log: rawLog, flush, keepAlive }: ReporterDeps): ErrorReporter {
  // Logging is the last resort, so a log function that itself throws (a closed
  // stream, a wrapped console) is swallowed here rather than escaping.
  const log: LogFn = (...args) => {
    try {
      rawLog(...args);
    } catch {
      // Nothing left to report to.
    }
  };
  return (where, value, extra) => {
    log(`[${where}]`, value);
    try {
      const { error, raw } = toError(where, value);
      const merged: Record<string, unknown> | undefined =
        raw === undefined ? extra : { ...(extra ?? {}), raw };
      capture(error, { tags: { where }, ...(merged ? { extra: merged } : {}) });
      if (flush) {
        // The kept promise never rejects: a failing flush must not become an
        // unhandled rejection in the runtime that is keeping us alive.
        const settled = flush().then(
          () => undefined,
          (flushFailure) => { log("[report-error] flush failed", flushFailure); },
        );
        keepAlive?.(settled);
      }
    } catch (captureFailure) {
      log("[report-error] capture failed", captureFailure);
    }
  };
}
