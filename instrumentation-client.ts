// Browser-side Sentry. Runs before the app hydrates. NEXT_PUBLIC_SENTRY_DSN is
// inlined at build time, so an unset DSN means a disabled SDK in the bundle.
import * as Sentry from "@sentry/nextjs";
import { SENTRY_BASE_OPTIONS, sentryDsn } from "./lib/sentry-options";

const dsn = sentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  ...SENTRY_BASE_OPTIONS,
});

// Lets Sentry name client-side navigations in breadcrumbs.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
