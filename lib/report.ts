// Server-side error reporter bound to Sentry. Without NEXT_PUBLIC_SENTRY_DSN
// the SDK is initialised disabled and captureException is a no-op, so this is
// safe to call from any route in any environment.
import * as Sentry from "@sentry/nextjs";
import { createErrorReporter, type ErrorReporter } from "./report-error";

export const reportError: ErrorReporter = createErrorReporter({
  capture: (error, hint) => Sentry.captureException(error, hint),
  log: console.error,
});
