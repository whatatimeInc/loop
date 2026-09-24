// Server-side error reporter bound to Sentry. Without NEXT_PUBLIC_SENTRY_DSN
// the SDK is initialised disabled and captureException is a no-op, so this is
// safe to call from any route in any environment.
// After each capture the queue is flushed (2 s budget, the same the SDK gives
// its own captureRequestError) and the flush is handed to Vercel's waitUntil,
// so a report made inside `after()` still leaves before the invocation freezes.
import * as Sentry from "@sentry/nextjs";
import { createErrorReporter, type ErrorReporter } from "./report-error";
import { vercelWaitUntil } from "./wait-until";

export const reportError: ErrorReporter = createErrorReporter({
  capture: (error, hint) => Sentry.captureException(error, hint),
  log: console.error,
  flush: () => Sentry.flush(2000),
  keepAlive: vercelWaitUntil,
});
