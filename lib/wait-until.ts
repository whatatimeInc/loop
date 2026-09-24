// Vercel freezes a serverless invocation as soon as the response is sent
// unless work is registered through the request context's `waitUntil`. Next's
// `after()` uses it; Sentry's own `captureRequestError` uses it; the SDK does
// not export it, so the lookup is vendored here (same shape as
// @vercel/functions). Anywhere else the context is absent and this is a no-op.

type RequestContext = { waitUntil?: (task: Promise<unknown>) => void };
type RequestContextGlobal = { get?: () => RequestContext | undefined };

const CONTEXT_KEY = Symbol.for("@vercel/request-context");

export function vercelWaitUntil(task: Promise<unknown>): void {
  const holder = (globalThis as unknown as Record<symbol, RequestContextGlobal | undefined>)[CONTEXT_KEY];
  const ctx = holder?.get?.();
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(task);
}
