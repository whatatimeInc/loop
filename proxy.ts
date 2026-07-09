import { type NextRequest, NextResponse } from "next/server";

// ── Basic Auth (staging gate) ──────────────────────────────────────────────
const BA_USER = process.env.BASIC_AUTH_USER ?? "";
const BA_PASS = process.env.BASIC_AUTH_PASS ?? "";

function requireBasicAuth(request: NextRequest): NextResponse | null {
  if (!BA_USER || !BA_PASS) return null; // disabled if env vars not set
  const auth = request.headers.get("authorization") ?? "";
  if (auth.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const colon = decoded.indexOf(":");
    const user = decoded.slice(0, colon);
    const pass = decoded.slice(colon + 1);
    if (user === BA_USER && pass === BA_PASS) return null; // ok
  }
  return new NextResponse("Acesso restrito", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Loop Talk"' },
  });
}

// ── Phase flag ─────────────────────────────────────────────────────────────
// One central check. No component should branch on LAUNCH_PHASE.
const LAUNCH_PHASE = process.env.LAUNCH_PHASE === "post" ? "post" : "pre";

// ── Route constants ────────────────────────────────────────────────────────
const WAITLIST_PREFIX = "/waitlist";

// Routes that require auth in post-launch
const PROTEGIDAS = [
  "/conta",
  "/criar",
  "/dashboard",
  "/agenda",
  "/sala",
  "/avaliar",
  "/confirmacao",
];

export function proxy(request: NextRequest) {
  const authResponse = requireBasicAuth(request);
  if (authResponse) return authResponse;

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
  const temSessao = request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token") && !c.name.includes("-code-verifier")
  );

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
