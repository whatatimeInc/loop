import { type NextRequest, NextResponse } from "next/server";
import { LAUNCH_PHASE } from "@/lib/launch";
import { env } from "@/lib/env";
import { isPreLaunchPublicPath, WAITLIST_PREFIX } from "@/lib/pre-launch";

// ── Basic Auth (staging gate) ──────────────────────────────────────────────
function requireBasicAuth(request: NextRequest): NextResponse | null {
  // Both unset = gate disabled (production). A half-set pair is refused at startup.
  const { BASIC_AUTH_USER: BA_USER, BASIC_AUTH_PASS: BA_PASS } = env();
  if (!BA_USER || !BA_PASS) return null;
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

// ── Route constants ────────────────────────────────────────────────────────
// Routes that require auth in post-launch
const PROTEGIDAS = [
  "/conta",
  "/criar",
  "/dashboard",
  "/agenda",
  "/sala",
  "/avaliar",
  "/confirmacao",
  "/admin",
];

export function proxy(request: NextRequest) {
  const authResponse = requireBasicAuth(request);
  if (authResponse) return authResponse;

  const { pathname } = request.nextUrl;

  // ── PRE-LAUNCH: home nova (com CTAs de waitlist) + landing antiga em
  // /waitlist, ambas públicas, mais o health check para monitores externos.
  // Tudo mais volta pra / ─────────────────────────────────────────────────
  if (LAUNCH_PHASE === "pre") {
    if (isPreLaunchPublicPath(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
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
