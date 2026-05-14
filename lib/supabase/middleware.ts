import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Atualiza a sessão — não remova esta linha
  const { data: { user } } = await supabase.auth.getUser();

  // Rotas protegidas: redireciona para login se não autenticado
  const protegidas = ["/dashboard", "/agenda", "/criar", "/sala", "/avaliar", "/confirmacao"];
  const pathname = request.nextUrl.pathname;
  const eProtegida = protegidas.some((p) => pathname.startsWith(p));

  if (eProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Se autenticado e tentando acessar login/signup → redireciona
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/explorar";
    return NextResponse.redirect(url);
  }

  return response;
}
