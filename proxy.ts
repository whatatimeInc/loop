import { type NextRequest, NextResponse } from "next/server";

// ── Phase flag ─────────────────────────────────────────────────────────────
// One central check. No component should branch on LAUNCH_PHASE.
const LAUNCH_PHASE = process.env.LAUNCH_PHASE === "post" ? "post" : "pre";

// ── Route constants ────────────────────────────────────────────────────────
const WAITLIST_PREFIX = "/waitlist";

// Routes that require auth in post-launch
const PROTEGIDAS = [
  "/conta",
  "/dashboard",
  "/agenda",
  "/sala",
  "/avaliar",
  "/confirmacao",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── PRE-LAUNCH: only waitlist surface is public ──────────────────────────
  if (LAUNCH_PHASE === "pre") {
    if (pathname === "/") {
      // Rewrite / → /waitlist internally; URL stays as / for the user
      const dest = request.nextUrl.clone();
      dest.pathname = "/waitlist";
      return NextResponse.rewrite(dest);
    }

    if (!pathname.startsWith(WAITLIST_PREFIX)) {
      // Every other path → back to /
      return NextResponse.redirect(new URL("/", request.url));
    }

    // /waitlist and /waitlist/* → let through
    return NextResponse.next();
  }

  // ── POST-LAUNCH: deactivate waitlist routes ──────────────────────────────
  if (pathname.startsWith(WAITLIST_PREFIX)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── POST-LAUNCH: auth-protected routes ──────────────────────────────────
  const temSessao = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  const eProtegida = PROTEGIDAS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (eProtegida && !temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (temSessao && (pathname === "/login" || pathname === "/signup" || pathname === "/cadastro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/explorar";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
