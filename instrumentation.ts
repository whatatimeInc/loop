// Next.js instrumentation hook: `register` runs once when a server instance
// starts (not during `next build`), before the first request is served.
//
// Next compiles this file for both the Node and the Edge runtime, so each
// branch only loads its own module: the Node half (env gate + server Sentry)
// stays out of the edge bundle, and the edge half stays tiny.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
    return;
  }
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registerNode } = await import("./instrumentation-node");
  await registerNode();
}

// Every error Next catches on the server — Server Components, route handlers,
// proxy — lands here with the route it came from. This is the path the card's
// acceptance test exercises: a throw in a server page must reach Sentry.
export const onRequestError = Sentry.captureRequestError;
