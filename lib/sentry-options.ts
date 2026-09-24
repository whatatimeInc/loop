// Options shared by the three Sentry inits (server, edge, browser). Pure data,
// no imports: this file is bundled into all three runtimes.
//
// Sentry 11 collects request data by default and no longer has the single
// `sendDefaultPii` switch. The subset below is what we are willing to send
// without a privacy review: no user identity or IP, no cookies, no request or
// response bodies (the set-password route posts a password), no local
// variables from stack frames. Headers stay on — the SDK strips authorization
// and cookie headers itself — because the route and host are what make an
// event actionable.
// Typed by inference on purpose: the SDK's `DataCollection` type lives in the
// @sentry/core copy nested under @sentry/nextjs, not the top-level one.
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpBodies: [],
  stackFrameVariables: false,
};

export const SENTRY_BASE_OPTIONS = {
  // Errors only. Performance tracing is a separate decision with its own cost.
  tracesSampleRate: 0,
  dataCollection: SENTRY_DATA_COLLECTION,
};

/**
 * The DSN as the SDK must see it. `validateEnv` accepts a padded value (it
 * trims before parsing), but the SDK's DSN regex is anchored and does not
 * trim, so a pasted DSN with a stray newline would silently disable
 * reporting while `enabled` stayed true. Blank means unset.
 */
export function sentryDsn(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}
