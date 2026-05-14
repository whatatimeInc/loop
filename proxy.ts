import { type NextRequest, NextResponse } from "next/server";

// Rotas que exigem sessão ativa
const PROTEGIDAS = ["/dashboard", "/agenda", "/criar", "/sala", "/avaliar", "/confirmacao"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase seta cookies com prefixo "sb-"
  const temSessao = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  const eProtegida = PROTEGIDAS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (eProtegida && !temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (temSessao && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/explorar";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
