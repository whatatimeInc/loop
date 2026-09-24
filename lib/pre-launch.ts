// Pure path rules for the pre-launch phase, kept out of proxy.ts so they can
// be tested under node:test (proxy.ts imports next/server and the `@/` alias).
//
// With LAUNCH_PHASE=pre everything redirects to the home page except the home
// page itself, the waitlist landing and its own API, and the health check —
// a monitor must be able to reach /api/health before the launch flag flips.

export const WAITLIST_PREFIX = "/waitlist";
export const HEALTH_PATH = "/api/health";

export function isPreLaunchPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith(WAITLIST_PREFIX)) return true;
  return pathname === HEALTH_PATH;
}
