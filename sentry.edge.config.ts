// Sentry for the edge runtime. Nothing in the app runs on edge today (proxy.ts
// is Node in Next 16), but Next still bundles instrumentation.ts for it, so the
// init must exist and must not pull in Node-only modules.
import * as Sentry from "@sentry/nextjs";
import { SENTRY_BASE_OPTIONS } from "./lib/sentry-options";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  ...SENTRY_BASE_OPTIONS,
});
