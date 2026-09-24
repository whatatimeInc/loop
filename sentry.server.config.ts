// Sentry for the Node.js runtime (route handlers, Server Components, proxy).
// Loaded from instrumentation.ts after the env gate passed, so the DSN read
// here is already validated. Without a DSN the SDK initialises disabled and
// every capture becomes a no-op — there is no separate "off" switch to forget.
import * as Sentry from "@sentry/nextjs";
import { SENTRY_BASE_OPTIONS } from "./lib/sentry-options";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  ...SENTRY_BASE_OPTIONS,
});
